package test

import (
	"context"
	"database/sql"
	"encoding/json"
	"errors"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"

	authhttp "pino-portal/internal/delivery/http"
	"pino-portal/internal/domain"
	"pino-portal/internal/repository"
	"pino-portal/internal/service"
	"pino-portal/internal/utils"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
	"golang.org/x/crypto/bcrypt"
)

type authUserRepositoryStub struct {
	user       domain.User
	findError  error
	findCalled bool
}

func (s *authUserRepositoryStub) Save(context.Context, *sql.Tx, domain.User) (domain.User, error) {
	return domain.User{}, errors.New("not implemented")
}

func (s *authUserRepositoryStub) FindByUsername(_ context.Context, _ repository.Queryer, _ string) (domain.User, error) {
	s.findCalled = true
	return s.user, s.findError
}

func (s *authUserRepositoryStub) FindByID(context.Context, repository.Queryer, int) (domain.User, error) {
	return domain.User{}, errors.New("not implemented")
}

func (s *authUserRepositoryStub) FindAll(context.Context, repository.Queryer) ([]domain.User, error) {
	return nil, errors.New("not implemented")
}

func (s *authUserRepositoryStub) Update(context.Context, *sql.Tx, domain.User) (domain.User, error) {
	return domain.User{}, errors.New("not implemented")
}

func (s *authUserRepositoryStub) Delete(context.Context, *sql.Tx, int) (domain.User, error) {
	return domain.User{}, errors.New("not implemented")
}

type authServiceStub struct {
	registerError error
	loginResponse domain.LoginResponse
	loginError    error
}

func (s *authServiceStub) Register(context.Context, domain.RegisterRequest) error {
	return s.registerError
}

func (s *authServiceStub) Login(context.Context, domain.LoginRequest) (domain.LoginResponse, error) {
	return s.loginResponse, s.loginError
}

func TestAuthServiceRegisterRejectsInvalidRequest(t *testing.T) {
	repo := &authUserRepositoryStub{}
	authService := service.NewAuthService(repo, nil)

	err := authService.Register(context.Background(), domain.RegisterRequest{
		Username: "ab",
		Password: "short",
	})

	require.Error(t, err)
	assert.Contains(t, err.Error(), "Validasi gagal")
	assert.False(t, repo.findCalled)
}

func TestAuthServiceLoginReturnsTokenAndRoleForValidCredentials(t *testing.T) {
	passwordHash, err := bcrypt.GenerateFromPassword([]byte("secret123"), bcrypt.MinCost)
	require.NoError(t, err)

	repo := &authUserRepositoryStub{
		user: domain.User{
			ID:           42,
			Username:     "pino",
			PasswordHash: string(passwordHash),
			Role:         "admin",
		},
	}
	authService := service.NewAuthService(repo, nil)

	response, err := authService.Login(context.Background(), domain.LoginRequest{
		Username: "pino",
		Password: "secret123",
	})

	require.NoError(t, err)
	assert.Equal(t, "admin", response.Role)
	assert.NotEmpty(t, response.Token)
	assert.True(t, repo.findCalled)

	claims, err := utils.ValidateToken(response.Token)
	require.NoError(t, err)
	assert.Equal(t, 42, claims.UserID)
	assert.Equal(t, "admin", claims.Role)
}

func TestAuthServiceLoginRejectsUnknownUserAndWrongPassword(t *testing.T) {
	t.Run("unknown user", func(t *testing.T) {
		authService := service.NewAuthService(&authUserRepositoryStub{
			findError: errors.New("user tidak ditemukan"),
		}, nil)

		_, err := authService.Login(context.Background(), domain.LoginRequest{
			Username: "missing",
			Password: "secret123",
		})

		assert.EqualError(t, err, "Username atau password salah")
	})

	t.Run("wrong password", func(t *testing.T) {
		passwordHash, err := bcrypt.GenerateFromPassword([]byte("secret123"), bcrypt.MinCost)
		require.NoError(t, err)

		authService := service.NewAuthService(&authUserRepositoryStub{
			user: domain.User{PasswordHash: string(passwordHash)},
		}, nil)

		_, err = authService.Login(context.Background(), domain.LoginRequest{
			Username: "pino",
			Password: "incorrect",
		})

		assert.EqualError(t, err, "Username atau password salah")
	})
}

func TestAuthControllerLoginReturnsUnauthorizedForInvalidPayload(t *testing.T) {
	controller := authhttp.NewAuthController(&authServiceStub{})
	request := httptest.NewRequest(http.MethodPost, "/login", strings.NewReader("{"))
	response := httptest.NewRecorder()

	controller.Login(response, request)

	assert.Equal(t, http.StatusBadRequest, response.Code)
	assert.JSONEq(t, `{"error":"Payload tidak valid"}`, response.Body.String())
}

func TestAuthControllerLoginReturnsLoginResponse(t *testing.T) {
	controller := authhttp.NewAuthController(&authServiceStub{
		loginResponse: domain.LoginResponse{Token: "token", Role: "user"},
	})
	request := httptest.NewRequest(
		http.MethodPost,
		"/login",
		strings.NewReader(`{"username":"pino","password":"secret123"}`),
	)
	response := httptest.NewRecorder()

	controller.Login(response, request)

	assert.Equal(t, http.StatusOK, response.Code)
	var body domain.LoginResponse
	require.NoError(t, json.NewDecoder(response.Body).Decode(&body))
	assert.Equal(t, domain.LoginResponse{Token: "token", Role: "user"}, body)
}

func TestAuthMiddlewareRejectsMissingTokenAndForbiddenRole(t *testing.T) {
	next := http.HandlerFunc(func(http.ResponseWriter, *http.Request) {
		t.Fatal("next handler should not be called")
	})
	handler := authhttp.AuthMiddleware("admin")(next)

	t.Run("missing bearer token", func(t *testing.T) {
		request := httptest.NewRequest(http.MethodGet, "/", nil)
		response := httptest.NewRecorder()

		handler.ServeHTTP(response, request)

		assert.Equal(t, http.StatusUnauthorized, response.Code)
	})

	t.Run("forbidden role", func(t *testing.T) {
		token, err := utils.GenerateToken(42, "user")
		require.NoError(t, err)
		request := httptest.NewRequest(http.MethodGet, "/", nil)
		request.Header.Set("Authorization", "Bearer "+token)
		response := httptest.NewRecorder()

		handler.ServeHTTP(response, request)

		assert.Equal(t, http.StatusForbidden, response.Code)
	})
}

func TestAuthMiddlewareAddsUserClaimsToContext(t *testing.T) {
	token, err := utils.GenerateToken(42, "admin")
	require.NoError(t, err)

	next := http.HandlerFunc(func(writer http.ResponseWriter, request *http.Request) {
		userID, role, ok := utils.AuthContext(writer, request)
		require.True(t, ok)
		assert.Equal(t, 42, userID)
		assert.Equal(t, "admin", role)
	})
	handler := authhttp.AuthMiddleware("admin")(next)
	request := httptest.NewRequest(http.MethodGet, "/", nil)
	request.Header.Set("Authorization", "Bearer "+token)
	response := httptest.NewRecorder()

	handler.ServeHTTP(response, request)

	assert.Equal(t, http.StatusOK, response.Code)
}

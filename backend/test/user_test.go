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
	"time"

	userhttp "pino-portal/internal/delivery/http"
	"pino-portal/internal/domain"
	"pino-portal/internal/repository"
	"pino-portal/internal/service"
	"pino-portal/internal/utils"

	"github.com/go-chi/chi/v5"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

type userRepositoryStub struct {
	users         []domain.User
	user          domain.User
	findAllError  error
	findByIDError error
	findByIDCalls int
	findAllCalls  int
	deleteCalls   int
}

func (s *userRepositoryStub) Save(context.Context, *sql.Tx, domain.User) (domain.User, error) {
	return domain.User{}, errors.New("not implemented")
}

func (s *userRepositoryStub) FindByUsername(context.Context, repository.Queryer, string) (domain.User, error) {
	return domain.User{}, errors.New("not implemented")
}

func (s *userRepositoryStub) FindByID(context.Context, repository.Queryer, int) (domain.User, error) {
	s.findByIDCalls++
	return s.user, s.findByIDError
}

func (s *userRepositoryStub) FindAll(context.Context, repository.Queryer) ([]domain.User, error) {
	s.findAllCalls++
	return s.users, s.findAllError
}

func (s *userRepositoryStub) Update(context.Context, *sql.Tx, domain.User) (domain.User, error) {
	return domain.User{}, errors.New("not implemented")
}

func (s *userRepositoryStub) Delete(context.Context, *sql.Tx, int) (domain.User, error) {
	s.deleteCalls++
	return s.user, nil
}

type userServiceStub struct {
	createResponse domain.UserResponse
	createError    error
	updateResponse domain.UserResponse
	updateError    error
	deleteError    error
	findByID       domain.UserResponse
	findByIDError  error
	users          []domain.UserResponse
	findAllError   error
}

func (s *userServiceStub) Create(context.Context, domain.RegisterRequest) (domain.UserResponse, error) {
	return s.createResponse, s.createError
}

func (s *userServiceStub) Update(context.Context, domain.UpdateUserRequest) (domain.UserResponse, error) {
	return s.updateResponse, s.updateError
}

func (s *userServiceStub) Delete(context.Context, int, int) error {
	return s.deleteError
}

func (s *userServiceStub) FindByID(context.Context, int) (domain.UserResponse, error) {
	return s.findByID, s.findByIDError
}

func (s *userServiceStub) FindAll(context.Context) ([]domain.UserResponse, error) {
	return s.users, s.findAllError
}

func newUserService(repo *userRepositoryStub) *service.UserServiceImpl {
	return service.NewUserService(repo, nil)
}

func requestWithUserID(method, path, body string) *http.Request {
	request := httptest.NewRequest(method, path, strings.NewReader(body))
	routeContext := chi.NewRouteContext()
	routeContext.URLParams.Add("id", strings.TrimPrefix(path, "/users/"))
	return request.WithContext(context.WithValue(request.Context(), chi.RouteCtxKey, routeContext))
}

func TestUserServiceFindByIDReturnsMappedUser(t *testing.T) {
	createdAt := time.Date(2026, time.January, 2, 3, 4, 5, 0, time.UTC)
	repo := &userRepositoryStub{
		user: domain.User{
			ID: 7, Username: "pino", PasswordHash: "hidden", Role: "user", CreatedAt: createdAt,
		},
	}

	result, err := newUserService(repo).FindByID(context.Background(), 7)

	require.NoError(t, err)
	assert.Equal(t, domain.UserResponse{
		ID: 7, Username: "pino", Role: "user", CreatedAt: createdAt,
	}, result)
	assert.Equal(t, 1, repo.findByIDCalls)
}

func TestUserServiceFindByIDReturnsNotFound(t *testing.T) {
	repo := &userRepositoryStub{findByIDError: errors.New("database unavailable")}

	result, err := newUserService(repo).FindByID(context.Background(), 7)

	assert.Equal(t, domain.UserResponse{}, result)
	assert.EqualError(t, err, "user tidak ditemukan")
}

func TestUserServiceFindAllMapsUsersAndPropagatesErrors(t *testing.T) {
	t.Run("maps users without password hashes", func(t *testing.T) {
		repo := &userRepositoryStub{users: []domain.User{
			{ID: 1, Username: "pino", PasswordHash: "secret", Role: "admin"},
			{ID: 2, Username: "robot", PasswordHash: "secret", Role: "user"},
		}}

		result, err := newUserService(repo).FindAll(context.Background())

		require.NoError(t, err)
		assert.Equal(t, []domain.UserResponse{
			{ID: 1, Username: "pino", Role: "admin"},
			{ID: 2, Username: "robot", Role: "user"},
		}, result)
	})

	t.Run("returns repository error", func(t *testing.T) {
		repo := &userRepositoryStub{findAllError: errors.New("database unavailable")}

		result, err := newUserService(repo).FindAll(context.Background())

		assert.Nil(t, result)
		assert.EqualError(t, err, "database unavailable")
	})
}

func TestUserServiceRejectsInvalidCreateAndUpdateRequests(t *testing.T) {
	serviceUnderTest := newUserService(&userRepositoryStub{})

	created, createErr := serviceUnderTest.Create(context.Background(), domain.RegisterRequest{
		Username: "ab",
		Password: "short",
	})
	updated, updateErr := serviceUnderTest.Update(context.Background(), domain.UpdateUserRequest{
		ID:       1,
		Username: "ab",
		Role:     "invalid",
	})

	assert.Equal(t, domain.UserResponse{}, created)
	assert.Error(t, createErr)
	assert.Contains(t, createErr.Error(), "validasi gagal")
	assert.Equal(t, domain.UserResponse{}, updated)
	assert.Error(t, updateErr)
	assert.Contains(t, updateErr.Error(), "validasi gagal")
}

func TestUserServiceRejectsDeletingOwnAccount(t *testing.T) {
	repo := &userRepositoryStub{}

	err := newUserService(repo).Delete(context.Background(), 5, 5)

	assert.EqualError(t, err, "Anda tidak dapat menghapus akun sendiri.")
	assert.Zero(t, repo.deleteCalls)
}

func TestUserControllerCreateAndUpdate(t *testing.T) {
	expected := domain.UserResponse{ID: 7, Username: "pino", Role: "user"}
	controller := userhttp.NewUserController(&userServiceStub{
		createResponse: expected,
		updateResponse: expected,
	})

	t.Run("create", func(t *testing.T) {
		request := httptest.NewRequest(http.MethodPost, "/users", strings.NewReader(`{"username":"pino","password":"secret123"}`))
		response := httptest.NewRecorder()

		controller.Create(response, request)

		assert.Equal(t, http.StatusCreated, response.Code)
		var body domain.UserResponse
		require.NoError(t, json.NewDecoder(response.Body).Decode(&body))
		assert.Equal(t, expected, body)
	})

	t.Run("update sets URL id", func(t *testing.T) {
		request := requestWithUserID(http.MethodPut, "/users/7", `{"username":"pino","role":"user"}`)
		response := httptest.NewRecorder()

		controller.Update(response, request)

		assert.Equal(t, http.StatusOK, response.Code)
	})
}

func TestUserControllerRejectsInvalidIDAndPayload(t *testing.T) {
	controller := userhttp.NewUserController(&userServiceStub{})

	t.Run("invalid id", func(t *testing.T) {
		request := requestWithUserID(http.MethodGet, "/users/not-a-number", "")
		response := httptest.NewRecorder()

		controller.FindByID(response, request)

		assert.Equal(t, http.StatusBadRequest, response.Code)
		assert.JSONEq(t, `{"error":"ID user tidak valid"}`, response.Body.String())
	})

	t.Run("invalid create payload", func(t *testing.T) {
		request := httptest.NewRequest(http.MethodPost, "/users", strings.NewReader("{"))
		response := httptest.NewRecorder()

		controller.Create(response, request)

		assert.Equal(t, http.StatusBadRequest, response.Code)
		assert.JSONEq(t, `{"error":"Payload tidak valid"}`, response.Body.String())
	})
}

func TestUserControllerFindAllAndDelete(t *testing.T) {
	controller := userhttp.NewUserController(&userServiceStub{
		users: []domain.UserResponse{{ID: 1, Username: "pino", Role: "user"}},
	})

	t.Run("find all", func(t *testing.T) {
		request := httptest.NewRequest(http.MethodGet, "/users", nil)
		response := httptest.NewRecorder()

		controller.FindAll(response, request)

		assert.Equal(t, http.StatusOK, response.Code)
		assert.JSONEq(t, `[{"id":1,"username":"pino","role":"user","created_at":"0001-01-01T00:00:00Z"}]`, response.Body.String())
	})

	t.Run("delete", func(t *testing.T) {
		request := requestWithUserID(http.MethodDelete, "/users/2", "")
		request = request.WithContext(context.WithValue(request.Context(), utils.UserIDKey, 1))
		response := httptest.NewRecorder()

		controller.Delete(response, request)

		assert.Equal(t, http.StatusOK, response.Code)
		assert.JSONEq(t, `{"message":"User berhasil dihapus"}`, response.Body.String())
	})
}

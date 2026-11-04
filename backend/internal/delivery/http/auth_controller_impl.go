package http

import (
	"encoding/json"
	"net/http"
	"pino-portal/internal/domain"
	"pino-portal/internal/service"
	"pino-portal/internal/utils"

	"github.com/google/wire"
)

type AuthControllerImpl struct {
	AuthService service.AuthService
}

func NewAuthController(authService service.AuthService) *AuthControllerImpl {
	return &AuthControllerImpl{
		AuthService: authService,
	}
}

var AuthControllerSet = wire.NewSet(
	NewAuthController,
	wire.Bind(new(AuthController), new(*AuthControllerImpl)),
)

func (c *AuthControllerImpl) Register(writer http.ResponseWriter, request *http.Request) {
	var req domain.RegisterRequest

	if err := json.NewDecoder(request.Body).Decode(&req); err != nil {
		utils.InvalidPayload(writer)
		return
	}

	err := c.AuthService.Register(request.Context(), req)

	if err != nil {
		utils.Error(writer, http.StatusBadRequest, err)
		return
	}

	utils.Message(writer, http.StatusCreated, "User berhasil didaftarkan")
}

func (c *AuthControllerImpl) Login(writer http.ResponseWriter, request *http.Request) {
	var req domain.LoginRequest

	if err := json.NewDecoder(request.Body).Decode(&req); err != nil {
		utils.InvalidPayload(writer)
		return
	}

	res, err := c.AuthService.Login(request.Context(), req)

	if err != nil {
		utils.Error(writer, http.StatusUnauthorized, err)
		return
	}

	utils.JSON(writer, http.StatusOK, res)
}
package controller

import (
	"encoding/json"
	"net/http"
	"pino-portal/exception"
	"pino-portal/model"
	"pino-portal/service"

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
	var req model.RegisterRequest

	if err := json.NewDecoder(request.Body).Decode(&req); err != nil {
		exception.InvalidPayload(writer)
		return
	}

	err := c.AuthService.Register(request.Context(), req)

	if err != nil {
		exception.Error(writer, http.StatusBadRequest, err)
		return
	}

	exception.Message(writer, http.StatusCreated, "User berhasil didaftarkan")
}

func (c *AuthControllerImpl) Login(writer http.ResponseWriter, request *http.Request) {
	var req model.LoginRequest

	if err := json.NewDecoder(request.Body).Decode(&req); err != nil {
		exception.InvalidPayload(writer)
		return
	}

	res, err := c.AuthService.Login(request.Context(), req)

	if err != nil {
		exception.Error(writer, http.StatusUnauthorized, err)
		return
	}

	exception.JSON(writer, http.StatusOK, res)
}
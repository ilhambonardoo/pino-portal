package controller

import (
	"encoding/json"
	"net/http"
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

func (c *AuthControllerImpl) Register(writer http.ResponseWriter, request *http.Request){
	var req model.RegisterRequest

	if err := json.NewDecoder(request.Body).Decode(&req); err != nil {
		writer.Header().Set("Content-Type", "application/json")
		writer.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(writer).Encode(map[string]string{"error" : "Payload request tidak valid"})
		return
	}

	err := c.AuthService.Register(request.Context(), req)

	if err != nil {
		writer.Header().Set("Content-Type", "application/json")
		writer.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(writer).Encode(map[string]string{"error" : err.Error()})
		return
	}

	writer.Header().Set("Content-Type", "application/json")
	writer.WriteHeader(http.StatusCreated)
	json.NewEncoder(writer).Encode(map[string]string{"message" : "User berhasil didaftarkan"})
}

func (c *AuthControllerImpl) Login(writer http.ResponseWriter, request *http.Request){
	var req model.LoginRequest

	if err := json.NewDecoder(request.Body).Decode(&req); err != nil {
		writer.Header().Set("Content-Type", "application/json")
		writer.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(writer).Encode(map[string]string{"error" : "Payload request tidak valid"})
		return
	}

	res, err := c.AuthService.Login(request.Context(), req)
	
	if err != nil {
		writer.Header().Set("Content-Type", "application/json")
		writer.WriteHeader(http.StatusUnauthorized)
		json.NewEncoder(writer).Encode(map[string]string{"error" : err.Error()})
		return
	}

	writer.Header().Set("Content-Type", "application/json")
	writer.WriteHeader(http.StatusOK)
	json.NewEncoder(writer).Encode(res)
}
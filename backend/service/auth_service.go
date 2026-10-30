package service

import (
	"context"
	"pino-portal/model"
)

type AuthService interface{
	Register(ctx context.Context, req model.RegisterRequest) error
	Login(ctx context.Context, req model.LoginRequest) (model.LoginResponse, error)
}
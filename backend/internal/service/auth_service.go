package service

import (
	"context"
	"pino-portal/internal/domain"
)

type AuthService interface{
	Register(ctx context.Context, req domain.RegisterRequest) error
	Login(ctx context.Context, req domain.LoginRequest) (domain.LoginResponse, error)
}
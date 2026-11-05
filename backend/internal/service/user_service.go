package service

import (
	"context"
	"pino-portal/internal/domain"
)

type UserService interface {
	Create(ctx context.Context, req domain.RegisterRequest) (domain.UserResponse, error)
	Update(ctx context.Context, req domain.UpdateUserRequest) (domain.UserResponse, error)
	Delete(ctx context.Context, userId int, targetId int) error
	FindByID(ctx context.Context, userId int) (domain.UserResponse, error)
	FindAll(ctx context.Context) ([]domain.UserResponse, error)
}

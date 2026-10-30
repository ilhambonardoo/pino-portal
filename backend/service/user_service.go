package service

import (
	"context"
	"pino-portal/model"
)

type UserService interface {
	Create(ctx context.Context, req model.RegisterRequest) (model.UserResponse, error)
	Update(ctx context.Context, req model.UpdateUserRequest) (model.UserResponse, error)
	Delete(ctx context.Context, userId int) error
	FindByID(ctx context.Context, userId int) (model.UserResponse, error)
	FindAll(ctx context.Context) ([]model.UserResponse, error)
}

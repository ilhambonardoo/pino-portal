package service

import (
	"context"
	"pino-portal/internal/domain"
)

type DeviceService interface {
	Create(ctx context.Context, req domain.CreateDeviceRequest, currentUserID int, role string) (domain.DeviceResponse, error)
	FindAll(ctx context.Context, currentUserID int, role string) ([]domain.DeviceResponse, error)
	Control(ctx context.Context, deviceID int, req domain.ControlDeviceRequest, currentUserID int, role string) error
	Delete(ctx context.Context, deviceID int, currentUserID int, role string) error
}
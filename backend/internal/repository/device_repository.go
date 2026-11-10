package repository

import (
	"context"
	"database/sql"
	"pino-portal/internal/domain"
)

type DeviceRepository interface {
	Save(ctx context.Context, tx *sql.Tx, device domain.Device) (domain.Device, error)
	Update(ctx context.Context, tx *sql.Tx, device domain.Device) (domain.Device, error)
	Delete(ctx context.Context, tx *sql.Tx, deviceID int) error
	FindById(ctx context.Context, db Queryer, deviceID int) (domain.Device, error)
	FindAllAccessible(ctx context.Context, db Queryer, userID int, isAdmin bool) ([]domain.Device, error)
}
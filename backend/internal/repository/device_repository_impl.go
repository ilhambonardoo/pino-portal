package repository

import (
	"context"
	"database/sql"
	"pino-portal/internal/domain"

	"github.com/google/wire"
)

type DeviceRepositoryImpl struct {
}

func NewDeviceRepository() *DeviceRepositoryImpl {
	return &DeviceRepositoryImpl{}
}

var DeviceRepositorySet = wire.NewSet(
	NewDeviceRepository,
	wire.Bind(new(DeviceRepository), new(*DeviceRepositoryImpl)),
)

func (r *DeviceRepositoryImpl) Save(ctx context.Context, tx *sql.Tx, device domain.Device) (domain.Device, error) {
	query := "INSERT INTO devices (name, device_key, type, status, is_private, owner_id) VALUES (?, ?, ?, ?, ?, ?)"
	result, err := tx.ExecContext(ctx, query, device.Name, device.DeviceKey, device.Type, device.Status, device.IsPrivate, device.OwnerID)

	if err != nil {
		return device, err
	}

	id, err := result.LastInsertId()
	if err != nil {
		return device, err
	}

	return r.FindById(ctx, tx, int(id))
}

func (r *DeviceRepositoryImpl) Update(ctx context.Context, tx *sql.Tx, device domain.Device) (domain.Device, error) {
	query := "UPDATE devices SET name = ?, type = ?, status = ?, is_private = ?, owner_id = ? WHERE id = ?"
	_, err := tx.ExecContext(ctx, query, device.Name, device.Type, device.Status, device.IsPrivate, device.OwnerID, device.ID)

	if err != nil {
		return device, err
	}

	return device, err
}

func (r *DeviceRepositoryImpl) Delete(ctx context.Context, tx *sql.Tx, deviceId int) error {
	query := "DELETE FROM devices WHERE id = ?"
	_, err := tx.ExecContext(ctx, query, deviceId)
	return err
}

func (r *DeviceRepositoryImpl) FindById(ctx context.Context, db Queryer, deviceId int) (domain.Device, error) {
	query := "SELECT id, name, device_key, type, status, state, is_private, owner_id, last_active, created_at FROM devices WHERE id = ?"
	row := db.QueryRowContext(ctx, query, deviceId)

	var d domain.Device
	err := row.Scan(&d.ID, &d.Name, &d.DeviceKey, &d.Type, &d.Status, &d.State, &d.IsPrivate, &d.OwnerID, &d.LastActive, &d.CreatedAt)

	if err != nil {
		return d, err
	}

	return d, nil
}

func (r *DeviceRepositoryImpl) FindAllAccessible(ctx context.Context, db Queryer, usedID int, isAdmin bool) ([]domain.Device, error) {
	var query string
	var args []any

	if isAdmin {
		query = "SELECT id, name, device_key, type, status, state, is_private, owner_id, last_active, created_at FROM devices"
	} else {
		query = "SELECT id, name, device_key, type, status, state, is_private, owner_id, last_active, created_at FROM devices WHERE is_private = FALSE OR owner_id = ?"
		args = append(args, usedID)
	}

	rows, err := db.QueryContext(ctx, query, args...)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var devices []domain.Device
	for rows.Next() {
		var d domain.Device
		err := rows.Scan(&d.ID, &d.Name, &d.DeviceKey, &d.Type, &d.Status, &d.State, &d.IsPrivate, &d.OwnerID, &d.LastActive, &d.CreatedAt)
		if err != nil {
			return nil, err
		}
		devices = append(devices, d)
	}
	if err := rows.Err(); err != nil {
		return nil, err
	}

	return devices, nil
}

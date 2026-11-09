package service

import (
	"context"
	"database/sql"
	"errors"
	"pino-portal/internal/domain"
	"pino-portal/internal/repository"

	"github.com/go-playground/validator/v10"
	"github.com/google/wire"
)

type DeviceServiceImpl struct {
	DeviceRepo repository.DeviceRepository
	DB         *sql.DB
	Validate   *validator.Validate
}

func NewDeviceService(device repository.DeviceRepository, db *sql.DB) *DeviceServiceImpl {
	return &DeviceServiceImpl{
		DeviceRepo: device,
		DB:         db,
		Validate:   validator.New(),
	}
}

var DeviceServiceSet = wire.NewSet(
	NewDeviceService,
	wire.Bind(new(DeviceService), new(*DeviceServiceImpl)),
)

func (s *DeviceServiceImpl) Create(ctx context.Context, req domain.CreateDeviceRequest, currentUserID int, role string) (domain.DeviceResponse, error) {
	if err := s.Validate.Struct(req); err != nil {
		return domain.DeviceResponse{}, errors.New("Validasi Gagal : " + err.Error())
	}

	if role != "admin" {
		if req.IsPrivate {
			req.OwnerID = &currentUserID
		} else {
			req.OwnerID = nil
		}
	} else if req.IsPrivate && req.OwnerID == nil {
		req.OwnerID = &currentUserID
	}

	tx, err := s.DB.BeginTx(ctx, nil)
	if err != nil {
		return domain.DeviceResponse{}, err
	}

	device := domain.Device{
		Name:      req.Name,
		DeviceKey: req.DeviceKey,
		Type:      req.Type,
		Status:    "offline",
		IsPrivate: req.IsPrivate,
		OwnerID:   req.OwnerID,
	}

	saved, err := s.DeviceRepo.Save(ctx, tx, device)
	if err != nil {
		_ = tx.Rollback()
		return domain.DeviceResponse{}, err
	}

	if err := tx.Commit(); err != nil {
		return domain.DeviceResponse{}, err
	}

	return domain.DeviceResponse{
		ID:         saved.ID,
		Name:       saved.Name,
		DeviceKey:  saved.DeviceKey,
		Type:       saved.Type,
		Status:     saved.Status,
		State:      saved.State,
		IsPrivate:  saved.IsPrivate,
		OwnerID:    saved.OwnerID,
		LastActive: saved.LastActive,
		CreatedAt:  saved.CreatedAt,
	}, nil
}

func (s *DeviceServiceImpl) FindAll(ctx context.Context, currentUserID int, role string) ([]domain.DeviceResponse, error) {
	isAdmin := (role == "admin")
	devices, err := s.DeviceRepo.FindAllAccessible(ctx, s.DB, currentUserID, isAdmin)
	if err != nil {
		return nil, err
	}

	var res []domain.DeviceResponse
	for _, d := range devices {
		res = append(res, domain.DeviceResponse{
			ID:         d.ID,
			Name:       d.Name,
			DeviceKey:  d.DeviceKey,
			Type:       d.Type,
			Status:     d.Status,
			State:      d.State,
			IsPrivate:  d.IsPrivate,
			OwnerID:    d.OwnerID,
			LastActive: d.LastActive,
			CreatedAt:  d.CreatedAt,
		})
	}

	return res, nil
}

func (s *DeviceServiceImpl) Control(ctx context.Context, deviceID int, req domain.ControlDeviceRequest, currentUserID int, role string) error {
	if err := s.Validate.Struct(req); err != nil {
		return errors.New("Validasi gagal: " + err.Error())
	}

	device, err := s.DeviceRepo.FindById(ctx, s.DB, deviceID)
	if err != nil {
		return errors.New("Perangkat tidak ditemukan")
	}

	if device.IsPrivate && role != "admin" && (device.OwnerID == nil || *device.OwnerID != currentUserID) {
		return errors.New("Akses ditolak: perangkat ini bersifat private")
	}

	return errors.New("kontrol perangkat belum tersedia")
}

func (s *DeviceServiceImpl) Delete(ctx context.Context, deviceID int, currentUserID int, role string) error {
	device, err := s.DeviceRepo.FindById(ctx, s.DB, deviceID)
	if err != nil {
		return errors.New("Perangkat tidak ditemukan")
	}

	if role != "admin" && (device.OwnerID == nil || *device.OwnerID != currentUserID) {
		return errors.New("Akses ditolak: tidak memiliki hak untuk menghapus perangkat ini")
	}

	tx, err := s.DB.BeginTx(ctx, nil)
	if err != nil {
		return err
	}

	if err := s.DeviceRepo.Delete(ctx, tx, deviceID); err != nil {
		_ = tx.Rollback()
		return err
	}

	return tx.Commit()
}

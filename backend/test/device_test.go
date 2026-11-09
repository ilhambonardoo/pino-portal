package test

import (
	"context"
	"database/sql"
	"errors"
	"testing"

	"pino-portal/internal/domain"
	"pino-portal/internal/repository"
	"pino-portal/internal/service"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

type deviceRepositoryStub struct {
	devices        []domain.Device
	device         domain.Device
	findAllError   error
	findByIDError  error
	findAllIsAdmin bool
	findAllUserID  int
	findByIDCalls  int
}

func (s *deviceRepositoryStub) Save(context.Context, *sql.Tx, domain.Device) (domain.Device, error) {
	return domain.Device{}, errors.New("not implemented")
}

func (s *deviceRepositoryStub) Update(context.Context, *sql.Tx, domain.Device) (domain.Device, error) {
	return domain.Device{}, errors.New("not implemented")
}

func (s *deviceRepositoryStub) Delete(context.Context, *sql.Tx, int) error {
	return errors.New("not implemented")
}

func (s *deviceRepositoryStub) FindById(context.Context, repository.Queryer, int) (domain.Device, error) {
	s.findByIDCalls++
	return s.device, s.findByIDError
}

func (s *deviceRepositoryStub) FindAllAccessible(_ context.Context, _ repository.Queryer, userID int, isAdmin bool) ([]domain.Device, error) {
	s.findAllUserID = userID
	s.findAllIsAdmin = isAdmin
	return s.devices, s.findAllError
}

func newDeviceService(repo *deviceRepositoryStub) *service.DeviceServiceImpl {
	return &service.DeviceServiceImpl{
		DeviceRepo: repo,
		Validate:   service.NewDeviceService(repo, nil).Validate,
	}
}

func TestDeviceServiceFindAllReturnsMappedDevices(t *testing.T) {
	state := "idle"
	ownerID := 7
	repo := &deviceRepositoryStub{
		devices: []domain.Device{{
			ID:        10,
			Name:      "Robot Pino",
			DeviceKey: "device-key",
			Type:      "robot",
			Status:    "online",
			State:     &state,
			IsPrivate: true,
			OwnerID:   &ownerID,
		}},
	}
	serviceUnderTest := newDeviceService(repo)

	result, err := serviceUnderTest.FindAll(context.Background(), ownerID, "user")

	require.NoError(t, err)
	require.Len(t, result, 1)
	assert.Equal(t, 10, result[0].ID)
	assert.Equal(t, "Robot Pino", result[0].Name)
	assert.Equal(t, &state, result[0].State)
	assert.Equal(t, ownerID, repo.findAllUserID)
	assert.False(t, repo.findAllIsAdmin)
}

func TestDeviceServiceFindAllReturnsRepositoryError(t *testing.T) {
	repo := &deviceRepositoryStub{findAllError: errors.New("database unavailable")}
	serviceUnderTest := newDeviceService(repo)

	result, err := serviceUnderTest.FindAll(context.Background(), 1, "user")

	assert.Nil(t, result)
	assert.EqualError(t, err, "database unavailable")
}

func TestDeviceServiceControlRejectsInvalidRequest(t *testing.T) {
	repo := &deviceRepositoryStub{}
	serviceUnderTest := newDeviceService(repo)

	err := serviceUnderTest.Control(context.Background(), 1, domain.ControlDeviceRequest{}, 1, "user")

	assert.Error(t, err)
	assert.Contains(t, err.Error(), "Validasi gagal")
	assert.Zero(t, repo.findByIDCalls)
}

func TestDeviceServiceControlRejectsPrivateDeviceForDifferentUser(t *testing.T) {
	ownerID := 2
	repo := &deviceRepositoryStub{
		device: domain.Device{
			ID:        1,
			IsPrivate: true,
			OwnerID:   &ownerID,
		},
	}
	serviceUnderTest := newDeviceService(repo)

	err := serviceUnderTest.Control(
		context.Background(),
		1,
		domain.ControlDeviceRequest{Command: "move", Value: 1},
		1,
		"user",
	)

	assert.EqualError(t, err, "Akses ditolak: perangkat ini bersifat private")
}

func TestDeviceServiceDeleteRejectsPrivateDeviceForDifferentUser(t *testing.T) {
	ownerID := 2
	repo := &deviceRepositoryStub{
		device: domain.Device{
			ID:        1,
			IsPrivate: true,
			OwnerID:   &ownerID,
		},
	}
	serviceUnderTest := newDeviceService(repo)

	err := serviceUnderTest.Delete(context.Background(), 1, 1, "user")

	assert.EqualError(t, err, "Akses ditolak: tidak memiliki hak untuk menghapus perangkat ini")
}

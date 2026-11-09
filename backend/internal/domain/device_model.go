package domain

import "time"

type Device struct {
	ID         int        `json:"id"`
	Name       string     `json:"name"`
	DeviceKey  string     `json:"device_key"`
	Type       string     `json:"type"`
	Status     string     `json:"status"`
	State      *string    `json:"state"`
	IsPrivate  bool       `json:"is_private"`
	OwnerID    *int       `json:"owner_id"`
	LastActive *time.Time `json:"last_active"`
	CreatedAt  time.Time  `json:"created_at"`
}

type DeviceResponse struct {
	ID         int        `json:"id"`
	Name       string     `json:"name"`
	DeviceKey  string     `json:"device_key"`
	Type       string     `json:"type"`
	Status     string     `json:"status"`
	State      *string    `json:"state"`
	IsPrivate  bool       `json:"is_private"`
	OwnerID    *int       `json:"owner_id"`
	LastActive *time.Time `json:"last_active"`
	CreatedAt  time.Time  `json:"created_at"`
}

type CreateDeviceRequest struct {
	Name      string `json:"name" validate:"required,min=2"`
	DeviceKey string `json:"device_key" validate:"required"`
	Type      string `json:"type" validate:"required,min=2"`
	IsPrivate bool   `json:"is_private"`
	OwnerID   *int   `json:"owner_id"`
}

type UpdateDeviceRequest struct {
	ID        int    `json:"id" validate:"required"`
	Name      string `json:"name" validate:"required,min=2"`
	Type      string `json:"type" validate:"required,min=2"`
	Status    string `json:"status" validate:"required"`
	IsPrivate bool   `json:"is_private"`
	OwnerID   *int   `json:"owner_id"`
}

type ControlDeviceRequest struct {
	Command string `json:"command" validate:"required"`
	Value   int    `json:"value"`
}
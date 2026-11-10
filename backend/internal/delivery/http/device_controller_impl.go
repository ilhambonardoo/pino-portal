package http

import (
	"encoding/json"
	"net/http"
	"pino-portal/internal/domain"
	"pino-portal/internal/service"
	"pino-portal/internal/utils"
	"strconv"

	"github.com/go-chi/chi/v5"
	"github.com/google/wire"
)

type DeviceControllerImpl struct {
	DeviceService service.DeviceService
}

func NewDeviceController(deviceService service.DeviceService) *DeviceControllerImpl {
	return &DeviceControllerImpl{DeviceService: deviceService}
}


var DeviceControllerSet = wire.NewSet(
	NewDeviceController,
	wire.Bind(new(DeviceController), new(*DeviceControllerImpl)),
)

func (c *DeviceControllerImpl) Create(writer http.ResponseWriter, request *http.Request) {
	userID, role, ok := utils.AuthContext(writer, request)
	if !ok {
		return
	}

	var req domain.CreateDeviceRequest
	if err := json.NewDecoder(request.Body).Decode(&req); err != nil {
		utils.InvalidPayload(writer)
		return
	}

	res, err := c.DeviceService.Create(request.Context(), req, userID, role)
	if err != nil {
		utils.Error(writer, http.StatusBadRequest, err)
		return
	}

	utils.JSON(writer, http.StatusCreated, res)
}

func (c *DeviceControllerImpl) FindAll(writer http.ResponseWriter, request *http.Request) {
	userID, role, ok := utils.AuthContext(writer, request)
	if !ok {
		return
	}

	res, err := c.DeviceService.FindAll(request.Context(), userID, role)
	if err != nil {
		utils.Error(writer, http.StatusBadRequest, err)
		return
	}

	utils.JSON(writer, http.StatusOK, res)
}

func (c *DeviceControllerImpl) Control(writer http.ResponseWriter, request *http.Request) {
	userID, role, ok := utils.AuthContext(writer, request)
	if !ok {
		return
	}

	idStr := chi.URLParam(request, "id")
	id, err := strconv.Atoi(idStr)
	if err != nil || id <= 0 {
		utils.InvalidDeviceID(writer)
		return
	}

	var req domain.ControlDeviceRequest
	if err := json.NewDecoder(request.Body).Decode(&req); err != nil {
		utils.InvalidPayload(writer)
		return
	}

	err = c.DeviceService.Control(request.Context(), id, req, userID, role)
	if err != nil {
		utils.Error(writer, http.StatusBadRequest, err)
		return
	}

	utils.JSON(writer, http.StatusOK, map[string]string{"message": "Perintah berhasil dikirim"})
}

func (c *DeviceControllerImpl) Delete(writer http.ResponseWriter, request *http.Request) {
	userID, role, ok := utils.AuthContext(writer, request)
	if !ok {
		return
	}

	idStr := chi.URLParam(request, "id")
	id, err := strconv.Atoi(idStr)
	if err != nil || id <= 0 {
		utils.InvalidDeviceID(writer)
		return
	}

	err = c.DeviceService.Delete(request.Context(), id, userID, role)
	if err != nil {
		utils.Error(writer, http.StatusBadRequest, err)
		return
	}

	utils.JSON(writer, http.StatusOK, map[string]string{"message": "Device berhasil dihapus"})
}

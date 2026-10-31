package controller

import (
	"encoding/json"
	"net/http"
	"pino-portal/exception"
	"pino-portal/middleware"
	"pino-portal/model"
	"pino-portal/service"
	"strconv"

	"github.com/go-chi/chi/v5"
	"github.com/google/wire"
)

type UserControllerImpl struct {
	UserService service.UserService
}

func NewUserController(userService service.UserService) *UserControllerImpl {
	return &UserControllerImpl{
		UserService: userService,
	}
}

func parseUserID(writer http.ResponseWriter, request *http.Request) (int, bool) {
	id, err := strconv.Atoi(chi.URLParam(request, "id"))
	if err != nil || id <= 0 {
		exception.InvalidID(writer)
		return 0, false
	}

	return id, true
}

var UserControllerSet = wire.NewSet(
	NewUserController,
	wire.Bind(new(UserController), new(*UserControllerImpl)),
)

func (c *UserControllerImpl) Create(writer http.ResponseWriter, request *http.Request) {
	var req model.RegisterRequest

	if err := json.NewDecoder(request.Body).Decode(&req); err != nil {
		exception.InvalidPayload(writer)
		return
	}

	res, err := c.UserService.Create(request.Context(), req)
	if err != nil {
		exception.Error(writer, http.StatusBadRequest, err)
		return
	}

	exception.JSON(writer, http.StatusCreated, res)
}

func (c *UserControllerImpl) Update(writer http.ResponseWriter, request *http.Request) {
	id, ok := parseUserID(writer, request)
	if !ok {
		return
	}

	var req model.UpdateUserRequest
	if err := json.NewDecoder(request.Body).Decode(&req); err != nil {
		exception.InvalidPayload(writer)
		return
	}

	req.ID = id

	res, err := c.UserService.Update(request.Context(), req)
	if err != nil {
		exception.Error(writer, http.StatusBadRequest, err)
		return
	}

	exception.JSON(writer, http.StatusOK, res)
}

func (c *UserControllerImpl) Delete(writer http.ResponseWriter, request *http.Request) {
	targetID, ok := parseUserID(writer, request)
	if !ok {
		return
	}

	userID, ok := request.Context().Value(middleware.UserIDKey).(int)
	if err := c.UserService.Delete(request.Context(), userID, targetID); err != nil {
		exception.Error(writer, http.StatusBadRequest, err)
		return
	}

	exception.Message(writer, http.StatusOK, "User berhasil dihapus")
}

func (c *UserControllerImpl) FindAll(writer http.ResponseWriter, request *http.Request) {
	users, err := c.UserService.FindAll(request.Context())
	if err != nil {
		exception.Error(writer, http.StatusInternalServerError, err)
		return
	}

	exception.JSON(writer, http.StatusOK, users)
}

func (c *UserControllerImpl) FindByID(writer http.ResponseWriter, request *http.Request) {
	id, ok := parseUserID(writer, request)
	if !ok {
		return
	}

	user, err := c.UserService.FindByID(request.Context(), id)
	if err != nil {
		exception.Error(writer, http.StatusNotFound, err)
		return
	}

	exception.JSON(writer, http.StatusOK, user)
}
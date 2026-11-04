//go:build wireinject
// +build wireinject

package main

import (
	"net/http"
	"pino-portal/app"
	deliveryHttp "pino-portal/internal/delivery/http"
	"pino-portal/internal/repository"
	"pino-portal/internal/service"

	"github.com/google/wire"
)


func InitializedServer() *http.Server {
	wire.Build(
		app.NewDB,
		repository.UserRepositorySet,
		service.AuthServiceSet,
		service.UserServiceSet,
		deliveryHttp.AuthControllerSet,
		deliveryHttp.UserControllerSet,
		app.ServerSet,
	)
	return nil
}
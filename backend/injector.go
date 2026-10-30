//go:build wireinject
// +build wireinject

package main

import (
	"net/http"
	"pino-portal/app"
	"pino-portal/controller"
	"pino-portal/repository"
	"pino-portal/service"

	"github.com/google/wire"
)


func InitializedServer() *http.Server {
	wire.Build(
		app.NewDB,
		repository.UserRepositorySet,
		service.AuthServiceSet,
		service.UserServiceSet,
		controller.AuthControllerSet,
		controller.UserControllerSet,
		app.ServerSet,
	)
	return nil
}
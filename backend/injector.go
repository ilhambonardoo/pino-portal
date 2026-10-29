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


func InitializedSever() *http.Server {
	wire.Build(
		app.NewDB,
		repository.UserRepositorySet,
		service.AuthServiceSet,
		controller.AuthControllerSet,
		app.ServerSet,
	)
	return nil
}
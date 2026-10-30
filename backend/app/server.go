package app

import (
	"fmt"
	"net/http"
	"pino-portal/controller"
	"pino-portal/helper"
	customMiddleware "pino-portal/middleware"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/chi/v5/middleware"
	"github.com/google/wire"
	"github.com/rs/cors"
)

var ServerSet = wire.NewSet(NewServer)

func NewServer(authController controller.AuthController, userController controller.UserController) *http.Server {
	r := chi.NewRouter()
	r.Use(middleware.Logger)
	r.Use(middleware.Recoverer)

	c := cors.New(cors.Options{
		AllowedOrigins: []string{"*"},
		AllowedMethods: []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowedHeaders: []string{"Accept", "Authorization", "Content-Type"},
		AllowCredentials: true,
	})

	r.Use(c.Handler)

	
	r.Route("/api/v1/auth", func (r chi.Router)  {
		r.Post("/register", authController.Register)
		r.Post("/login", authController.Login)
	})

	r.Route("/api/v1/users", func(r chi.Router) {
		r.Use(customMiddleware.AuthMiddleware("admin"))
		r.Get("/", userController.FindAll)
		r.Post("/", userController.Create)
		r.Get("/{id}", userController.FindByID)
		r.Put("/{id}", userController.Update)
		r.Delete("/{id}", userController.Delete)
	})
	
	r.Route("/api/v1/admin", func(r chi.Router) {
		r.Use(customMiddleware.AuthMiddleware("admin"))
		r.Get("/dashboard", func(w http.ResponseWriter, r *http.Request) {
			w.Header().Set("Content-Type", "application/json")
			w.Write([]byte(`{"message":"Selamat datang di Dashboard Admin Robot Pino!"}`))
		})
	})

	port := helper.GetEnv("PORT", "8080")
	fmt.Printf("Server berjalan di http://localhost:%s\n", port)

	return &http.Server{
		Addr: ":" + port,
		Handler: r,
	}
}
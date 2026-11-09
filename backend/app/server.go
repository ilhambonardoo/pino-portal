package app

import (
	"fmt"
	"net/http"

	"pino-portal/config"
	deliveryHttp "pino-portal/internal/delivery/http"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/chi/v5/middleware"
	"github.com/google/wire"
	"github.com/rs/cors"
)

var ServerSet = wire.NewSet(NewServer)

func NewServer(
	authController deliveryHttp.AuthController,
	userController deliveryHttp.UserController,
	deviceController deliveryHttp.DeviceController,
) *http.Server {
	r := chi.NewRouter()
	r.Use(middleware.Logger)
	r.Use(middleware.Recoverer)

	c := cors.New(cors.Options{
		AllowedOrigins:   []string{"*"},
		AllowedMethods:   []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowedHeaders:   []string{"Accept", "Authorization", "Content-Type"},
		AllowCredentials: true,
	})

	r.Use(c.Handler)

	// Route Auth (Public)
	r.Route("/api/v1/auth", func(r chi.Router) {
		r.Post("/register", authController.Register)
		r.Post("/login", authController.Login)
	})

	// Route Users (Khusus Admin)
	r.Route("/api/v1/users", func(r chi.Router) {
		r.Use(deliveryHttp.AuthMiddleware("admin"))
		r.Get("/", userController.FindAll)
		r.Post("/", userController.Create)
		r.Get("/{id}", userController.FindByID)
		r.Put("/{id}", userController.Update)
		r.Delete("/{id}", userController.Delete)
	})

	// Route Admin Dashboard
	r.Route("/api/v1/admin", func(r chi.Router) {
		r.Use(deliveryHttp.AuthMiddleware("admin"))
		r.Get("/dashboard", func(w http.ResponseWriter, r *http.Request) {
			w.Header().Set("Content-Type", "application/json")
			w.Write([]byte(`{"message":"Selamat datang di Dashboard Admin Robot Pino!"}`))
		})
	})

	// Route Device
	r.Route("/api/v1/devices", func(r chi.Router) {
		r.Use(deliveryHttp.AuthMiddleware())
		r.Get("/", deviceController.FindAll)
		r.Post("/", deviceController.Create)
		r.Post("/{id}/controller", deviceController.Control)
		r.Delete("/{id}", deviceController.Delete)
	})

	port := config.GetEnv("PORT", "8080")
	fmt.Printf("Server berjalan di http://localhost:%s\n", port)

	return &http.Server{
		Addr:    ":" + port,
		Handler: r,
	}
}
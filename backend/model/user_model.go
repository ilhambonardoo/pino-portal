package model

import "time"

type User struct {
	ID 				int 		`json:"id"`
	Username 		string 		`json:"username"`
	PasswordHash 	string 		`json:"-"`
	Role 			string 		`json:"role"`
	CreatedAt 		time.Time	`json:"created_at"` 
}

type RegisterRequest struct {
	Username string `json:"username" validate:"required,alphanum,min=3,max=30"`
	Password string `json:"password" validate:"required,min=6"`
	Role     string `json:"role" validate:"omitempty,oneof=admin operator user"`
}

type LoginRequest struct {
	Username string `json:"username" validate:"required"`
	Password string `json:"password" validate:"required"`
}

type LoginResponse struct {
	Token string `json:"token"`
	Role  string `json:"role"`
}
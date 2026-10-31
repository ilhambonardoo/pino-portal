package middleware

import (
	"context"
	"net/http"
	"pino-portal/helper"
	"slices"
	"strings"
)

type contextKey string

const (
	UserRoleKey contextKey = "user_role"
	UserIDKey contextKey = "user_id"
)

func AuthMiddleware(allowedRoles ...string) func(http.Handler) http.Handler{
	return func (next http.Handler)http.Handler  {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			authHeader := r.Header.Get("Authorization")
			if !strings.HasPrefix(authHeader, "Bearer "){
				http.Error(w, `{"error" : "Unauthorized"}`, http.StatusUnauthorized)
				return
			}

			tokenString := strings.TrimPrefix(authHeader, "Bearer ")
			claims, err := helper.ValidateToken(tokenString)
			if err != nil {
				http.Error(w, `{"error":"`+err.Error()+`"}`, http.StatusUnauthorized)
				return
			}

			// RBAC (Role Based Access Control)
			if len(allowedRoles) > 0 {
				isAllowed := slices.Contains(allowedRoles, claims.Role)
				if !isAllowed {
					http.Error(w, `{"error" : "Akses ditolak"}`, http.StatusForbidden)
					return
				}
			}
			
			ctx := context.WithValue(r.Context(), UserRoleKey, claims.Role)
			ctx = context.WithValue(ctx, UserIDKey, claims.UserID)
			next.ServeHTTP(w, r.WithContext(ctx))
		})
	}
}
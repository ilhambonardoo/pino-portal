package utils

import (
	"errors"
	"net/http"
)

type contextKey string

const (
	UserRoleKey contextKey = "user_role"
	UserIDKey contextKey = "user_id"
)

func AuthContext(writer http.ResponseWriter, request *http.Request) (int, string, bool) {
	userID, ok := request.Context().Value(UserIDKey).(int)
	if !ok {
		Error(writer, http.StatusUnauthorized, errors.New("konteks user tidak valid"))
		return 0, "", false
	}

	role, ok := request.Context().Value(UserRoleKey).(string)
	if !ok {
		Error(writer, http.StatusUnauthorized, errors.New("konteks role tidak valid"))
		return 0, "", false
	}

	return userID, role, true
}

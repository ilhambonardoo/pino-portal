package exception

import (
	"encoding/json"
	"net/http"
)

type ErrorResponse struct {
    Error string `json:"error"`
}

func JSON(w http.ResponseWriter, status int, data any) {
    w.Header().Set("Content-Type", "application/json")
    w.WriteHeader(status)
    _ = json.NewEncoder(w).Encode(data)
}

func Error(w http.ResponseWriter, status int, err error) {
    JSON(w, status, ErrorResponse{
        Error: err.Error(),
    })
}

func Message(w http.ResponseWriter, status int, message string) {
    JSON(w, status, map[string]string{
        "message": message,
    })
}

func InvalidID(w http.ResponseWriter) {
    JSON(w, http.StatusBadRequest, ErrorResponse{
        Error: "ID user tidak valid",
    })
}

func InvalidPayload(w http.ResponseWriter) {
    JSON(w, http.StatusBadRequest, ErrorResponse{
        Error: "Payload tidak valid",
    })
}
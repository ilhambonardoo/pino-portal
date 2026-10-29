package helper

import (
	"log"
	"os"

	"github.com/joho/godotenv"
)

func LoadEnv(){
	err := godotenv.Load()
	if err != nil {
		log.Println("Info : File .env tidak ditemukan, menggunakan environment system")
	}
}

func GetEnv(key string, fallback string) string {
	value := os.Getenv(key)

	if value == "" {
		return fallback
	}

	return value
}
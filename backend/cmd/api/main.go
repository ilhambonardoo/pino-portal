package main

import (
	"log"
	"pino-portal/config"

	_ "github.com/go-sql-driver/mysql"
)

func main(){
	config.LoadEnv()

	server := InitializedServer()

	if err := server.ListenAndServe(); err != nil {
		log.Fatalf("Gagal menjalankan server : %v", err)
	}
}
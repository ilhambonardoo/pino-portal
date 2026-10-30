package main

import (
	"log"
	"pino-portal/helper"

	_ "github.com/go-sql-driver/mysql"
)

func main(){
	helper.LoadEnv()

	server := InitializedServer()

	if err := server.ListenAndServe(); err != nil {
		log.Fatalf("Gagal menjalankan server : %v", err)
	}
}
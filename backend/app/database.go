package app

import (
	"database/sql"
	"fmt"
	"log"
	"pino-portal/helper"
	"time"
)

func NewDB() *sql.DB{
	dbUser := helper.GetEnv("DB_USER", "root")
	dbPass := helper.GetEnv("DB_PASS", "")
	dbHost := helper.GetEnv("DB_HOST", "127.0.0.1")
	dbPort := helper.GetEnv("DB_PORT", "3307")
	dbName := helper.GetEnv("DB_NAME", "pino_db")

	dsn := fmt.Sprintf("%s:%s@tcp(%s:%s)/%s?charset=utf8mb4&parseTime=True&loc=Local", dbUser, dbPass, dbHost, dbPort, dbName)

	db, err := sql.Open("mysql", dsn)
	if err != nil {
		log.Fatalf("Gagal membuka koneksi MYSQL %v", err)
	}

	db.SetMaxOpenConns(20)
	db.SetMaxIdleConns(5)
	db.SetConnMaxLifetime(60 * time.Minute)
	db.SetConnMaxIdleTime(10 * time.Minute)

	if err := db.Ping(); err != nil {
		log.Fatalf("Gagal terhubung ke MySQL: %v. Pastikan MySQL aktif dan database '%s' sudah dibuat.", err, dbName)
	}

	fmt.Println("Koneksi ke MySQL Berhasil!")
	return db
}
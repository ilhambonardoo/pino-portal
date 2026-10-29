package repository

import (
	"context"
	"database/sql"
	"pino-portal/model"
)

type UserRepository interface {
	Save(ctx context.Context, tx *sql.Tx, user model.User) (model.User, error)
	FindByUsername(ctx context.Context, db *sql.DB, username string) (model.User, error)
	FindById(ctx context.Context, db *sql.DB, userId int) (model.User, error)
}
package repository

import (
	"context"
	"database/sql"
	"pino-portal/model"
)

type UserRepository interface {
	Save(ctx context.Context, tx *sql.Tx, user model.User) (model.User, error)
	FindByUsername(ctx context.Context, db Queryer, username string) (model.User, error)
	FindByID(ctx context.Context, db Queryer, userId int) (model.User, error)
	FindAll(ctx context.Context, db Queryer)([]model.User, error)
	Update(ctx context.Context, tx *sql.Tx, user model.User)(model.User, error)
	Delete(ctx context.Context, tx *sql.Tx, userId int) (model.User, error)
}

type Queryer interface {
    QueryRowContext(ctx context.Context, query string, args ...any) *sql.Row
    QueryContext(ctx context.Context, query string, args ...any) (*sql.Rows, error)
}
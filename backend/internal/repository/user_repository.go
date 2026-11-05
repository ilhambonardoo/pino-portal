package repository

import (
	"context"
	"database/sql"
	"pino-portal/internal/domain"
)

type UserRepository interface {
	Save(ctx context.Context, tx *sql.Tx, user domain.User) (domain.User, error)
	FindByUsername(ctx context.Context, db Queryer, username string) (domain.User, error)
	FindByID(ctx context.Context, db Queryer, userId int) (domain.User, error)
	FindAll(ctx context.Context, db Queryer)([]domain.User, error)
	Update(ctx context.Context, tx *sql.Tx, user domain.User)(domain.User, error)
	Delete(ctx context.Context, tx *sql.Tx, userId int) (domain.User, error)
}

type Queryer interface {
    QueryRowContext(ctx context.Context, query string, args ...any) *sql.Row
    QueryContext(ctx context.Context, query string, args ...any) (*sql.Rows, error)
}
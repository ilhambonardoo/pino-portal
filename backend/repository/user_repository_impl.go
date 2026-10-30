package repository

import (
	"context"
	"database/sql"
	"errors"
	"pino-portal/model"

	"github.com/google/wire"
)

type UserRepositoryImpl struct {
}

func NewUserRepository() *UserRepositoryImpl {
	return &UserRepositoryImpl{}
}

var UserRepositorySet = wire.NewSet(
	NewUserRepository,
	wire.Bind(new(UserRepository), new(*UserRepositoryImpl)),
)

func (r *UserRepositoryImpl) Save(ctx context.Context, tx *sql.Tx, user model.User) (model.User, error){
	query := "INSERT INTO users (username, password_hash, role) VALUES (?, ?, ?)"
	res, err := tx.ExecContext(ctx, query, user.Username, user.PasswordHash, user.Role)

	if err != nil {
		return user, err
	}

	id, err := res.LastInsertId()
	if err != nil {
		return user, err
	}

	user.ID = int(id)
	return user, nil
}

func (r *UserRepositoryImpl) FindByUsername(ctx context.Context, db Queryer, username string) (model.User, error){
	query := "SELECT id, username, password_hash, role, created_at FROM users WHERE username = ?"
	row := db.QueryRowContext(ctx, query, username)
	
	var user model.User

	err := row.Scan(&user.ID, &user.Username, &user.PasswordHash, &user.Role, &user.CreatedAt)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows){
			return user, errors.New("user tidak ditemukan!")
		}
		return user, err
	}

	return user, nil
}

func (r *UserRepositoryImpl) FindByID(ctx context.Context, db Queryer, userId int) (model.User, error){
	query := "SELECT id, username, password_hash, role, created_at FROM users WHERE id = ?"
	row := db.QueryRowContext(ctx, query, userId)

	var user model.User

	err := row.Scan(&user.ID, &user.Username, &user.PasswordHash, &user.Role, &user.CreatedAt)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows){
			return user, errors.New("user tidak ditemukan!")
		}
		return user, err
	}

	return user, err
}

func (r *UserRepositoryImpl) FindAll(ctx context.Context, db Queryer) ([]model.User, error){
	query := "SELECT id, username, role, created_at FROM users"
	rows, err := db.QueryContext(ctx, query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var users []model.User
	for rows.Next(){
		var user model.User
		err := rows.Scan(&user.ID, &user.Username, &user.Role, &user.CreatedAt)
		if err != nil{
			return  nil, err
		}
		users = append(users, user)
	}

	return users, nil
}

func (r *UserRepositoryImpl) Update(ctx context.Context, tx *sql.Tx, user model.User) (model.User, error) {
	query := "UPDATE users SET username = ?, password_hash = ?, role = ? WHERE id = ? "
	_, err := tx.ExecContext(ctx, query, user.Username, user.PasswordHash, user.Role, user.ID)
	if err != nil {
		return user, err
	}
	return user, nil
}

func (r *UserRepositoryImpl) Delete(ctx context.Context, tx *sql.Tx, userId int) (model.User, error) {
	user, err := r.FindByID(ctx, tx, userId)
	if err != nil {
		return user, errors.New("User tidak ditemukan")
	}

	query := "DELETE FROM users WHERE id = ?"
	_, err = tx.ExecContext(ctx, query, userId)
	if err != nil {
		return user, err
	}
	return user, nil
}
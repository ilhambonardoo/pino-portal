package service

import (
	"context"
	"database/sql"
	"errors"
	"pino-portal/helper"
	"pino-portal/model"
	"pino-portal/repository"

	"github.com/go-playground/validator/v10"
	"github.com/google/wire"
	"golang.org/x/crypto/bcrypt"
)

type AuthServiceImpl struct{
	UserRepo repository.UserRepository
	DB *sql.DB
	Validate *validator.Validate
}

func NewAuthService(userRepo repository.UserRepository, db *sql.DB) *AuthServiceImpl {
	return &AuthServiceImpl{
		UserRepo: userRepo,
		DB: db,
		Validate: validator.New(),
	}
}

var AuthServiceSet = wire.NewSet(
	NewAuthService,
	wire.Bind(new(AuthService), new(*AuthServiceImpl)),
)

func (s *AuthServiceImpl) Register(ctx context.Context, req model.RegisterRequest) error {
	err := s.Validate.Struct(req)
	if err != nil {
		return errors.New("Validasi gagal: " + err.Error())
	}

	tx, err := s.DB.BeginTx(ctx, nil)

	if err != nil {
		return err
	}

	defer helper.CommitOrRollBack(tx)

	_, err = s.UserRepo.FindByUsername(ctx, tx, req.Username)
	if err == nil {
		return errors.New("Username sudah terdaftar")
	}

	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(req.Password), bcrypt.DefaultCost)
	
	if err != nil {
		return err
	}

	req.Role = "user"

	user := model.User {
		Username: req.Username,
		PasswordHash: string(hashedPassword),
		Role: req.Role,
	}

	_, err = s.UserRepo.Save(ctx, tx, user)

	return err
}

func (s *AuthServiceImpl) Login(ctx context.Context, req model.LoginRequest) (model.LoginResponse, error) {
	err := s.Validate.Struct(req)
	if err != nil {
		return model.LoginResponse{}, errors.New("Validasi gagal:" + err.Error())
	}

	user, err := s.UserRepo.FindByUsername(ctx, s.DB, req.Username)
	if err != nil {
		return model.LoginResponse{}, errors.New("Username atau password salah")
	}
	
	err = bcrypt.CompareHashAndPassword([]byte (user.PasswordHash), []byte(req.Password))
	if err != nil {
		return model.LoginResponse{}, errors.New("Username atau password salah")
	}

	token, err := helper.GenerateToken(user.ID, user.Role)
	if err != nil {
		return model.LoginResponse{}, err
	}

	return model.LoginResponse{
		Token: token,
		Role: user.Role,
	}, nil
}	
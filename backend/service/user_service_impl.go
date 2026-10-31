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

type UserServiceImpl struct {
	UserRepo repository.UserRepository
	DB       *sql.DB
	Validate *validator.Validate
}

func NewUserService(userRepo repository.UserRepository, db *sql.DB) *UserServiceImpl {
	return &UserServiceImpl{
		UserRepo: userRepo,
		DB:       db,
		Validate: validator.New(),
	}
}

var UserServiceSet = wire.NewSet(
	NewUserService,
	wire.Bind(new(UserService), new(*UserServiceImpl)),
)

func (s *UserServiceImpl) Create(ctx context.Context, req model.RegisterRequest) (model.UserResponse, error) {
	if req.Role == "" {
		req.Role = "user"
	}

	err := s.Validate.Struct(req)
	if err != nil {
		return model.UserResponse{}, errors.New("validasi gagal: " + err.Error())
	}

	tx, err := s.DB.BeginTx(ctx, nil)
	if err != nil {
		return model.UserResponse{}, err
	}
	defer helper.CommitOrRollBack(tx)

	_, err = s.UserRepo.FindByUsername(ctx, tx, req.Username)
	if err == nil {
		return model.UserResponse{}, errors.New("username sudah terdaftar")
	}

	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(req.Password), bcrypt.DefaultCost)
	if err != nil {
		return model.UserResponse{}, err
	}

	user := model.User{
		Username:     req.Username,
		PasswordHash: string(hashedPassword),
		Role:         req.Role,
	}

	savedUser, err := s.UserRepo.Save(ctx, tx, user)
	if err != nil {
		return model.UserResponse{}, err
	}

	return model.UserResponse{
		ID:        savedUser.ID,
		Username:  savedUser.Username,
		Role:      savedUser.Role,
		CreatedAt: savedUser.CreatedAt,
	}, nil
}

func (s *UserServiceImpl) Update(ctx context.Context, req model.UpdateUserRequest) (model.UserResponse, error) {
	err := s.Validate.Struct(req)
	if err != nil {
		return model.UserResponse{}, errors.New("validasi gagal: " + err.Error())
	}

	tx, err := s.DB.BeginTx(ctx, nil)
	if err != nil {
		return model.UserResponse{}, err
	}
	defer helper.CommitOrRollBack(tx)

	existingUser, err := s.UserRepo.FindByID(ctx, tx, req.ID)
	if err != nil {
		return model.UserResponse{}, errors.New("user tidak ditemukan")
	}

	if existingUser.Username != req.Username {
		_, err := s.UserRepo.FindByUsername(ctx, tx, req.Username)
		if err == nil {
			return model.UserResponse{}, errors.New("username sudah digunakan")
		}
	}

	existingUser.Username = req.Username
	existingUser.Role = req.Role

	if req.Password != "" {
		hashedPassword, err := bcrypt.GenerateFromPassword([]byte(req.Password), bcrypt.DefaultCost)
		if err != nil {
			return model.UserResponse{}, err
		}
		existingUser.PasswordHash = string(hashedPassword)
	}

	updatedUser, err := s.UserRepo.Update(ctx, tx, existingUser)
	if err != nil {
		return model.UserResponse{}, err
	}

	return model.UserResponse{
		ID:        updatedUser.ID,
		Username:  updatedUser.Username,
		Role:      updatedUser.Role,
		CreatedAt: updatedUser.CreatedAt,
	}, nil
}

func (s *UserServiceImpl) Delete(ctx context.Context, userId int, targetId int) error {
	if userId == targetId {
		return errors.New("Anda tidak dapat menghapus akun sendiri.")
	}

	tx, err := s.DB.BeginTx(ctx, nil)
	if err != nil {
		return err
	}
	defer helper.CommitOrRollBack(tx)

	_, err = s.UserRepo.Delete(ctx, tx, targetId)
	return err
}

func (s *UserServiceImpl) FindByID(ctx context.Context, userId int) (model.UserResponse, error) {
	user, err := s.UserRepo.FindByID(ctx, s.DB, userId)
	if err != nil {
		return model.UserResponse{}, errors.New("user tidak ditemukan")
	}

	return model.UserResponse{
		ID:        user.ID,
		Username:  user.Username,
		Role:      user.Role,
		CreatedAt: user.CreatedAt,
	}, nil
}

func (s *UserServiceImpl) FindAll(ctx context.Context) ([]model.UserResponse, error) {
	users, err := s.UserRepo.FindAll(ctx, s.DB)
	if err != nil {
		return nil, err
	}

	var responses []model.UserResponse
	for _, u := range users {
		responses = append(responses, model.UserResponse{
			ID:        u.ID,
			Username:  u.Username,
			Role:      u.Role,
			CreatedAt: u.CreatedAt,
		})
	}
	return responses, nil
}

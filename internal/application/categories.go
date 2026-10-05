package application

import (
	"context"
	"github.com/palmid3v/financial-d3v-palmid3v/internal/domain"
	"github.com/palmid3v/financial-d3v-palmid3v/internal/persistence"
)

type CategoryService struct{ categories persistence.CategoryRepository }
func NewCategoryService(categories persistence.CategoryRepository)*CategoryService{return &CategoryService{categories:categories}}
func(s *CategoryService)Create(ctx context.Context,v domain.Category)error{return s.categories.Create(ctx,v)}
func(s *CategoryService)Get(ctx context.Context,ownerID,id string)(domain.Category,error){return s.categories.Get(ctx,ownerID,id)}
func(s *CategoryService)List(ctx context.Context,ownerID string)([]domain.Category,error){return s.categories.List(ctx,ownerID)}

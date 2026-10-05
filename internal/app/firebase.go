package app

import (
	"context"
	"errors"
	firebase "firebase.google.com/go/v4"
	"google.golang.org/api/option"
	"github.com/palmid3v/financial-d3v-palmid3v/internal/config"
)

var ErrFirebaseDisabled = errors.New("firebase is disabled")
type Firebase struct { App *firebase.App }
func NewFirebase(ctx context.Context, cfg config.Config) (*Firebase, error) {
	if !cfg.FirebaseEnabled { return nil, ErrFirebaseDisabled }
	conf := &firebase.Config{ProjectID: cfg.FirebaseProjectID}
	var opts []option.ClientOption
	if cfg.FirebaseCredentials != "" { opts = append(opts, option.WithCredentialsFile(cfg.FirebaseCredentials)) }
	app, err := firebase.NewApp(ctx, conf, opts...)
	if err != nil { return nil, err }
	return &Firebase{App: app}, nil
}

package appctx

import (
	"encoding/json"
	"fmt"
	"os"
	"os/exec"
	"path/filepath"
)

type Context struct {
	Root       string
	CommitHash string
	AppVersion string
}

func Resolve() (*Context, error) {
	root, err := repoRoot()
	if err != nil {
		return nil, err
	}

	commitHash, err := shortCommitHash(root)
	if err != nil {
		return nil, err
	}

	appVersion, err := appVersion(root)
	if err != nil {
		return nil, err
	}

	return &Context{Root: root, CommitHash: commitHash, AppVersion: appVersion}, nil
}

func repoRoot() (string, error) {
	exe, err := os.Executable()
	if err != nil {
		return "", err
	}
	binDir := filepath.Dir(exe)
	pusherDir := filepath.Dir(binDir)
	pkgDir := filepath.Dir(pusherDir)
	root := filepath.Dir(pkgDir)
	if _, err := os.Stat(filepath.Join(root, "app.json")); err == nil {
		return root, nil
	}
	cwd, err := os.Getwd()
	if err != nil {
		return "", err
	}
	if _, err := os.Stat(filepath.Join(cwd, "app.json")); err == nil {
		return cwd, nil
	}
	return "", fmt.Errorf("could not find repo root (app.json) near %s or %s", root, cwd)
}

func shortCommitHash(root string) (string, error) {
	cmd := exec.Command("git", "rev-parse", "--short", "HEAD")
	cmd.Dir = root
	out, err := cmd.Output()
	if err != nil {
		return "", fmt.Errorf("git rev-parse --short HEAD failed: %w", err)
	}
	return string(out[:len(out)-1]), nil
}

func appVersion(root string) (string, error) {
	data, err := os.ReadFile(filepath.Join(root, "app.json"))
	if err != nil {
		return "", err
	}
	var cfg struct {
		Expo struct {
			Version string `json:"version"`
		} `json:"expo"`
	}
	if err := json.Unmarshal(data, &cfg); err != nil {
		return "", fmt.Errorf("parse app.json: %w", err)
	}
	if cfg.Expo.Version == "" {
		return "", fmt.Errorf("app.json has no expo.version")
	}
	return cfg.Expo.Version, nil
}
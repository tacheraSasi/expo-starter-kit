package record

import (
	"encoding/json"
	"fmt"
	"os"
	"path/filepath"
)

type Update struct {
	Message        string `json:"message"`
	Channel        string `json:"channel"`
	RuntimeVersion string `json:"runtime_version"`
	Platform       string `json:"platform"`
	CommitHash     string `json:"commit_hash"`
	Republished    bool   `json:"republished"`
	Date           string `json:"date"`
}

type file struct {
	Updates []Update `json:"ota_updates"`
}

func Prepend(root string, update Update) error {
	path := filepath.Join(root, "pkg", "ota-pusher", "ota-updates.json")

	data, err := os.ReadFile(path)
	history := file{}
	if err == nil {
		if err := json.Unmarshal(data, &history); err != nil {
			return fmt.Errorf("parse %s: %w", path, err)
		}
	} else if !os.IsNotExist(err) {
		return err
	}

	history.Updates = append([]Update{update}, history.Updates...)

	out, err := json.MarshalIndent(history, "", "  ")
	if err != nil {
		return err
	}
	return os.WriteFile(path, append(out, '\n'), 0o644)
}

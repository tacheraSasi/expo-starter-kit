package main

import (
	"encoding/json"
	"flag"
	"fmt"
	"os"
	"strings"
)

const (
	AppJSON     = "app.json"
	PackageJSON = "package.json"
)

type BumpType int

const (
	Patch BumpType = iota
	Minor
	Major
)

func main() {
	bumpType := parseFlags()

	if err := ensureRootFile(AppJSON); err != nil {
		die(err)
	}
	if err := ensureRootFile(PackageJSON); err != nil {
		die(err)
	}

	if err := bumpExpoAppVersion(AppJSON, bumpType); err != nil {
		die(err)
	}

	if err := bumpPackageVersion(PackageJSON, bumpType); err != nil {
		die(err)
	}

	fmt.Println("Versions updated successfully")
}

func parseFlags() BumpType {
	minor := flag.Bool("minor", false, "bump minor version")
	major := flag.Bool("major", false, "bump major version")
	flag.Parse()

	if *minor && *major {
		die(fmt.Errorf("only one of --minor or --major can be used"))
	}

	if *major {
		return Major
	}
	if *minor {
		return Minor
	}
	return Patch
}

func bumpExpoAppVersion(path string, bumpType BumpType) error {
	data, original, err := readJSON(path)
	if err != nil {
		return err
	}

	expo, ok := data["expo"].(map[string]any)
	if !ok {
		return fmt.Errorf("missing expo field in %s", path)
	}

	version, ok := expo["version"].(string)
	if !ok {
		return fmt.Errorf("missing expo.version in %s", path)
	}

	newVersion, err := applyBump(version, bumpType)
	if err != nil {
		return err
	}

	expo["version"] = newVersion
	return writeJSON(path, original, version, newVersion)
}

func bumpPackageVersion(path string, bumpType BumpType) error {
	data, original, err := readJSON(path)
	if err != nil {
		return err
	}

	version, ok := data["version"].(string)
	if !ok {
		return fmt.Errorf("missing version in %s", path)
	}

	newVersion, err := applyBump(version, bumpType)
	if err != nil {
		return err
	}

	data["version"] = newVersion
	return writeJSON(path, original, version, newVersion)
}

func applyBump(version string, bumpType BumpType) (string, error) {
	switch bumpType {
	case Major:
		return bumpMajor(version)
	case Minor:
		return bumpMinor(version)
	default:
		return bumpPatch(version)
	}
}

func readJSON(path string) (map[string]any, string, error) {
	raw, err := os.ReadFile(path)
	if err != nil {
		return nil, "", fmt.Errorf("failed to read %s: %w", path, err)
	}

	original := string(raw)
	clean := removeJSONComments(original)

	var data map[string]any
	if err := json.Unmarshal([]byte(clean), &data); err != nil {
		return nil, "", err
	}

	return data, original, nil
}

func writeJSON(path, original, oldVersion, newVersion string) error {
	updated := strings.Replace(
		original,
		fmt.Sprintf(`"%s"`, oldVersion),
		fmt.Sprintf(`"%s"`, newVersion),
		1,
	)

	return os.WriteFile(path, []byte(updated), 0644)
}

func bumpPatch(version string) (string, error) {
	var major, minor, patch int
	if _, err := fmt.Sscanf(version, "%d.%d.%d", &major, &minor, &patch); err != nil {
		return "", fmt.Errorf("invalid version: %s", version)
	}
	return fmt.Sprintf("%d.%d.%d", major, minor, patch+1), nil
}

func bumpMinor(version string) (string, error) {
	var major, minor, patch int
	if _, err := fmt.Sscanf(version, "%d.%d.%d", &major, &minor, &patch); err != nil {
		return "", fmt.Errorf("invalid version: %s", version)
	}
	return fmt.Sprintf("%d.%d.0", major, minor+1), nil
}

func bumpMajor(version string) (string, error) {
	var major, minor, patch int
	if _, err := fmt.Sscanf(version, "%d.%d.%d", &major, &minor, &patch); err != nil {
		return "", fmt.Errorf("invalid version: %s", version)
	}
	return fmt.Sprintf("%d.0.0", major+1), nil
}

func removeJSONComments(content string) string {
	lines := strings.Split(content, "\n")
	var cleaned []string

	for _, line := range lines {
		inString := false
		escaped := false

		for i := 0; i < len(line)-1; i++ {
			if escaped {
				escaped = false
				continue
			}

			if line[i] == '\\' {
				escaped = true
				continue
			}

			if line[i] == '"' {
				inString = !inString
				continue
			}

			if !inString && line[i] == '/' && line[i+1] == '/' {
				line = strings.TrimSpace(line[:i])
				break
			}
		}

		if line != "" {
			cleaned = append(cleaned, line)
		}
	}

	return strings.Join(cleaned, "\n")
}

func ensureRootFile(path string) error {
	info, err := os.Stat(path)
	if err != nil {
		if os.IsNotExist(err) {
			return fmt.Errorf(
				"%s not found. Run this command from the project root (where %s exists)",
				path,
				path,
			)
		}
		return fmt.Errorf("cannot access %s: %w", path, err)
	}

	if info.IsDir() {
		return fmt.Errorf("%s is a directory, expected a file", path)
	}

	return nil
}

func die(err error) {
	fmt.Println("error:", err)
	os.Exit(1)
}

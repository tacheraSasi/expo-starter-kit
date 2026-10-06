BINARY_NAME=expobump

# Build directory
BUILD_DIR=bin

# Go parameters
GOCMD=go
GOBUILD=$(GOCMD) build
GOCLEAN=$(GOCMD) clean
GOTEST=$(GOCMD) test
GOMOD=$(GOCMD) mod

# Build flags
LDFLAGS=-ldflags "-s -w"

# Version info
VERSION?=$(shell git describe --tags --always --dirty 2>/dev/null || echo "dev")

.PHONY: all build clean test help linux windows darwin local deps install zip

# Default target
all: clean build zip

# Build for all platforms (4 binaries)
build: linux windows darwin-intel darwin-arm

# Help target
help:
	@echo "Available targets:"
	@echo "  all        - Clean, build for all platforms, and zip"
	@echo "  build      - Build for Linux, Windows, and macOS (both architectures)"
	@echo "  linux      - Build for Linux (amd64)"
	@echo "  windows    - Build for Windows (amd64)"
	@echo "  darwin-intel - Build for macOS Intel (amd64)"
	@echo "  darwin-arm - Build for macOS Apple Silicon (arm64)"
	@echo "  darwin     - Build for both macOS architectures"
	@echo "  zip        - Create zip archives of all binaries"
	@echo "  local      - Build for current platform"
	@echo "  test       - Run tests"
	@echo "  clean      - Remove build artifacts"
	@echo "  deps       - Download dependencies"
	@echo "  install    - Install to GOPATH"

# Create build directory
$(BUILD_DIR):
	@mkdir -p $(BUILD_DIR)

# Linux build (amd64)
linux: $(BUILD_DIR)
	@echo "Building for Linux..."
	@GOOS=linux GOARCH=amd64 $(GOBUILD) $(LDFLAGS) -o $(BUILD_DIR)/$(BINARY_NAME)-linux .

# Windows build (amd64)
windows: $(BUILD_DIR)
	@echo "Building for Windows..."
	@GOOS=windows GOARCH=amd64 $(GOBUILD) $(LDFLAGS) -o $(BUILD_DIR)/$(BINARY_NAME)-windows.exe .

# macOS Intel build (amd64)
darwin-intel: $(BUILD_DIR)
	@echo "Building for macOS Intel..."
	@GOOS=darwin GOARCH=amd64 $(GOBUILD) $(LDFLAGS) -o $(BUILD_DIR)/$(BINARY_NAME)-macos-intel .

# macOS Apple Silicon build (arm64)
darwin-arm: $(BUILD_DIR)
	@echo "Building for macOS Apple Silicon..."
	@GOOS=darwin GOARCH=arm64 $(GOBUILD) $(LDFLAGS) -o $(BUILD_DIR)/$(BINARY_NAME)-macos-arm .

# Build both macOS architectures
darwin: darwin-intel darwin-arm

# Build for current platform only
local: $(BUILD_DIR)
	@echo "Building for current platform..."
	@$(GOBUILD) $(LDFLAGS) -o $(BUILD_DIR)/$(BINARY_NAME) .

# Run tests
test:
	@echo "Running tests..."
	@$(GOTEST) -v ./...

# Download dependencies
deps:
	@echo "Downloading dependencies..."
	@$(GOMOD) download
	@$(GOMOD) tidy

# Clean build artifacts
clean:
	@echo "Cleaning..."
	@$(GOCLEAN)
	@rm -rf $(BUILD_DIR)

# Install locally
install: local
	@echo "Installing $(BINARY_NAME)..."
	@cp $(BUILD_DIR)/$(BINARY_NAME) $(GOPATH)/bin/

# Create zip archives
zip:
	@echo "Creating zip archives..."
	@cd $(BUILD_DIR) && \
	if [ -f "$(BINARY_NAME)-linux" ]; then \
		zip -q $(BINARY_NAME)-linux.zip $(BINARY_NAME)-linux && \
		echo "Created $(BINARY_NAME)-linux.zip"; \
	fi
	@cd $(BUILD_DIR) && \
	if [ -f "$(BINARY_NAME)-windows.exe" ]; then \
		zip -q $(BINARY_NAME)-windows.zip $(BINARY_NAME)-windows.exe && \
		echo "Created $(BINARY_NAME)-windows.zip"; \
	fi
	@cd $(BUILD_DIR) && \
	if [ -f "$(BINARY_NAME)-macos-intel" ]; then \
		zip -q $(BINARY_NAME)-macos-intel.zip $(BINARY_NAME)-macos-intel && \
		echo "Created $(BINARY_NAME)-macos-intel.zip"; \
	fi
	@cd $(BUILD_DIR) && \
	if [ -f "$(BINARY_NAME)-macos-arm" ]; then \
		zip -q $(BINARY_NAME)-macos-arm.zip $(BINARY_NAME)-macos-arm && \
		echo "Created $(BINARY_NAME)-macos-arm.zip"; \
	fi
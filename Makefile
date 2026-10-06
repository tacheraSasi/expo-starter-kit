run:
	bun start -c

COMMIT_HASH != git rev-parse --short HEAD
export EXPO_PUBLIC_COMMIT_HASH = $(COMMIT_HASH)

update-version: 
	expobump 

# Android builds
build-apk: update-version
	bunx eas build -p android --profile preview

build-production: update-version
	bunx eas build -p android --profile production

build-development:
	bunx eas build -p android --profile dev

build-submit: update-version
	bunx eas build -p android --profile production --auto-submit

# iOS builds
build-ios-dev: update-version
	bunx eas build -p ios --profile dev

build-ios-preview: update-version
	bunx eas build -p ios --profile preview4

build-ios-production:
	bunx eas build -p ios --profile production

build-ios-simulator:
	bunx eas build -p ios --profile ios-simulator

build-ios-submit: update-version
	bunx eas build -p ios --profile production --auto-submit

submit-ios:
	bunx eas submit -p ios --profile production

# Both platforms
build-all-production: update-version
	bunx eas build --profile production

build-all-submit: update-version
	bunx eas build --profile production --auto-submit

# OTA updates via Go pusher (injects commit hash, records update in ota-updates.json)
ota: build-pusher
	./pkg/ota-pusher/bin/pusher --msg="$(msg)" --environment="$(or $(environment),production)"

ota-preview: build-pusher
	./pkg/ota-pusher/bin/pusher --msg="$(msg)" --environment="preview"

build-pusher: pkg/ota-pusher/main.go
	cd pkg/ota-pusher && go build -o bin/pusher .

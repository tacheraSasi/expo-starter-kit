# expobump

A fast CLI for keeping Expo app versions in sync.
Bumps `app.json` and `package.json` in one command, following semantic versioning.

`expobump` is designed to be run **from the root of an Expo project**, where both `app.json` and `package.json` live.


## Why expobump

In Expo projects, versioning easily drifts out of sync:

* `expo.version` in `app.json`
* `version` in `package.json`
* runtime access via Expo APIs

Manually updating these is boring, error-prone, and easy to forget.

`expobump` fixes that.



## Installation

### Option 1: Download pre-built binaries (Recommended)

#### macOS

**For Apple Silicon Macs (M1, M2, M3, etc.):**

```sh
# Download the Apple Silicon binary
curl -L https://github.com/tacheraSasi/expobump/releases/download/v1.0.0/expobump-macos-arm.zip -o expobump-macos.zip

# Unzip the binary
unzip expobump-macos.zip

# Move to /usr/local/bin for global access
sudo mv expobump-macos-arm /usr/local/bin/expobump

# Make it executable
sudo chmod +x /usr/local/bin/expobump

# Clean up
rm expobump-macos.zip
```

**For Intel Macs:**

```sh
# Download the Intel binary
curl -L https://github.com/tacheraSasi/expobump/releases/download/v1.0.0/expobump-macos-intel.zip -o expobump-macos.zip

# Unzip the binary
unzip expobump-macos.zip

# Move to /usr/local/bin for global access
sudo mv expobump-macos-intel /usr/local/bin/expobump

# Make it executable
sudo chmod +x /usr/local/bin/expobump

# Clean up
rm expobump-macos.zip
```

**Not sure which Mac you have?** Run `uname -m` in your terminal:
- `arm64` = Apple Silicon (use the first set of commands)
- `x86_64` = Intel (use the second set of commands)

#### Linux

```sh
# Download the Linux binary
curl -L https://github.com/tacheraSasi/expobump/releases/download/v1.0.0/expobump-linux.zip -o expobump-linux.zip

# Unzip the binary
unzip expobump-linux.zip

# Move to /usr/local/bin for global access
sudo mv expobump-linux /usr/local/bin/expobump

# Make it executable
sudo chmod +x /usr/local/bin/expobump

# Clean up
rm expobump-linux.zip
```

### Option 2: Build from source

```sh
go build -o expobump
```

Move it somewhere on your PATH if you want global access.



## Usage

Run from the **project root**:

```sh
expobump
```

Defaults to a **patch** bump.

### Version bump options

```sh
expobump           # patch (default)
expobump --minor   # minor
expobump --major   # major
```

Only one flag is allowed at a time.



## What it updates

### app.json

```json
{
  "expo": {
    "version": "1.2.3"
  }
}
```

### package.json

```json
{
  "version": "1.2.3"
}
```

Both are bumped together to keep your project consistent.



## Error behavior

`expobump` is opinionated and fails fast.

If run outside the project root:

```txt
error: app.json not found. Run this command from the project root (where app.json exists)
```

Same applies to `package.json`.



## Using the version inside your Expo app

Expo exposes app version information at runtime via official APIs.

### Using `expo-constants`

```ts
import Constants from "expo-constants";

const appVersion = Constants.expoConfig?.version;
```

Docs:
[https://docs.expo.dev/versions/latest/sdk/constants/](https://docs.expo.dev/versions/latest/sdk/constants/)

This value maps directly to:

```json
expo.version
```

in `app.json`, which `expobump` updates.



### Using `expo-application`

For native build versions:

```ts
import * as Application from "expo-application";

const nativeVersion = Application.nativeApplicationVersion;
const buildVersion = Application.nativeBuildVersion;
```

Docs:
[https://docs.expo.dev/versions/latest/sdk/application/#applicationnativebuildversion](https://docs.expo.dev/versions/latest/sdk/application/#applicationnativebuildversion)

These values are useful when:

* showing version info in settings screens
* logging build metadata
* debugging OTA vs native mismatches



## Typical workflow

1. Make changes
2. Bump version

   ```sh
   expobump --minor
   ```
3. Commit
4. Build or publish

No manual edits. No mismatches.



## Design goals

* Fast
* Zero config
* No dependencies
* Clear errors
* Expo-specific and opinionated

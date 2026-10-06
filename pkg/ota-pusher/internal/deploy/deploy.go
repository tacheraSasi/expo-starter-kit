package deploy

import (
	"os"
	"os/exec"

	"akilisoft/ota-pusher/internal/appctx"
)

func Update(ctx *appctx.Context, environment, msg string) error {
	cmd := exec.Command("bunx", "eas", "update",
		"--branch", environment,
		"--environment", environment,
		"--message", msg,
	)
	cmd.Dir = ctx.Root
	cmd.Env = append(os.Environ(), "EXPO_PUBLIC_COMMIT_HASH="+ctx.CommitHash)
	cmd.Stdin = os.Stdin
	cmd.Stdout = os.Stdout
	cmd.Stderr = os.Stderr

	return cmd.Run()
}
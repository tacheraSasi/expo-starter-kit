package main

import (
	"flag"
	"fmt"
	"os"
	"time"

	"akilisoft/ota-pusher/internal/appctx"
	"akilisoft/ota-pusher/internal/deploy"
	"akilisoft/ota-pusher/internal/record"
)

func main() {
	msg := flag.String("msg", "", "message for the OTA update (required)")
	environment := flag.String("environment", "production", "environment/branch to push to (default: production)")
	flag.Parse()

	if *msg == "" {
		fmt.Fprintln(os.Stderr, "error: --msg is required")
		flag.Usage()
		os.Exit(1)
	}

	ctx, err := appctx.Resolve()
	if err != nil {
		fatal(err)
	}

	if err := deploy.Update(ctx, *environment, *msg); err != nil {
		fmt.Fprintf(os.Stderr, "\nerror: eas update failed: %v\n", err)
		os.Exit(1)
	}
	now := time.Now().Format("2006-01-02")
	err = record.Prepend(ctx.Root, record.Update{
		Message:        *msg,
		Channel:        *environment,
		RuntimeVersion: ctx.AppVersion,
		Platform:       *environment,
		CommitHash:     ctx.CommitHash,
		Republished:    false,
		Date:           now,
	})
	if err != nil {
		fatal(err)
	}

	fmt.Println("OTA update recorded in pkg/ota-pusher/ota-updates.json")
}

func fatal(err error) {
	fmt.Fprintf(os.Stderr, "error: %v\n", err)
	os.Exit(1)
}

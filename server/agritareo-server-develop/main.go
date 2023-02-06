package main

import (
	_ "ns-api/controllers"
	"ns-api/core/filemanager"
	"ns-api/core/server"
	_ "ns-api/routes"
	"os"
	"os/signal"
	"syscall"
)

func main() {
	sings := make(chan os.Signal, 1)
	signal.Notify(sings, syscall.SIGINT, syscall.SIGTERM)

	go func() {
		<-sings
		filemanager.RemoveTemp()
		os.Exit(0)
	}()

	server.Run()
}

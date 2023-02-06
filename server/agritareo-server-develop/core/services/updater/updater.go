package updater

import (
	"context"
	"fmt"
	"io"
	agritareo "ns-api/Agritareo-Clima"
	"ns-api/config"
	"ns-api/core/services/mongodb"
	"ns-api/core/services/mssql"
	"ns-api/internal/dialer"
	"ns-api/internal/proto"
	"ns-api/modules/log"
	"time"
)

var (
	conf         = config.Conf
	Corporations []*proto.RegisterResponse_Corporation
	Languages    []*proto.RegisterResponse_Language
)

func Register(client proto.RouteClient, dom string) {
	app, err := client.Register(context.Background(), &proto.RegisterRequest{
		AppId:         "CC5FC137-F262-EA11-A2C0-AC1F6B804959",
		IpAddress:     "127.0.0.1",
		CorporationId: dom,
	})

	if nil != err {
		log.Error("Register request error ", err.Error())
		return
	}

	totalCorps := len(app.Corporations)

	if totalCorps != len(Corporations) {
		log.Info(totalCorps, " Corporations Found")
	} else if totalCorps == 0 {
		log.Warn("No Corporations Found")
	}

	Corporations = app.Corporations
	Languages = app.Languages

	for _, a := range app.Corporations {
		for _, c := range a.GetConnections() {
			//fmt.Println(a.Id, "---", c.Driver, "--", c.StringConnection, c.GetDriver(), a.Name, c.Driver)
			if !mssql.DB.Exists(a.Id) && "mssql" == c.GetDriver() {
				mssql.DB.AddConnection(&mssql.DatabaseConnection{
					Id:               a.Id,
					Name:             a.Name,
					Driver:           c.Driver,
					StringConnection: c.StringConnection,
				})
			}

			if !mongodb.DB.Exists(a.Id) && "mongodb" == c.GetDriver() {
				mongodb.DB.AddConnection(&mongodb.MongoConnection{
					Id:               a.Id,
					Name:             a.Name,
					Driver:           c.Driver,
					StringConnection: c.StringConnection,
					Database:         c.Database,
				})
			}

		}
	}

	time.AfterFunc(agritareo.Duration(), func() {
		agritareo.Clima(app.Corporations)
	})

}

func notifySubscribe(client proto.RouteClient) {
	stream, err := client.NotifyStream(context.Background(), &proto.NotifyRequest{
		AppId:         "CC5FC137-F262-EA11-A2C0-AC1F6B804959",
		ReceiveNotify: true,
	})

	if nil != err {
		fmt.Println("notify stream error ", err.Error())
		return
	}

	for {
		_, err := stream.Recv()

		if err == io.EOF {
			fmt.Println("Error eof")
			break
		}

		if nil != err {
			fmt.Println("Algo paso ", err.Error())
			break
		}

		//fmt.Println("La respuesta que buscamos ", in)
		//notify.Broadcast("sdsdsd", notify.DangerType)
	}

}

func updateSubscribe(client proto.RouteClient) {
	stream, err := client.UpdaterStream(context.Background())

	if nil != err {
		fmt.Println("update stream error ", err.Error())
		return
	}

	for {
		in, err := stream.Recv()

		if err == io.EOF {
			fmt.Println("Error eof")
			break
		}

		if nil != err {
			fmt.Println("Algo paso ", err.Error())
			break
		}

		fmt.Println("La respuesta que buscamos ", in)
	}

}

func Subscribe() {
	client, conn, err := dialer.RouteClient()

	if nil != err {
		panic("Updater subscribe " + err.Error())
	}

	defer func() {
		err = conn.Close()
		if nil != err {
			log.Errorf("Connection close error %s", err.Error())
		}
	}()

	Register(client, "")
	notifySubscribe(client)
	updateSubscribe(client)
}

package dialer

import (
	"fmt"
	"google.golang.org/grpc"
	"ns-api/config"
	"ns-api/internal/proto"
)

var (
	conf = config.Conf
)

type DialOption func(name string) (grpc.DialOption, error)

func Dial(name string, opts ...DialOption) (*grpc.ClientConn, error) {
	dialopts := []grpc.DialOption{
		grpc.WithInsecure(),
	}

	for _, fn := range opts {
		opt, err := fn(name)
		if nil != err {
			return nil, fmt.Errorf("config error: %v", err)
		}
		dialopts = append(dialopts, opt)
	}

	conn, err := grpc.Dial(name, dialopts...)

	if nil != err {
		return nil, fmt.Errorf("grpc failed to dial %s: %v", name, err)
	}

	return conn, nil
}

func RouteClient() (proto.RouteClient, *grpc.ClientConn, error) {
	host := fmt.Sprintf(`%s:%d`, conf.FetchServer.Host, conf.FetchServer.Port)
	conn, err := Dial(host)

	if nil != err {
		return nil, nil, err
	}

	client := proto.NewRouteClient(conn)
	return client, conn, nil
}

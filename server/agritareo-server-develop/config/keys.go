package config

import (
	"crypto/rsa"
	"github.com/dgrijalva/jwt-go"
)

const (
	PublicKey = `-----BEGIN PUBLIC KEY-----
MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQDUysuZk7psdt6spaO4CZ+e9eCu
XdWXqjZg6joCQABKlyTiOZItNKa4xxdN+cqmorr9EAc3U311wOqU7MB8K6lCem+J
kPo1soAXofnTAmQaZJ3Td5tw2Nfw5zD2BcI6a5xDa9eAiVyhOqo81oTXWxxefOFR
p780rgm1RH49Lq5xPwIDAQAB
-----END PUBLIC KEY-----`

	PrivateKey = `-----BEGIN RSA PRIVATE KEY-----
MIICXQIBAAKBgQDUysuZk7psdt6spaO4CZ+e9eCuXdWXqjZg6joCQABKlyTiOZIt
NKa4xxdN+cqmorr9EAc3U311wOqU7MB8K6lCem+JkPo1soAXofnTAmQaZJ3Td5tw
2Nfw5zD2BcI6a5xDa9eAiVyhOqo81oTXWxxefOFRp780rgm1RH49Lq5xPwIDAQAB
AoGBAMvxwcljyR0DoM+fwZY1wwK7bagwzvIZdRzV4NsfNChJTFR2ER+6gsA+MJvP
eObUuJqqrf/cyTX+u9YYQzO/NOx+nJyJdWNCJpUzqhzISIQ1dN362tzkxmVrPAvf
KTL92qzUVQZcoP0SB2hsENyKzMzI/TKm4b6sswEaGL0HRb9hAkEA7zazKprRIJuy
jRvWHvPsb0ZBzxaYV01ptaSbtt/gkSc4STZxmPgBC582g2oogMBysq+zaOG56NVm
DLLic7UptQJBAOO5c8sQ6LyyAY+pR5fzqHsVmDaLPMTCfG1bSRiG4nDG3yekjWyf
JSsQMu5Ebnmt1+jeBRDbiIDjt+BSxHxDN6MCQFSeheyJTXb6fMPb1/elE7sdIERw
Wr1vPfiqXQbo1Rijxg5n+vFAsaX50R/VmrRI34oECzQLvWb2rh3J3b9Ok40CQQDE
6Q5sT/G/gHiDHdAvX1yXGcQlnd5tEPMAqIebMr9I314E7G/xtecwxnATwY55ns3s
qVZeDkaJlN7hlRAblw/bAkBU8ZvbccoY9qx5NDcDkDAc3R0Z+n8XtnGvTLPhwlPz
qPb/eiLt6uBqJ7bOQUJk95usxA7SSVvKkH8t5Axh+HNR
-----END RSA PRIVATE KEY-----`
)

var RSAPublicKey *rsa.PublicKey
var RSAPrivateKey *rsa.PrivateKey

func init() {
	var err error

	// Parse rsa private key
	RSAPrivateKey, err = jwt.ParseRSAPrivateKeyFromPEM([]byte(PrivateKey))
	if err != nil {
		panic("you cannot parse the private certificate")
	}

	// Parse rsa public key
	RSAPublicKey, err = jwt.ParseRSAPublicKeyFromPEM([]byte(PublicKey))
	if err != nil {
		panic("you cannot parse the public certificate")
	}
}

package utils

import (
	"strings"
)

//encriptacion #fasica
var cadenaOriginal = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890.{}[]'`,_\\:/ @%$#&*-"
var cadenaEncriptado = "0z10w10x10y10f10t10g10u10d10v10b10c10s10q10e10i10p10o10n10m10a10h10l10k10r10j10z10w10x10y10f10t10g10u10d10v10b10c10s10q10e10i10p10o10n10m10a10h10l10k10r10j1ertqwsasdsdfdfgbhgnjhrtgloimkipoiytrjyytyuerfgyulpumjksgkplw34d87u23d34f45g56t67k78YT89"

//encriptacion #Moncular
var cadenaOriginalclave = "ABCDEFGHIJKLLLMNOPQRSTUVWXYZabcdefrgihklllmnopqrstuvwxyz1234567890 |°!#$%&/()=?¡'¿<}~ÇüéâäàåçêëèïîìÄÅÉæÆôöòûùÿÖÜø£Ø×ƒáíóúñÑª¿®¦ÁÂÀ©¦ãÃ@."
var cadenaEncriptadoclave = "|°!#$%&/()=?¡'¿<}~ÇüéâäàåçêëèïîìÄÅÉæÆôöòûùÿÖÜø£Ø×ƒáíóúñÑª¿®¦ÁÂÀ©¦ãÃ123456789012345678901234567890123456789012345678901234ñÑ78901234567@."

func Encriptar(frase string) (str string) {
	for _, k := range frase {
		i := strings.Index(cadenaOriginal, string(k))
		str += cadenaEncriptado[i : i+3]
	}
	return str
}

func Desencriptar(frase string) (str string) {
	for i := 0; i < len(frase); i += 3 {
		s := strings.Index(cadenaEncriptado, frase[i:i+3])
		str += string(cadenaOriginal[s])
	}
	return str
}

func EncriptarClave(frase string) (str string) {
	for _, k := range frase {
		s := strings.Index(cadenaOriginalclave, string(k))
		str += string(cadenaEncriptadoclave[s])
	}
	return str
}

func DesencriptarClave(frase string) (str string) {
	for i, _ := range frase {
		s := strings.Index(cadenaEncriptadoclave, string(frase[i]))
		str += string(cadenaOriginalclave[s])
	}
	return str
}
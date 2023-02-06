package util
// Funcion temporales
func FlatMapString(m map[string][]string) map[string]interface{} {
	nm := make(map[string]interface{})
	for k, v := range m {
		if len(v) == 0 {
			nm[k] = ""
		} else {
			nm[k] = v[0]
		}
	}

	return nm
}

// Funcion temporales
func MapString(m map[string]string) map[string]interface{} {
	nm := make(map[string]interface{})
	for k, v := range m {
		nm[k] = v
	}
	return nm
}

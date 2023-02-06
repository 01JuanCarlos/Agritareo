package binnacle

import "time"

type PhytosanityDates struct {
	FechaInicio string
	FechaFin string
}

type RouteDates struct {
	Fecha string
}
//type PhytosanityDatesVO struct {
//	FechaInicio time.Time
//	FechaFin time.Time
//}


func (p *PhytosanityDates) Validate() ( err error) {

	layout := "2006-01-02"
	_, err = time.Parse(layout, p.FechaInicio)
	if err != nil {
		return
	}

	_, err = time.Parse(layout, p.FechaFin)
	if err != nil {
		return
	}
	return
}

func (p *RouteDates) Validate() ( err error) {

	layout := "2006-01-02"
	_, err = time.Parse(layout, p.Fecha)
	if err != nil {
		return
	}

	return
}


//func FormatDate(fecha string) (t time.Time, e error) {
//	NewDate := strings.Split(fecha, "T")
//	layout := "2006-01-02"
//	if len(NewDate) != 2 {
//		e = errors.New("formato de fecha incorrecto")
//		return
//	}
//	formatDate, err := time.Parse(layout, NewDate[0])
//	if err != nil {
//		e = err
//		return
//	}
//	t = formatDate
//	return
//}
package agritareo

import (
	"log"
	"net/http"
	"ns-api/core/server/httpmessage"
	"ns-api/core/sts"
)

type evaluadorBody struct {
	Id            *int        `db:"id" json:"id,omitempty"`
	Codigo        interface{} `db:"codigo" json:"codigo" validate:"required,notBlank"`
	Nombre        *string     `db:"nombre" json:"nombre"`
	FechaCreacion interface{} `db:"fecha_creacion" json:"fecha_creacion"`
}

type tipoConceptoBody struct {
	Id            *int        `db:"id" json:"id,omitempty"`
	Codigo        interface{} `db:"codigo" json:"codigo" validate:"required,notBlank"`
	Nombre        *string     `db:"nombre" json:"nombre"`
	Descripcion   *string     `db:"descripcion" json:"descripcion"`
	FechaCreacion interface{} `db:"fecha_creacion" json:"fecha_creacion"`
}

type conceptoBody struct {
	Id                 *int        `db:"id" json:"id,omitempty"`
	IdConcepto         *int        `db:"idtipo_concepto" json:"idtipo_concepto,omitempty"`
	Codigo             interface{} `db:"codigo" json:"codigo" validate:"required,notBlank"`
	Nombre             *string     `db:"nombre" json:"nombre"`
	NombreTipoConcepto *string     `db:"nombre_tipo_concepto" json:"nombre_tipo_concepto"`
	Descripcion        *string     `db:"descripcion" json:"descripcion"`
	FechaCreacion      interface{} `db:"fecha_creacion" json:"fecha_creacion"`
}

type usuarioBody struct {
	Id              *int        `db:"id" json:"id,omitempty"`
	Usuario         interface{} `db:"usuario" json:"usuario" validate:"required,notBlank"`
	Codigo          interface{} `db:"codigo" json:"codigo" validate:"required,notBlank"`
	Nombre          *string     `db:"nombre" json:"nombre"`
	ApellidoPaterno *string     `db:"apellido_paterno" json:"apellido_paterno"`
	ApellidoMaterno *string     `db:"apellido_materno" json:"apellido_materno"`
	FechaCreacion   interface{} `db:"fecha_creacion" json:"fecha_creacion"`
}

type usuarioBodyApp struct {
	Id             *int        `db:"id" json:"id,omitempty"`
	Usuario        interface{} `db:"usuario" json:"usuario" validate:"required,notBlank"`
	Codigo         interface{} `db:"codigo" json:"codigo" validate:"required,notBlank"`
	NombreCompleto *string     `db:"nombre_completo" json:"nombre_completo"`
	Clave          *string     `db:"clave" json:"clave"`
	FechaCreacion  interface{} `db:"fecha_creacion" json:"fecha_creacion"`
}

type appCostCenterBody struct {
	Id                 *int        `db:"id" json:"id,omitempty"`
	IdZonaGeografica   *int        `db:"idzona_geografica" json:"idzona_geografica,omitempty"`
	ZonaGeografica     *string     `db:"zona_geografica" json:"zona_geografica"`
	Codigo             interface{} `db:"codigo" json:"codigo" validate:"required,notBlank"`
	NombreNivel        interface{} `db:"nombrenivel" json:"nombrenivel" validate:"required,notBlank"`
	IdCultivo          *int        `db:"idcultivo" json:"idcultivo,omitempty"`
	NombreCultivo      interface{} `db:"cultivo" json:"cultivo" validate:"required,notBlank"`
	IdCultivoVariedad  *int        `db:"idcultivo_variedad" json:"idcultivo_variedad,omitempty"`
	Variedad           interface{} `db:"variedad" json:"variedad" validate:"required,notBlank"`
	Year               *int        `db:"anio" json:"anio,omitempty"`
	AreaToral          interface{} `db:"area" json:"area" validate:"required,notBlank"`
	FechaInicioSiembra interface{} `db:"fecha_siembra" json:"fecha_siembra" validate:"required,notBlank"`
	Surcos             interface{} `db:"nro_surcos" json:"nro_surcos" validate:"required,notBlank"`
	Plantas            interface{} `db:"nro_plantas" json:"nro_plantas" validate:"required,notBlank"`
	CodigoSiembra      interface{} `db:"codigo_siembra" json:"codigo_siembra" validate:"required,notBlank"`
	FechaInicioCamp    interface{} `db:"fecha_inicio_campania" json:"fecha_inicio_campania"`
	FechaFinCamp       interface{} `db:"fecha_fin_campania" json:"fecha_fin_campania"`
	Producto           interface{} `db:"producto" json:"producto"`
	Kilos              interface{} `db:"kilos_proyectado" json:"kilos_proyectado"`
}

type cultivoBody struct {
	Id               int         `db:"id" json:"id,omitempty"`
	Color            *string     `db:"color" json:"color"`
	NombreCultivo    *string     `db:"cultivo" json:"cultivo"`
	Alias            *string     `db:"alias" json:"alias"`
	NombreCientifico interface{} `db:"nombre_cientifico" json:"nombre_cientifico,omitempty"`
	Code             interface{} `db:"codigo" json:"codigo" validate:"required,notBlank"`
	Status           bool        `db:"estado" json:"estado,omitempty"`
	Preferences      *string     `db:"idpreferencias_cultivo" json:"idpreferencias_cultivo,omitempty"`
	Styles           *string     `db:"estilo" json:"estilo,omitempty"`
	Variety          interface{} `db:"variedad" json:"variedad"`
}

// Responsable
func GetAppMovilEvaluator(user *sts.Client, r *http.Request) httpmessage.HttpMessage {
	var evaluador []evaluadorBody
	err := user.Sql.Select(&evaluador, `select E.id ,U.nombre , E.codigo, E.fecha_creacion from TMEVALUADOR E
	JOIN TMUSUARIO_PERFIL UP ON UP.id = E.idusuario_perfil
	JOIN TMUSUARIO U ON U.id = UP.idusuario `)
	if err != nil {
		log.Println(err)
		return httpmessage.Error(err)
	}
	return httpmessage.Send(evaluador)
}

func GetAppMovilConceptType(user *sts.Client, r *http.Request) httpmessage.HttpMessage {
	var tipo []tipoConceptoBody
	err := user.Sql.Select(&tipo, `select id,codigo,nombre,descripcion,fecha_creacion from TMTIPO_CONCEPTO_AGRICOLA`)
	if err != nil {
		log.Println(err)
		return httpmessage.Error(err)
	}
	return httpmessage.Send(tipo)
}

func GetAppMovilConcept(user *sts.Client, r *http.Request) httpmessage.HttpMessage {
	var concepto []conceptoBody
	err := user.Sql.Select(&concepto, `select CA.id, CA.idtipo_concepto, TCA.nombre as 'nombre_tipo_concepto',CA.codigo,CA.nombre,CA.descripcion,CA.fecha_creacion from TMCONCEPTO_AGRICOLA CA 
 INNER JOIN TMTIPO_CONCEPTO_AGRICOLA TCA ON TCA.id = CA.idtipo_concepto `)
	if err != nil {
		log.Println(err)
		return httpmessage.Error(err)
	}
	return httpmessage.Send(concepto)
}

func GetAppMovilSubConcept(user *sts.Client, r *http.Request) httpmessage.HttpMessage {
	var concepto []conceptoBody
	err := user.Sql.Select(&concepto, `select CA.id, CA.idtipo_concepto, TCA.nombre as 'nombre_tipo_concepto',CA.codigo,CA.nombre,CA.descripcion,CA.fecha_creacion from TMCONCEPTO_AGRICOLA CA 
 INNER JOIN TMTIPO_CONCEPTO_AGRICOLA TCA ON TCA.id = CA.idtipo_concepto `)
	if err != nil {
		log.Println(err)
		return httpmessage.Error(err)
	}
	return httpmessage.Send(concepto)
}

func GetAppMovilUser(user *sts.Client, r *http.Request) httpmessage.HttpMessage {
	var usuario []usuarioBodyApp
	err := user.Sql.Select(&usuario, `SELECT * FROM NF_USUARIOS_DATA(109)`)
	if err != nil {
		log.Println(err)
		return httpmessage.Error(err)
	}
	return httpmessage.Send(usuario)
}

func GetAppMovilCostCenters(user *sts.Client, r *http.Request) httpmessage.HttpMessage {
	var costC []appCostCenterBody
	err := user.Sql.Select(&costC, `select CC.id,
			CC.idzona_geografica,
			GE.descripcion AS zona_geografica,
			CC.codigo,
			CC.nombrenivel,
			C.id AS idcultivo,
			C.nombre AS cultivo,
			CV.id AS idcultivo_variedad,
			CV.nombre AS variedad,
			CAMP.anio,
			CC.area_total as 'area',
			S.fecha_inicio AS fecha_siembra,
			S.nro_surcos,
			S.nro_plantas,
			S.codigo_siembra,
			CA.fecha_inicio alogins 'fecha_inicio_campania',
			CA.fecha_fin AS 'fecha_fin_campania', 
			P.nombre AS 'producto',
			CA.kilos_proyectado from TMCENTROCOSTO CC
			JOIN TMZONA_GEOGRAFICA GE ON GE.id = CC.idzona_geografica
		LEFT JOIN TMSIEMBRA S ON S.idcentrocosto = CC.id
		LEFT JOIN TMCULTIVO_VARIEDAD CV ON CV.id = S.idvariedad
		LEFT JOIN TMCULTIVO C ON C.id = CV.idcultivo
		LEFT JOIN TMCAMPANIA CA ON CA.idsiembra = S.id
		LEFT JOIN TMPRODUCTO_EMPRESA PE ON PE.id = CA.idproducto_empresa
		LEFT JOIN TMPRODUCTO P ON P.id = PE.idproducto
		LEFT JOIN TMCAMPANIA_AGRICOLA CAMP ON CAMP.id = CA.idcampania_agricola`)
	if err != nil {
		log.Println(err)
		return httpmessage.Error(err)
	}
	return httpmessage.Send(costC)
}

func GetAppMovilCrop(user *sts.Client, r *http.Request) httpmessage.HttpMessage {
	var cultivo []cultivoBody
	err := user.Sql.Select(&cultivo, `select C.id,
			C.codigo,
			C.nombre AS 'cultivo',
			C.alias,
			CPE.color,
			CPE.estilo,
			C.nombrecientifico as 'nombre_cientifico',
			CV.nombre as 'variedad' from TMCULTIVO C
			LEFT JOIN TMCULTIVO_PREFERENCIAS_EMPRESA CPE ON CPE.id = C.idcultivo_preferencia
			LEFT JOIN TMCULTIVO_VARIEDAD CV ON C.id = CV.idcultivo`)
	if err != nil {
		log.Println(err)
		return httpmessage.Error(err)
	}
	return httpmessage.Send(cultivo)
}

//CPE.color,
//CPE.estilo,
//CV.nombre as 'variedad',
//LEFT JOIN TMCULTIVO_PREFERENCIAS_EMPRESA CPE ON CPE.id = C.idcultivo_preferencia
//LEFT JOIN TMCULTIVO_VARIEDAD CV ON C.id = CV.idcultivo

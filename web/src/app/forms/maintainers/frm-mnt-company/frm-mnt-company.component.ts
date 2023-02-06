import { Component, Injector, OnInit } from '@angular/core';
import { Validators } from '@angular/forms';
import { AbstractFormGroup, FormGroupProvider } from '@app/common/classes/abstract-form-group.class';
import { AppHttpClientService } from '@app/services/util-services/app-http-client.service';
import { SweetAlertService } from '@app/services/util-services/sweet-alert.service';
@Component({
  selector: 'ns-frm-mnt-company',
  templateUrl: './frm-mnt-company.component.html',
  styleUrls: ['./frm-mnt-company.component.scss'],
  providers: [
    FormGroupProvider(FrmMntCompanyComponent)
  ]
})
export class FrmMntCompanyComponent extends AbstractFormGroup implements OnInit {
  titleOnCreate = 'Crear nuevo usuario';
  titleOnEdit = 'Modificar información de usuario';
  componentId = 'FrmMntCompanyComponent';
  form = this.fb.group({
    id: [],
    general: this.fb.group({
      codigo: [],
      razon_social: [],
      ruc: [],
      direccion: [],
      referencia: [],
      codigo_pais: [],
      pais: [],
      ubigeo: [],
      ubigeo_descripcion: [],
      telefono: [],
      email: [],
      fax: [],
      usuario_sol: [],
      nombre_corto: [],
      partida_electronica: [],
      representante: [],
      tipodocumento_representante: [],
      documento_representante: []
    }),
    documentos_asociados: this.fb.group({}),
    origen_datos: this.fb.group({}),
    informacion_adicional: this.fb.group({})
  });

  constructor(injector: Injector, private http: AppHttpClientService,  private alert: SweetAlertService) {
    super(injector);
  }

  patchFormValue(data: any) {
    // TODO: Obtener datos del formulario!
    this.http.get(`/company/${data.id}`).subscribe({
      next: (data) => {
        console.log('Obteniendo datos de la empresa XXXXX', data);
      },
      error: err => { this.alert.error('Ocurrió un error inesperado'), console.error('Ocurrió un error inesperado: ' + err); }
    });
    console.log('aca se parcha perro patchFormValue', data);
    // super.patchFormValue({ general: data });
  }

  ngOnInit() { }
}

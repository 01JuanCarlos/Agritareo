import { Component, Injector, OnInit } from '@angular/core';
import { Validators } from '@angular/forms';
import { AbstractFormGroup, FormGroupProvider } from '@app/common/classes/abstract-form-group.class';
import { AppHttpClientService } from '@app/services/util-services/app-http-client.service';

@Component({
  selector: 'ns-frm-mnt-profile',
  templateUrl: './frm-mnt-profile.component.html',
  styles: ['[hidden] { display: none !important; }'],
  providers: [
    FormGroupProvider(FrmMntProfileComponent)
  ]
})
export class FrmMntProfileComponent extends AbstractFormGroup implements OnInit {
  titleOnCreate = 'Crear nuevo rol';
  titleOnEdit = 'Modificar información de rol';
  componentId = 'FrmMntProfileComponent';

  licencias: [{id: number, label: string}];
  public habilitado = [
    { value: true, name: 'Si' },
    { value: false, name: 'No' }
  ];

  form = this.fb.group({
    type: ['', Validators.required],
    codigo: ['', [Validators.maxLength(15), Validators.minLength(2), Validators.required]],
    descripcion: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(250)]],
    status: [1]
  });

  constructor(injector: Injector, private http: AppHttpClientService) {
    super(injector);
    this.getProfileTypes();
  }

  ngOnInit() { }

  getProfileTypes() {
    this.http.get('profiletype').subscribe( e => {
      this.licencias = (e || []).map( l => { l.label = l.nombre; return l; });
    });
  }
}

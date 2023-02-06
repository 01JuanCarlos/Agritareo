import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ZONAS_GEOGRAFICAS } from '@app/common/constants/agritareo.constants';
import { AppHttpClientService } from '@app/services/util-services/app-http-client.service';
import { isEmpty } from 'lodash-es';
import { ZonaGeografica } from '../zonas-geograficas.config';

@Component({
  selector: 'ns-zona-geografica',
  templateUrl: './zona-geografica.component.html',
  styleUrls: ['./zona-geografica.component.scss']
})
export class ZonaGeograficaComponent implements OnInit {
  zonaGeograficaId: number | string;
  zonaGeografica: ZonaGeografica;
  loading: boolean;
  form: FormGroup;



  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private http: AppHttpClientService
  ) {
    this.route.params
      .subscribe((params) => !params?.id || this.getZonaGeograficaById(params.id));
  }

  ngOnInit(): void {
    this.form = this.fb.group({
      id: [''],
      codigo: ['', [Validators.required]],
      descripcion: ['', [Validators.required]],
      descripcion_corta: [''],
    });
  }

  getZonaGeograficaById(idZonaGeografica: number | string) {
    this.loading = true;
    this.zonaGeograficaId = idZonaGeografica;
    this.http.get(ZONAS_GEOGRAFICAS, this.zonaGeograficaId)
      .subscribe(zonaGeografica => {
        this.loading = false;
        this.zonaGeografica = isEmpty(zonaGeografica) ? null : zonaGeografica;
        this.form.patchValue(this.zonaGeografica || {});
      });
  }

  backClicked() {
    const route = this.router.url.split('/');
    route.pop();
    this.router.navigateByUrl(route.join('/'));
  }

  save() {
    this.http.post(ZONAS_GEOGRAFICAS, this.form.value, { isTransaction: true }).subscribe(() => {
      this.backClicked();
    });
  }

  update() {
    this.http.put(ZONAS_GEOGRAFICAS, this.zonaGeograficaId, this.form.value, { isTransaction: true }).subscribe();
  }

}

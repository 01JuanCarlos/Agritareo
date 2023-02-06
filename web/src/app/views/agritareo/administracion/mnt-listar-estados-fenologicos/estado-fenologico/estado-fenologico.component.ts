import { Component, Injector } from '@angular/core';
import { FormArray, FormControl, FormGroup, Validators } from '@angular/forms';
import { AbstractDocument, DocumentProvider } from '@app/common/classes';
import { ESTADOS_FENOLOGICOS, ESTADOS_FENOLOGICOS_VARIEDAD } from '@app/common/constants/agritareo.constants';
import { NsDocument } from '@app/common/decorators/document.decorator';
import { AgritareoComponents } from '@app/config/agritareo-components.config';
import * as moment from 'moment';

@Component({
  selector: 'ns-estado-fenologico',
  templateUrl: './estado-fenologico.component.html',
  styleUrls: ['./estado-fenologico.component.scss'],
  providers: [
    DocumentProvider(EstadoFenologicoComponent)
  ]
})

@NsDocument({
  formControllerId: ESTADOS_FENOLOGICOS,
  isDocument: true,
})
export class EstadoFenologicoComponent extends AbstractDocument {
  SuggestZonaGeografica = AgritareoComponents.SuggestZonaGeografica;
  SuggestCultivo = AgritareoComponents.SuggestCultivo;
  SuggestVariedad = AgritareoComponents.SuggestVariedad;
  SuggestFenologia = AgritareoComponents.SuggestFenologia;

  form = this.fb.group({
    id: '',
    // codigo: '',
    // nombre: '',
    idzona_geografica: [, [Validators.required]],
    idcultivo: [, [Validators.required]],
    idcultivo_variedad: [, [Validators.required]],
    fecha_inicio_dia: [, [Validators.required, Validators.min(1), Validators.max(31)]],
    fecha_inicio_mes: [, [Validators.required]],
    fecha_inicio: [, [Validators.required]],
    fenologias: this.fb.array([])
  });

  headerFenologias = [
    { field: 'id', label: 'Id', visible: false },
    { field: 'idfenologia_variedad', visible: false },
    { field: 'fenologia_variedad', label: 'Fenología' },
    { field: 'dia_inicio', label: 'Día Inicio' },
    { field: 'dia_fin', label: 'Día Final' },
    { field: 'fecha_inicio', label: 'Fecha Inicio'.concat(' ' + this.currentYear) },
    { field: 'fecha_fin', label: 'Fecha Final' },
  ];

  selectedFenologia: any;

  fenologiaForm = this.newFenologiaform();

  constructor(injector: Injector) {
    super(injector);
  }

  newFenologiaform() {
    return this.fb.group({
      id: '',
      idfenologia_variedad: '',
      fenologia_variedad: '',
      dia_inicio: '',
      dia_fin: '',
      fecha_inicio: '',
      fecha_fin: '',
      orden: '',
    });
  }

  get currentYear(): number {
    return new Date().getFullYear();
  }

  get dataFenologias() {
    const date = moment.utc(this.form.value.fecha_inicio);

    if (!date.isValid()) {
      return;
    }

    (this.form.controls.fenologias as FormArray).controls.forEach((fenologiaControl: FormGroup) => {
      let { dia_inicio, dia_fin } = fenologiaControl.value;

      const fecha_inicio = date.clone().add(dia_inicio, 'days').format('DD/MM/YYYY');
      const fecha_fin = date.clone().add(dia_fin, 'days').format('DD/MM/YYYY');

      if (!fenologiaControl.controls.fecha_inicio) {
        fenologiaControl.addControl('fecha_inicio', new FormControl(''));
      }
      if (!fenologiaControl.controls.fecha_fin) {
        fenologiaControl.addControl('fecha_fin', new FormControl(''));
      }
      fenologiaControl.patchValue({ fecha_inicio, fecha_fin })
    });

    return (this.form.controls.fenologias as FormArray).value || [];
  }

  get parsedForm() {
    const sendForm = Object.assign({}, this.form.value);
    const parsedDate = moment.utc(sendForm.fecha_inicio).format('DD-MM').split('-');
    sendForm.fecha_inicio_dia = +parsedDate[0];
    sendForm.fecha_inicio_mes = +parsedDate[1];
    sendForm.fenologias.forEach(fenologia => {
      fenologia.fecha_inicio = moment(fenologia.fecha_inicio, 'DD/MM/YYYY').format('YYYY-MM-DD');
      fenologia.fecha_fin = moment(fenologia.fecha_fin, 'DD/MM/YYYY').format('YYYY-MM-DD');
    });
    return sendForm;
  }


  onSelectedVariedad(idVariedad: number) {
    // FIXME: No me convence
    if (!this.isNewDocument) {
      return;
    }

    const fenologias: FormArray = this.form.controls.fenologias as FormArray;
    fenologias.clear();

    this.http.get(ESTADOS_FENOLOGICOS_VARIEDAD, idVariedad).subscribe(data => {
      let count = 0;
      data.forEach(item => {
        const fenologiasForm = this.newFenologiaform();
        fenologiasForm.patchValue({
          ...item, ...{
            idfenologia_variedad: item.id,
            fenologia_variedad: item.nombre,
            dia_inicio: count,
            dia_fin: count + item.duracion_dias
          }
        });
        count += item.duracion_dias;
        fenologias.push(fenologiasForm);
      });
    });

  }
}

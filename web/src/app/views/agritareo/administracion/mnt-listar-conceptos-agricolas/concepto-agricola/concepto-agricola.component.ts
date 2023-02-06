import { Component, Injector } from '@angular/core';
import { FormArray, Validators } from '@angular/forms';
import { AbstractDocument, DocumentProvider } from '@app/common/classes';
import { CONCEPTOS } from '@app/common/constants/agritareo.constants';
import { NsDocument } from '@app/common/decorators/document.decorator';
import { AgritareoComponents } from '@app/config/agritareo-components.config';

@Component({
  selector: 'ns-concepto-agricola',
  templateUrl: './concepto-agricola.component.html',
  styleUrls: ['./concepto-agricola.component.scss'],
  providers: [
    DocumentProvider(ConceptoAgricolaComponent)
  ]
})

@NsDocument({
  formControllerId: CONCEPTOS,
  isDocument: true,
})
export class ConceptoAgricolaComponent extends AbstractDocument {
  SuggestTipoConcepto = AgritareoComponents.SuggestTipoConcepto;
  SuggestUnidadMedida = AgritareoComponents.SuggestUnidadMedida;
  SuggestMetodoEvaluacion = AgritareoComponents.SuggestMetodoEvaluacion;
  SuggestCultivo = AgritareoComponents.SuggestCultivo;
  SuggestSubConceptosAgricolas = AgritareoComponents.SuggestSubConceptosAgricolas;

  selectedCultivoTab = 0;
  selectedConceptoCultivo: any;
  conceptoCultivoForm = this.createEvaluacionConcepto();


  headerCultivos = [
    { field: 'id', label: 'Id', visible: false },
    { field: 'codigo', label: 'Código cultivo' },
    { field: 'descripcion', label: 'Descripción cultivo' },
  ];

  headerConcepto = [
    { field: 'id', label: 'Id', visible: false },
    { field: 'subconcepto_evaluar', label: 'Subconcepto a evaluar' },
    { field: 'organo_afectado', label: 'Órgano afectado' },
    { field: 'metodo_evaluacion', label: 'Metodo de evaluación' },
    { field: 'unimedida', label: 'Medida' },
  ];

  form = this.fb.group({
    codigo: [, [Validators.required]],
    tipo_concepto: '',
    descripcion: [],
    idtipo_concepto: [, [Validators.required]],
    nombre: [, [Validators.required]],
    nombre_cientifico: '',
    estado: '',

    subconceptos_agricola: this.fb.array([]),
  });

  get subConceptosAgricola(): FormArray {
    return this.form.get('subconceptos_agricola') as FormArray;
  }

  createSubconceptoAgricola() {
    return this.fb.group({
      id: null,
      idcultivo: [, [Validators.required]],
      cultivo: '',
      evaluaciones_subconcepto: this.fb.array([]),
    });
  }

  createEvaluacionConcepto() {
    return this.fb.group({
      id: [],
      idsubconcepto_agricola: [, [Validators.required]],
      unimedida: [],
      idmetodo_evaluacion: [, [Validators.required]],
      metodo_evaluacion: [],
      subconcepto_evaluar: [, [Validators.required]],
      organo_afectado: [, [Validators.required]],
    });
  }

  onSelectedCultivo(cultivoLabel: string) {
    this.form.get(['subconceptos_agricola', this.selectedCultivoTab]).patchValue({ cultivo: cultivoLabel });
  }

  constructor(injector: Injector) {
    super(injector);
  }
}

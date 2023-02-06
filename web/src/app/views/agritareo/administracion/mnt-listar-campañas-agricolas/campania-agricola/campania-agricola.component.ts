import { Component, Injector } from '@angular/core';
import { ThemePalette } from '@angular/material/core';
import { AbstractDocument, DocumentProvider } from '@app/common/classes';
import { CAMPANIA_AGRICOLA, CULTIVOS } from '@app/common/constants/agritareo.constants';
import { NsDocument } from '@app/common/decorators/document.decorator';
import { AgritareoComponents } from '@app/config/agritareo-components.config';
import { ToggleAction } from '@ngrx/store-devtools/src/actions';


export interface Task {
  name: string;
  completed: boolean;
  color: ThemePalette;
  subtasks?: Task[];
}

@Component({
  selector: 'ns-campania-agricola',
  templateUrl: './campania-agricola.component.html',
  styleUrls: ['./campania-agricola.component.scss'],
  providers: [
    DocumentProvider(CampaniaAgricolaComponent)
  ]
})

@NsDocument({
  formControllerId: CAMPANIA_AGRICOLA,
  isDocument: true,
  // agregado por glenn
  viewURL: CULTIVOS,
  //----------------------------------------------------
})

export class CampaniaAgricolaComponent extends AbstractDocument  {
  //console.log('');
  // agregado por glenn
  viewURL: string;
  codigo = '';
  descripcion = '';
  id = '';
  //----------------------------------------------------
  finderCultivo = AgritareoComponents.SuggestCultivo;


  constructor(injector: Injector) {
    super(injector);
    // agregado por glenn
    this.viewURL = this.options.viewURL;
     //----------------------------------------------------
     
  }


  form = this.fb.group({
    codigo: [''],
    descripcion: [''],
    anio: null,
    estado: null,
    idcultivo: null
  });

   // agregado por glenn
   tableHeader = [
    { field: 'codigo', label: 'Código tipo' },
    { field: 'cultivo', label: 'Descripción' },
  ];
   //----------------------------------------------------

  //----------------------------------------------------
  abrirmodal(){
    // $('.modal-backdrop').hide()
    // $("#ModalCultivo").show()
    //  $('.modal-content').show();
    console.log("abiertooo");
    // $('#ModalCultivo').addClass("show");
    // $('#ModalCultivo').prop("role","dialog");
  }

   // agregado por glenn
  goEditMode({ item } = { item: void 0 }) {
     if (item && item?.id) {
      this.codigo = item?.codigo;
      this.descripcion = item?.cultivo;
      //this.id = item;
      this.id = item?.id;
      // $("#ModalCultivo").hide();
      // console.log("modal hide");
      $('.modal-backdrop').remove();
      // console.log(".modal-backdrop hide");
      $('#ModalCultivo').hide();
      // $('.modal-content').toggle(ToggleAction);
      $('#ModalCultivo').removeClass("show");
      $('#ModalCultivo').removeAttr("role");
      $('#ModalCultivo').removeAttr("aria-modal");
      $('#ModalCultivo').attr("aria-hidden","true");
      $('body').removeClass("modal-open");
      // $('ns-table-simple').attr("data-dismiss","modal");
    }

  }
 
  



  //
  task: Task = {
    name: 'Indeterminate',
    completed: false,
    color: 'primary',
    subtasks: [
      {name: 'Primary', completed: false, color: 'primary'},
      {name: 'Accent', completed: false, color: 'accent'},
      {name: 'Warn', completed: false, color: 'warn'},
    ],
  };

  allComplete: boolean = false;

  updateAllComplete() {
    this.allComplete = this.task.subtasks != null && this.task.subtasks.every(t => t.completed);
  }

  someComplete(): boolean {
    if (this.task.subtasks == null) {
      return false;
    }
    return this.task.subtasks.filter(t => t.completed).length > 0 && !this.allComplete;
  }

  setAll(completed: boolean) {
    this.allComplete = completed;
    if (this.task.subtasks == null) {
      return;
    }
    this.task.subtasks.forEach(t => (t.completed = completed));
  }
}


// $(document).ready(function(){
// $("#btnopen").click(function(){
//   $("#ModalCultivo").show();
//   $('.modal-backdrop').show();
//   console.log("abiertooo");
// });
// })

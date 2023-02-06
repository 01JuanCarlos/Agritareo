import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NsModalComponent } from '@app/components/ns-modal/ns-modal.component';
import { AgritareoComponents } from '@app/config/agritareo-components.config';
import { SweetAlertService } from '@app/services/util-services/sweet-alert.service';
// import { TrampasService } from '@views/agritareo/trampas/trampas.service';

@Component({
  selector: 'ns-mnt-listar-trampas',
  templateUrl: './mnt-listar-trampas.component.html',
  styleUrls: ['./mnt-listar-trampas.component.scss'],
  providers: [
    // TrampasService
  ]
})
export class MntListarTrampasComponent implements OnInit {
  @ViewChild('trampaModal') trampaModal: NsModalComponent;
  trampaForm: FormGroup;
  listaTrampas = [];
  trampaIsOnEdit: boolean;

  SuggestCategoriaTrampa = AgritareoComponents.SuggestCategoriaTrampa;

  trampasHeader = [
    { field: 'id', label: 'Id', visible: false },
    { field: 'nombre', label: 'Nombre' },
    { field: 'codigo', label: 'Codigo' },
    { field: 'nombre_categoria', label: 'Categoría' },
    { field: 'idcategoria', label: '', visible: false },
    { field: 'numero', label: 'Stock' },
    { field: 'numero_uso', label: 'Stock Disponible' }
  ];



  // private trampaServicio: TrampasService,
  constructor(
    private alert: SweetAlertService,
    private fb: FormBuilder) { }

  ngOnInit(): void {
    this.trampaForm = this.fb.group({
      id: [''],
      nombre: ['', [Validators.required]],
      codigo: ['', [Validators.required]],
      idcategoria: ['', [Validators.required]],
      numero: ['', [Validators.required]],
    });
    this.getTrampas();
  }

  getTrampas() {
    // this.trampaServicio.get().subscribe(data => {
    //   this.listaTrampas = data;
    // });
  }

  addTrampa() {
    // this.trampaServicio.add(this.trampaForm.value).subscribe(() => {
    //   this.getTrampas();
    //   this.trampaModal.close();
    // });
  }

  editTrampa() {
    // this.trampaServicio.edit(this.trampaForm.value.id, this.trampaForm.value).subscribe(() => {
    //   this.getTrampas();
    //   this.trampaModal.close();
    // });
  }

  deleteTrampa(trampa: any) {
    this.alert.confirmDelete(`No podrás recuperar el cultivo ${trampa.nombre}`, '¿Estás seguro?', {
      callback: result => {
        if (result) {
          this.trampaForm.patchValue(trampa);
          // this.trampaServicio.delete(this.trampaForm.value.id).subscribe(() => {
          //   this.getTrampas();
          // });
        }
      }
    });
  }


  openModal(form: FormGroup, modal: NsModalComponent, data?: any) {
    if (data !== undefined) {
      form.patchValue(data);
    } else {
      form.reset();
    }
    modal.open();
  }

}

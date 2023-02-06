import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NsModalComponent } from '@app/components/ns-modal/ns-modal.component';
import { SweetAlertService } from '@app/services/util-services/sweet-alert.service';
// import { PlagasService } from '@views/agritareo/plagas/plagas.service';

@Component({
  selector: 'ns-mnt-listar-plagas',
  templateUrl: './mnt-listar-plagas.component.html',
  styleUrls: ['./mnt-listar-plagas.component.scss'],
  // providers: [
  //   PlagasService
  // ]
})
export class MntListarPlagasComponent implements OnInit {
  @ViewChild('plagasModal') plagasModal: NsModalComponent;
  cultivosForm: FormGroup;
  formPlaga: FormGroup;
  // VARIABLES DE SELECCIÓN
  cultivoSelected;
  plagaSelected;

  // VARIABLES DE LISTA
  cultivosData = [];
  plagasData = [];

  // VARIABLES DE EDICION
  cultivosIsOnEdit: boolean;
  plagasIsOnEdit: boolean;

  cultivosHeader = [
    { field: 'id', label: 'Id Cultivo', visible: false },
    { field: 'codigo', label: 'Codigo' },
    { field: 'nombre', label: 'Nombre' }
  ];

  plagasHeader = [
    { field: 'id', label: 'IdPlaga', visible: false },
    { field: 'codigo', label: 'Código' },
    { field: 'nombre', label: 'Nombre' },
    { field: 'nombrecientifico', label: 'Nombre Cientifico' },
    { field: 'tipo', label: 'Tipo' },
    { field: 'estado', label: 'Estado', isBoolean: true, visible: false },
    { field: 'estado_c', label: 'Estado', isBoolean: true },
  ];

  plagasTableOptions = [
    { btnIcon: 'fas fa-sync', style: 'btn-success', btnFunction: (event) => this.updatePlagasStatus(event) }
  ];



  // private plagaService: PlagasService,
  constructor(
    private fb: FormBuilder,
    private alert: SweetAlertService
  ) { }

  ngOnInit(): void {
    this.cultivosForm = this.fb.group({
      id: '',
      codigo: '',
      nombre: ['', Validators.required],
      nombrecientifico: '',
      alias: '',
      estado: ''
    });

    this.formPlaga = this.fb.group({
      id: [''],
      nombre: [''],
      nombrecientifico: [''],
      alias: [''],
      codigo: [''],
      tipo: [''],
      estado: ['']
    });
    this.getCultivos();
  }

  getCultivos() {
    // this.plagaService.getCultivos().subscribe(data => {
    //   this.cultivosData = (data || []).map(it => { it.estado_c = it.estado ? 'Habilitado' : 'No Habilitado'; return it; });
    // });
  }

  selectedCultivo(cultivo) {
    if (this.cultivoSelected?.id === cultivo.id) {
      this.cultivoSelected = null;
      return;
    }
    this.cultivoSelected = cultivo;
    this.getPlaga();
  }

  // MÉTODOS PLAGAS

  selectedPlaga(fenologia) {
    if (this.plagaSelected?.id === fenologia.id) {
      this.plagaSelected = null;
      return;
    }
    this.plagaSelected = fenologia;
  }

  getPlaga() {
    // this.plagaService.getPlagas(this.cultivoSelected.id).subscribe(data => {
    //   this.plagasData = (data || []).map(it => { it.estado_c = it.estado ? 'Habilitado' : 'No Habilitado'; return it; });
    // });
  }

  addPlaga() {
    // this.plagaService.addPlagas(this.cultivoSelected.id, this.formPlaga.value).subscribe(() => {
    //   this.getPlaga();
    //   this.plagasModal.close();
    // });
  }

  editPlaga() {
    // this.plagaService.updatePlagas(this.cultivoSelected.id, this.formPlaga.value, this.formPlaga.value.id).subscribe(() => {
    //   this.getPlaga();
    //   this.plagasModal.close();
    // });
  }

  deletePlaga(plaga: any) {
    this.alert.confirmDelete(`No podrás recuperar la plaga ${plaga.nombre}`, '¿Estás seguro?', {
      callback: result => {
        if (result) {
          // this.plagaService.deletePlagas(this.cultivoSelected.id, plaga.id).subscribe(() => {
          //   this.getPlaga();
          // });
        }
      }
    });
  }

  updatePlagasStatus(plaga: any) {
    this.alert.warn(`Quieres actualizar el estado de: ${plaga.nombre}`, '¿Estás seguro?', {
      callback: result => {
        if (result) {
          // this.plagaService.statusPlagas(this.cultivoSelected.id, plaga.id).subscribe(() => {
          //   this.getPlaga();
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

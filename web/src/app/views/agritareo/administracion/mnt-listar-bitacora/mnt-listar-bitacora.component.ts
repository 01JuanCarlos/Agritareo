import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Bitacora, MntListarBitacoraService } from '../mnt-listar-bitacora/mnt-listar-bitacora.service';
import moment from 'moment';
import { Observable } from 'rxjs';

@Component({
  selector: 'ns-mnt-listar-bitacora',
  templateUrl: './mnt-listar-bitacora.component.html',
  styleUrls: ['./mnt-listar-bitacora.component.scss']
})

export class MntListarBitacoraComponent implements OnInit {
  modalShow = false;
  loading: boolean;
  productDialog: boolean;
  form: FormGroup;
  isLoading = false;
  submitted: boolean;
  data= []
  dataDetail= []
  tipoBitacoraList = [];
  evaluadorList = [];
  bitacora: Bitacora;
  binnacle$: Observable<Bitacora>
  constructor(
    private fb: FormBuilder,
    private bitacoraService: MntListarBitacoraService,
  ) {}

  ngAfterViewInit() {
  }

  ngOnInit(): void {
    this.form = this.fb.group({
    });
    this.getData();
    this.loading = true;

  }

  closeImg(){
    document.getElementById("fullImgBox").style.display = "none";
  }
  openFullImg(){
    document.getElementById("fullImgBox").style.display = "flex";
  }

  formatDate(date: string) {
    return moment(new Date(date)).format('YYYY-MM-D');
  }

  getData(){
    this.bitacoraService.getBinnacle().subscribe(response => {
      this.data = response;
    });
    // this.binnacle$ = this.bitacoraService.getBinnacle();
  }

  hideDialog() {
    this.productDialog = false;
    this.submitted = false;
}

  updateTable(item: any) {
    if (item.visible === undefined) {
      return item.visible = false;
    }
    item.visible = !item.visible;
  }

  editMode(bitacora: Bitacora){
    this.bitacora = bitacora;
    this.productDialog = true;
  }
}


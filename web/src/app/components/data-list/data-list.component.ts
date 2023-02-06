import { Component, Input, OnInit } from '@angular/core';
import { Id } from '@app/common/decorators';
import { TableHeaderColumn } from '@app/common/interfaces';
import { ChangeEvent } from 'ngx-virtual-scroller';

@Component({
  selector: 'app-data-list',
  templateUrl: './data-list.component.html',
  styleUrls: ['./data-list.component.scss']
})
export class DataListComponent implements OnInit {

  // @Input() data: object[];
  // tslint:disable-next-line: ban-types
  // @Input() scrollDown: Function;
  // path: string[] = [];
  // tabla = [];
  // totalPages = 0;
  @Input() header: TableHeaderColumn[];
  @Input() @Id id: string;
  @Input() title: string;
  public data = [];
  public cargado = false;
  public cargando = true;
  public temporalKey = '';
  public oldIndex = 0;
  public temporalSort = '';
  public temporalArray = [];
  public sort = true;
  public temporalPage = 0;
  public offline = false;
  public scroll = false;
  public disconnect = false;
  public void = true;
  constructor(
    // private store: Store<TableState>
  ) { }

  ngOnInit() {
    this.loadingData();
  }
  // ngOnChanges() {
  //   console.log('Change');
  //   if (this.cargado) { return; }
  //   if (this.data !== undefined) {
  //     console.log(this.data);
  //    //  this.cargado = true;
  //   }
  // }

  get _headerTable() {
    return this.header;
  }

  loadingData() {
    // this.store.dispatch(FailService({ disconnect: false }));
    // this.store.select('tables', 'disconnect').subscribe((res: any) => {
    //   this.disconnect = res;
    // });
    // this.store.select('tables', 'tables').subscribe((res: any) => {
    //   console.log(res);
    //   if (res.length === 0) { return; }
    //   res.map((r: IDataTable) => {
    //     if (r.title === this.title) {
    //       this.scroll = r.scroll;
    //       this.cargando = r.loading;
    //       if (r.data === undefined) {
    //         this.offline = true;
    //       } else {
    //         this.data = r.data;
    //         // this.temporalArray = this.data.slice(0);
    //         this.temporalKey = r.temporalKey;
    //         console.log('temporal key', this.temporalKey);
    //         this.header = r.headers;
    //         this.temporalPage = r.page;
    //         if (this.data.length > 0) { this.void = false; }
    //       }
    //     }
    //   });
    //   // if (this.data && this.data.length !== 0) {
    //   //   this.temporalArray = this.data.slice(0);
    //   //   // if (this.data.length !== 0) {
    //   //   // else {
    //   //   //   if (this.data.length === 0) {
    //   //   //     console.log('void data');
    //   //   //   } else {
    //   //   //     this.offline  = true;
    //   //   //   }
    //   //   // }
    //   // }
    //   this.cargado = true;
    //   // this.cargando = false;
    // });
    if (this.data.length === 0) {
      this.offline = false;
      this.cargando = true;
      // this.store.dispatch(new SetDataTable(this.temporalPage, this.title, this.header));
      // this.cargado = false;
      // this.cargando = true;
    }
  }


  onListChange(event: ChangeEvent) {
    // console.log('end: ', event.end + 1 , 'size data :', this.data.length);
    if (event.end + 1 !== this.data.length) { return; }
    console.log('same -->', this.cargado, this.scroll);
    // if (this.disconnect) {
    //   console.log('before', this.cargando);
    //   this.cargando = !this.cargando;
    //   console.log('after', this.cargando);
    // }
    if (this.scroll && !this.cargando) {
      if (this.data.length <= 12) { return; }
      if (window.navigator.onLine) {
        console.log('lanzando llamada');
        this.offline = false;
        // this.cargando = true;
        // this.store.dispatch(UpdateLoadingTable({ title: this.title, loading: true, visible: true }));
        // this.store.dispatch(SetDataTable({ page: this.temporalPage, title: this.title, headers: [] }));
      } else {
        this.offline = true;
      }

    }
  }

  sortTable(myKey: string, isNumeric = false, index: number) {
    // if (this.temporalKey === '') { this.store.dispatch(new UpdateTemporalKey(this.title, myKey)); }
    if (this.temporalKey !== myKey && this.temporalKey !== '') {
      // this.header[this.oldIndex].order = 0;
      // this.store.dispatch(new UpdateHeaders(this.title, this.temporalKey, 0));
      // this.store.dispatch(new UpdateTemporalKey(this.title, myKey));
    }
    if (this.header[index].order === 1) {
      console.log('To v');
      // this.store.dispatch(new UpdateHeaders(this.title, myKey, 2));
      // descripcion , isNumeric, orderActual
      this.orderByBalance(myKey, isNumeric, 2);
      // this.header[index].order = 2;
    } else if (this.header[index].order === 2 || this.header[index].order === 0) {
      console.log('To ^');
      // this.store.dispatch(new UpdateHeaders(this.title, myKey, 1));
      this.orderByBalance(myKey, isNumeric, 1);
      // this.header[index].order = 1;
    }
    // } else {
    //   this.header[index].order = 1;
    // }
    this.oldIndex = index;
    // this.temporalKey = myKey;
    return false;
  }


  orderByBalance(id: string, nb = false, order = 0) {
    console.log('id recibido: ', id);
    if (this.temporalSort === '') { this.temporalSort = id; }
    // this.sort = true;
    if (this.temporalSort !== id) { this.temporalSort = id; }
    if (order === 1) {
      this.sort = true;
    } else {
      this.sort = false;
    }
    if (nb) {
      console.log('order numb ', id);
      // tslint:disable-next-line: max-line-length
      this.data.sort((a, b) => (this.sort) ? ((parseFloat(a[id]) > parseFloat(b[id])) ? 1 : -1) : ((parseFloat(a[id]) < parseFloat(b[id])) ? 1 : -1));
    } else {
      console.log('ordenando string', id, '||', this.sort);
      this.data.sort((a, b) => (this.sort) ? ((a[id] > b[id]) ? 1 : -1) : ((a[id] < b[id]) ? 1 : -1));
    }
    this.temporalArray = this.data.slice(0);
    this.data = [];
    // console.log('temporal array', this.temporalArray)
    setTimeout(() => {
      this.data = this.temporalArray;
    }, 100);
  }

}

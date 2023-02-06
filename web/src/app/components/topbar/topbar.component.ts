import { Component, ElementRef, HostListener, OnInit, ViewChild } from '@angular/core';
import { StoreAppState } from '@app/common/interfaces/store';
import { select, Store } from '@ngrx/store';
import { debounce } from 'lodash-es';
import { TopbarService } from './topbar.service';
import * as appSelector from '@app/store/selectors/app.selector';
import { AppActions } from '@app/store/actions';
// import  * as packageInfo  from '@full/package.json';
import { AppHttpClientService } from '@app/services/util-services/app-http-client.service';

@Component({
  selector: 'ns-topbar',
  templateUrl: './topbar.component.html',
  styleUrls: ['./topbar.component.scss'],
  providers: [
    TopbarService
  ]
})
export class TopbarComponent implements OnInit {
  @ViewChild('search') input: ElementRef;
  @ViewChild('inputWrapper') inputWrapper: ElementRef;



  APP_VERSION: string = 'v1.0.0'

  results = [];
  loading: boolean;
  focusedInput: boolean;
  searchText = '';
  initial = []
  userAlias$: any;
  
  constructor(
    private store: Store<StoreAppState>,
    public http: AppHttpClientService,
    private service: TopbarService) {
    this.textSearch = debounce(this.textSearch, 250);
  }

  ngOnInit(): void {
    this.userAlias$ = this.store.pipe(select(appSelector.selectUserAlias));
   this.setInitial();
  }

  logout() {
    this.store.dispatch(AppActions.Logout());
  }

  setInitial(){
    this.http.get('empresa').subscribe(data => {
      this.initial = data.map(it => {
        return it;
      });
      // console.log(this.initial)
    });
  }

  textSearch(text: string) {
    this.service.searchByText(text).subscribe(
      {
        next: (data) => {
          this.results = data || [];
          this.loading = false;
        },
        error: (err) => {
          this.results = [];
          this.loading = false;
        },
      }
    );
  }

  resetInput() {
    this.results = [];
    this.loading = false;
    this.focusedInput = false;
    this.input.nativeElement.value = '';
    this.searchText = '';
  }

  @HostListener('document:click', ['$event'])
  clickout(event: Event) {
    if (this.inputWrapper.nativeElement.contains(event.target)) {
      this.input.nativeElement.focus();
    } else {
      this.resetInput();
    }
  }
}

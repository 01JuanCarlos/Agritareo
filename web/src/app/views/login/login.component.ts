import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DEFAULT, LOGIN_API_PATH } from '@app/common/constants';
import { StoreAppState } from '@app/common/interfaces/store/store-state.interface';
import { AppService } from '@app/services/app.service';
import { AppHttpClientService } from '@app/services/util-services/app-http-client.service';
import { Store } from '@ngrx/store';
import { finalize } from 'rxjs/operators';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit, OnDestroy {
  public error: string;
  public lang = DEFAULT.LANGUAGE;
  public corporations$
  public languages$
  public submit = false;
  public loginForm : FormGroup;



  constructor(
    private formBuilder: FormBuilder,
    private store: Store<StoreAppState>,
    private app: AppService,
    private http: AppHttpClientService
  ) { }

  ngOnInit() {
    this.corporations$ = this.store.select('app', 'corporations');
    this.languages$ = this.store.select('app', 'languages');
    this.loginForm = this.formBuilder.group({
      username: ['', Validators.required],
      password: ['', Validators.required],
      idcompany: ['', Validators.required],
      idcorp: ['']
    });
    this.lang = this.app.user.preferredLanguage;
  }

  updateLang() {
    this.app.changeLanguage(this.lang);
  }

  get username() {
    return this.loginForm.get('username');
  }

  get password() {
    return this.loginForm.get('password');
  }

  get idcompany() {
    return this.loginForm.get('idcompany');
  }

  onSelectChange(item: any) {
    if (item !== undefined) {
      this.loginForm.patchValue({ idcorp: String(item.parentId), idcompany: String(item.id) });
    }
  }

  onSubmit() {
    this.error = '';
    if (this.loginForm.valid) {
      this.submit = true;
      this.http
        .post(LOGIN_API_PATH, this.loginForm.value)
        .pipe(
          finalize(() => {
            this.submit = false;
          })
        )
        .subscribe(() => { }, err => {
          this.error = err.message;
        });
    }
  }

  ngOnDestroy(): void {
    this.error = '';
    this.submit = false;
  }
}

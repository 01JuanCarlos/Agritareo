import { Component, OnInit } from '@angular/core';
import { StoreAppState } from '@app/common/interfaces/store';
import * as appSelector from '@app/store/selectors/app.selector';
import { select, Store } from '@ngrx/store';

// agregado por glenn
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { CLAVE } from '@app/common/constants/agritareo.constants';
import { AppHttpClientService } from '@app/services/util-services/app-http-client.service';
 //----------------------------------------------------



@Component({
  selector: 'ns-perfil',
  templateUrl: './perfil.component.html',
  styleUrls: ['./perfil.component.scss']
})
export class PerfilComponent implements OnInit {
  // user$ = this.store.pipe(select(appSelector.selectUser));





    // agregado por glenn
    public error: string;
    public ActulizarCvForm: FormGroup;
    protected router: Router;
    //----------------------------------------------------

  userInfo: any;

  constructor(
    private store: Store<StoreAppState>,
    // agregado por glenn
    private formBuilder: FormBuilder,
    private http: AppHttpClientService
    //----------------------------------------------------
  
  ) {
    this.store.pipe(select(appSelector.selectUser)).subscribe(data => this.userInfo = data);
  }

  ngOnInit() {
    // agregado por glenn
    this.ActulizarCvForm = this.formBuilder.group({
      idusu: [''],
      passwor: ['', Validators.required],
      newpassword: ['', Validators.required],
      newpassword2: ['', Validators.required]
    });
    //----------------------------------------------------
  
  }

  onSubmit(formObj?) {
    const formValue = formObj || this.ActulizarCvForm.value;    
    this.http.post(CLAVE, formValue, { isTransaction: true }).subscribe((data) => {
      const route = this.router.url.split('/');
      route.pop();
      route.push(data);
      this.router.navigateByUrl(route.join('/'));
    });
  }

}

import { Injectable } from '@angular/core';
import { PersistenceService } from './util-services/persistence.service';
import { PKEY, DEFAULT } from '@app/common/constants';
import { AuthService } from './auth-services/auth.service';
import { Store } from '@ngrx/store';
import { StoreAppState } from '@app/common/interfaces/store';
import { AppActions } from '@app/store/actions';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  notifications = [];
  userId = 0;
  userName = 'Guest';
  currentModule = 0;
  userToken = '';
  companyId = 0;
  corporationId = '';
  preferredLanguage = '';

  constructor(
    private persistence: PersistenceService,
    private auth: AuthService,
    private store: Store<StoreAppState>) {

    const [language] = navigator.language.split('-');

    this.setPreferredLanguage(this.persistence.get(PKEY.LANGUAGE) || language);

    if (this.isAuthenticated) {
      this.initialize();
    }
  }

  setPreferredLanguage(language: string) {
    this.preferredLanguage = language || DEFAULT.LANGUAGE;
    this.store.dispatch(AppActions.SetCurrentLanguage({ language: this.preferredLanguage }));
  }

  setUsername(name: string) {
    this.userName = name;
  }

  get isAuthenticated() {
    return this.auth.isAuthenticated;
  }

  initialize() {
    this.userId = this.persistence.get(PKEY.USER_ID);
    this.currentModule = this.persistence.get(PKEY.CURRENT_MODULE);
    this.userToken = this.persistence.get(PKEY.USER_TOKEN);
    this.companyId = this.persistence.get(PKEY.ID_COMPANY);
    this.corporationId = this.persistence.get(PKEY.ID_CORP);
  }

  login(data: any, renew?: boolean) {
    this.auth.createSession(data, renew);
    this.store.dispatch(AppActions.ToSecurePath());
  }

  logout() {
    this.auth.clearUserSession();
    this.store.dispatch(AppActions.ToLoginPath());
  }

}

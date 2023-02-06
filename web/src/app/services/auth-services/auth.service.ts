import { Injectable, NgZone } from '@angular/core';
import { PKEY } from '@app/common/constants';
import { StoreAppState } from '@app/common/interfaces/store';
import { AppActions } from '@app/store/actions';
import { Store } from '@ngrx/store';
import { PersistenceService } from '../util-services/persistence.service';

@Injectable()
export class AuthService {
  public userLoginExpireAt = 0;
  private MESSAGE_EXPIRATION_TIME = 15;
  private interval = null;
  private showingExpiration = false;
  public redirectPath: string;

  constructor(
    private persistence: PersistenceService,
    private store: Store<StoreAppState>,
    private zone: NgZone
  ) {

    this.userLoginExpireAt = this.persistence.get(PKEY.USER_LOGIN_EXPIRE);

    if (this.isAuthenticated) {
      this.verifyLoginExpire();
    }
  }

  get notifyExpiresAt() {
    return this.userLoginExpireAt - (this.MESSAGE_EXPIRATION_TIME * 30 * 1e3);
  }

  createSession(data: any, renew?: boolean) {
    this.userLoginExpireAt = data.expire * 1e3;

    if (this.userLoginExpireAt > Date.now()) {
      this.persistence.set(PKEY.USER_TOKEN, data.token);

      if (!renew) {
        this.persistence.set(PKEY.ID_COMPANY, data.companyId);
        this.persistence.set(PKEY.ID_CORP, data.corpId);
        this.persistence.set(PKEY.USER_ID, data.userId);
      }

      this.persistence.set(PKEY.USER_LOGIN_EXPIRE, this.userLoginExpireAt);

      clearInterval(this.interval);
      this.verifyLoginExpire();
    }
  }

  closeExpirationMessage() {
    this.showingExpiration = !1;
    // this.modal.close('expire-user-session');
  }

  showExpirationMessage() {
    this.showingExpiration = !0;
    // this.modal.open('expire-user-session');
  }

  // Verificar si el login expirará pronto.
  verifyLoginExpire() {
    this.zone.runOutsideAngular(() => {
      this.interval = setInterval(() => {
        if (Date.now() >= this.userLoginExpireAt) {
          clearInterval(this.interval);
          // this.clearUserSession();
          this.closeExpirationMessage();
          this.store.dispatch(AppActions.Logout());
          return;
        }

        if (Date.now() >= this.notifyExpiresAt && !this.showingExpiration) {
          this.showExpirationMessage();
          return;
        }
      }, 1e3);
    });
  }

  // is authenticated
  get isAuthenticated(): boolean {
    const expire = this.userLoginExpireAt;
    const userToken = this.persistence.get(PKEY.USER_TOKEN);
    const userId = this.persistence.get(PKEY.USER_ID);
    return Date.now() < expire && userToken && userId;
  }

  clearUserSession(): void {
    clearInterval(this.interval);
    this.persistence.remove(PKEY.USER_TOKEN);
    this.persistence.remove(PKEY.ID_COMPANY);
    this.persistence.remove(PKEY.ID_CORP);
    this.persistence.remove(PKEY.USER_ID);
    this.persistence.remove(PKEY.USER_LOGIN_EXPIRE);
    this.persistence.remove(PKEY.MODULE_ID);
    this.persistence.remove(PKEY.CURRENT_MODULE);
    // document.cookie = 'NSSESSID20=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;';
    this.persistence.removeCookie('NSSESSID20', false);
  }

}

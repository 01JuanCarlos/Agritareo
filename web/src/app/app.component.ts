import { Component, DoCheck, HostListener, isDevMode } from '@angular/core';
import { Store } from '@ngrx/store';
import { url } from 'ngx-custom-validators/src/app/url/validator';
import { RENEW_API_PATH } from './common/constants';
import { StoreAppState } from './common/interfaces/store';
import { AuthService } from './services/auth-services/auth.service';
import { AppHttpClientService } from './services/util-services/app-http-client.service';
import { BlockUIService, BlockUIType } from './services/util-services/blockui.service';
import { AppActions } from './store/actions';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html'
})
export class AppComponent implements DoCheck {
  interval: NodeJS.Timer;
  hours = '00';
  minutes = '00';
  seconds = '00';

  // isDev = trueisDevMode();
  isDev = true;

  loaderMessage = '';
  loaderMessageType = BlockUIType.LOADING;
  loaderMessageIcon = '';
  loaderMessageWidth = 100; // +25
  loaderMessageTop = 0;
  loaderMessageLeft = 0;
  lastUpdated = Date.now();
  lastUpdatedCount = 0;

  @HostListener('window:resize', ['$event'])
  resizeWindow(event: Event) {
    this.updateLoaderMessage(event.target as Window);
  }


  get emailSubject() {
    return `mailto:incoming+ns-desarrollo-web-agritareo-agritareo-web-14167778-97rpf1mgm6hxal13nkg44bxjv-issue@incoming.gitlab.com?body=Descripción e imagen(es) de la(s) observacion(es): &subject=Observacion Vista: ${window.location.href}`
  }


  ngDoCheck() {
    if (Date.now() - this.lastUpdated <= 50) {
      this.lastUpdatedCount += 1;
    }

    if (Date.now() - this.lastUpdated > 20 * 1e3) {
      this.lastUpdatedCount = 0;
    }

    if (this.lastUpdatedCount > 200) {
      // Sirve como advertencia para evitar que componentes o plugins que usar timers envien actualizaciones.
      console.warn('Demasiadas actualizaciones por segundo.');
      this.lastUpdatedCount = 0;
    }

    // console.log({ updated: this.lastUpdated, count: this.lastUpdatedCount });
    this.lastUpdated = Date.now();
  }

  constructor(
    private auth: AuthService,
    private http: AppHttpClientService,
    private store: Store<StoreAppState>,
    public blockui: BlockUIService
  ) {

    this.blockui.messages.subscribe(message => {
      this.loaderMessage = message.message;
      this.loaderMessageType = message.type;
      this.loaderMessageIcon = message.icon;
      this.loaderMessageWidth = this.loaderMessage.length * 8;
      this.updateLoaderMessage(window);
    });
  }

  get loaderClass() {
    return {
      ['loader-type-' + BlockUIType[this.loaderMessageType].toLowerCase()]: true
    };
  }

  updateLoaderMessage(target: Window) {
    this.loaderMessageTop = (target.innerHeight / 2) - 71;
    this.loaderMessageLeft = (target.innerWidth / 2) - ((this.loaderMessageWidth / 2));
  }

  setExpireTime() {
    const time = new Date(this.auth.userLoginExpireAt - Date.now());
    this.hours = String(100 + time.getUTCHours()).slice(1);
    this.minutes = String(100 + time.getUTCMinutes()).slice(1);
    this.seconds = String(100 + time.getUTCSeconds()).slice(1);
  }

  onShowExpireModal() {
    this.setExpireTime();
    this.interval = setInterval(() => this.setExpireTime(), 1e3);
  }

  onHideExpireModal() {
    clearInterval(this.interval);
  }

  staySignedIn() {
    this.http.post(RENEW_API_PATH).subscribe(result => {
      if (result && result.token && result.expire) {
        this.auth.createSession(result, true);
        this.auth.closeExpirationMessage();
      }
    });
  }

  signOut() {
    this.auth.closeExpirationMessage();
    this.store.dispatch(AppActions.Logout());
  }
}

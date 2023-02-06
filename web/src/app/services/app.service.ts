import { Location } from '@angular/common';
import { Injectable } from '@angular/core';
import { APP_API_PATH, DEFAULT, INITIAL_API_PATH, LOGIN_PATH, PKEY } from '@app/common/constants';
import { StoreAppState } from '@app/common/interfaces/store/store-state.interface';
import { Logger } from '@app/common/utils/logger.util';
import { AppActions } from '@app/store/actions';
import { Store } from '@ngrx/store';
import { TranslateService } from '@ngx-translate/core';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { finalize } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { UserService } from './user.service';
import { AppHttpClientService } from './util-services/app-http-client.service';
import { AppWsClientService } from './util-services/app-ws-client.service';
import { BlockUIService } from './util-services/blockui.service';
import { DataBaseService } from './util-services/database.service';
import { PersistenceService } from './util-services/persistence.service';
import { SweetAlertService } from './util-services/sweet-alert.service';

@Injectable()
export class AppService {
  currentTheme = DEFAULT.THEME;
  currentTextDir = DEFAULT.TEXT_DIR;
  currentFontSize = DEFAULT.FONT_SIZE;
  currentNavColor = DEFAULT.NAV_THEME;

  private textDirectionSubject = new BehaviorSubject(false);
  public SaveTreeLayout = new Subject();

  initialAppLoaded = false;
  waitInitialDataInterval = null;

  constructor(
    public user: UserService,
    private store: Store<StoreAppState>,
    private http: AppHttpClientService,
    private translate: TranslateService,
    private alert: SweetAlertService,
    private persistence: PersistenceService,
    private wss: AppWsClientService,
    private db: DataBaseService,
    private location: Location,
    private blockui: BlockUIService
  ) { }

  /**
   * Esperar que la data inicial termine de cargar para obtener infomación del módulo.
   */
  waitInitialData(): Observable<boolean> {
    return new Observable(observer => {
      clearTimeout(this.waitInitialDataInterval);

      const wait = () => {
        this.waitInitialDataInterval = setTimeout(() => {
          if (this.initialAppLoaded) {
            observer.next(true);
            observer.complete();
          } else {
            wait();
          }
        }, 100);
      };

      wait();
    });
  }

  /**
   * Inicializa la aplicación teniendo en cuenta los datos almacenados localmente.
   */
  initApp() {
    Logger.debug('Iniciando App Nisira ERP');
    // TODO: Añade los idiomas disponibles en el ERP
    this.translate.addLangs(['es', 'en']);
    this.translate.setDefaultLang(DEFAULT.LANGUAGE);

    // Iniciar el servicio de almacenamiento.
    this.db.init();

    this.changeTheme(this.persistence.get(PKEY.THEME));
    // this.changeNavColor(this.persistence.get(PKEY.NAV_THEME));
    this.changeFontSize(this.persistence.get(PKEY.FONT_SIZE));
    this.changeTextDir(this.persistence.get(PKEY.TEXT_DIR));
  }

  initAppSettings() {
    if (this.user.isAuthenticated) {
      this.blockui.show('Iniciando Nisira ERP...');
    }

    if (this.location.path() === LOGIN_PATH && this.user.isAuthenticated) {
      this.store.dispatch(AppActions.ToSecurePath());
    }

    Logger.warn('Cargando configuración de la App: Nisira ERP...');

    const SUBDOMAINREGEX = new RegExp(`(https?:\/\/)?(.*\n?)(?=.${environment.domain})`, 'g');
    const subdomain = window.location.host.match(SUBDOMAINREGEX);

    this.http
      .get(APP_API_PATH, { d: subdomain?.[0] ? btoa(subdomain[0]) : void 0 })
      .pipe(
        finalize(() => {
          if (this.user.isAuthenticated) {
            this.loadInitialSettings();
          }
        })
      )
      .subscribe(data => {
        if (!!data) {
          // Setear configuraciónes por defecto
          this.store.dispatch(AppActions.SetCorporations({ corporations: data.corporations }));
          this.store.dispatch(AppActions.SetLanguages({ languages: data.languages }));
        }
      });
  }

  loadInitialSettings() {
    this.blockui.show('Obteniendo información de usuario.');
    // INFO: Hack para cambiar de idioma sin que se quede el otro congelado.
    setTimeout(() => this.changeLanguage(this.user.preferredLanguage), .5e3);
    const navigator = window.navigator || window.clientInformation;

    this.http.post(INITIAL_API_PATH, {
      load_module: !1,
      time: Date.now(),
      language: this.user.preferredLanguage,
      platform: navigator.platform
    }).subscribe(result => {
      const { company_configuration, user_configuration } = result || { company_configuration: null, user_configuration: null };
      // Setear preferencias de usuario y de la empresa.
      if (!company_configuration || !user_configuration) {
        return this._showErrorMessage();
      }

      if (company_configuration.modules) {
        this.store.dispatch(AppActions.SetCompanyModules({ modules: company_configuration.modules }));
        delete company_configuration.modules;
      } else {
        this.blockui.setMessage('Su cuenta de usuario no tiene privilegios.', 0);
        return setTimeout(() => {
          this.blockui.hide();
          this.user.logout();
        }, 5e3);
      }

      if (company_configuration.components) {
        this.store.dispatch(AppActions.SetCompanyComponents({ components: company_configuration.components }));
        delete company_configuration.components;
      }

      if (user_configuration.privileges) {
        this.store.dispatch(AppActions.SetUserPrivileges({ privileges: user_configuration.privileges }));
        delete user_configuration.privileges;
      }

      this.store.dispatch(AppActions.SetUserConfiguration({ user_configuration }));
      this.store.dispatch(AppActions.SetCompanyConfiguration({ company_configuration }));
      this.user.setUsername(user_configuration.alias);

      // if (this.user.isAuthenticated) {
      //   this.wss.init(environment.wsBaseAddr || environment.apiBaseAddr, this.user.userToken);
      // }

      this.initialAppLoaded = true;

      this.blockui.hide();
    },
      () => this._showErrorMessage()
    );
  }

  _showErrorMessage() {
    this.blockui.hide();
    // Se ha producido un error. Haga clic en Aceptar para actualizar la página e intentar nuevamente.
    this.alert.error('An error has occurred. Click OK to refresh the page to try again.', 'Network error', {
      allowOutsideClick: false,
      allowEscapeKey: false,
      allowEnterKey: false,
      showCancelButton: true,
      cancelButtonText: 'Salir',
      callback: result => {
        if (false === result) {
          return this.user.logout();
        }
        window.location.reload();
      }
    });
  }

  get isRTL() {
    return this.textDirectionSubject.asObservable();
  }

  changeTextDir(dir: string) {
    this.currentTextDir = dir || DEFAULT.TEXT_DIR;
    this.persistence.set(PKEY.TEXT_DIR, this.currentTextDir);
    document.querySelector('html').setAttribute('dir', this.currentTextDir);
    this.textDirectionSubject.next(this.currentTextDir === 'rtl');
  }

  changeFontSize(size: string) {
    const prevFont = this.currentFontSize;
    this.currentFontSize = size || DEFAULT.FONT_SIZE;
    this.persistence.set(PKEY.FONT_SIZE, this.currentFontSize);
    // document.querySelector('html').setAttribute('text', this.currentFontSize);
    document.querySelector('html').classList.remove('_font-' + prevFont);
    document.querySelector('html').classList.add('_font-' + this.currentFontSize);
  }

  changeTheme(theme: string) {
    const prevTheme = this.currentTheme;
    this.currentTheme = theme || DEFAULT.THEME;
    this.store.dispatch(AppActions.ChangeTheme({ theme: this.currentTheme }));
    this.persistence.set(PKEY.THEME, this.currentTheme);
    // Quitar la el tema anterior y añadir uno nuevo.
    document.querySelector('html').classList.remove('_theme-' + prevTheme);
    document.querySelector('html').classList.add('_theme-' + this.currentTheme);
  }

  changeNavColor(theme: string) {
    const prevColor = this.currentNavColor;
    this.currentNavColor = theme || DEFAULT.NAV_THEME;
    this.persistence.set(PKEY.NAV_THEME, this.currentNavColor);
    document.querySelector('body').classList.remove('nav-theme-' + prevColor);
    document.querySelector('body').classList.add('nav-theme-' + this.currentNavColor);
  }

  changeLanguage(language: string) {
    this.user.setPreferredLanguage(language);
  }
}

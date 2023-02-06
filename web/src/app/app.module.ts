import { HttpClient } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ServiceWorkerModule } from '@angular/service-worker';
import { EffectsModule } from '@ngrx/effects';
import { StoreRouterConnectingModule, DefaultRouterStateSerializer } from '@ngrx/router-store';
import { StoreModule } from '@ngrx/store';
import { StoreDevtoolsModule } from '@ngrx/store-devtools';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { NgxsModule } from '@ngxs/store';
import { LoginComponent } from '@views/login/login.component';
import { environment } from '../environments/environment';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { NsWeatherWidgetComponent } from './components/ns-weather-widget/ns-weather-widget.component';
import { httpInterceptorProviders } from './interceptors';
import { SharedModule } from './modules/shared/shared.module';
import { appHttpClientCreator, AppHttpClientService } from './services/util-services/app-http-client.service';
import { AppEffects } from './store/effects/app.effects';
import { AuthEffects } from './store/effects/auth.effects';
import { TableEffects } from './store/effects/table.effect';
import { storeReducers } from './store/reducers/store.reducer';
@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    NsWeatherWidgetComponent,
  ],
  imports: [
    BrowserAnimationsModule,
    AppRoutingModule,
    SharedModule.forRoot(),
    StoreModule.forRoot(storeReducers, {
      runtimeChecks: {
        strictStateImmutability: false,
        strictActionImmutability: false
      }
    }),
    // Effectos
    EffectsModule.forRoot([
      TableEffects,
      AuthEffects,
      AppEffects
    ]),

    StoreRouterConnectingModule.forRoot({ serializer: DefaultRouterStateSerializer, stateKey: 'router' }),
    !environment.production ? StoreDevtoolsModule.instrument() : [],
    ServiceWorkerModule.register('ngsw-worker.js', { enabled: environment.production }),

    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: (http: HttpClient) => {
          return new TranslateHttpLoader(http, './assets/i18n/', '.json');
        },
        deps: [HttpClient]
      }
    }),
    NgxsModule.forRoot([], { developmentMode: !environment.production })
  ],
  providers: [
    {
      provide: AppHttpClientService,
      useFactory: appHttpClientCreator,
      deps: [HttpClient]
    },
    httpInterceptorProviders
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }

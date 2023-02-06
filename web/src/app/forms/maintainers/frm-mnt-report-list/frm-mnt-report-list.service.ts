import { Injectable } from '@angular/core';
import { FORM_MODULES_API_PATH } from '@app/common/constants';
import { AppHttpClientService } from '@app/services/util-services/app-http-client.service';

@Injectable({
  providedIn: 'root'
})
export class FrmMntReportListService {

  modules = [];

  constructor(private http: AppHttpClientService) {
    this.getModules().subscribe(data => {
      this.modules = data;
    });
  }

  getModules() {
    return this.http.get(FORM_MODULES_API_PATH);
  }

  getComponents(module: string) {
    return this.modules.find(m => m.id === module).formularios;
  }
}

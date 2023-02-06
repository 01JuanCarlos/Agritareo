import { Injectable } from '@angular/core';
import { AppHttpClientService } from '@app/services/util-services/app-http-client.service';

@Injectable()
export class NsUploaderService {

  constructor(private http: AppHttpClientService) { }

  uploadFile(fileUrl: string, file: File) {
    const formData = new FormData();
    formData.append('files', file);

    return this.http.post(fileUrl, formData, {
      reportProgress: true,
      observe: 'events',
    });
  }
}

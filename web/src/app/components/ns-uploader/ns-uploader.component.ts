import { HttpEventType } from '@angular/common/http';
import { Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { Bool } from '@app/common/decorators';
import { NsUploaderService } from './ns-uploader.service';

@Component({
  selector: 'ns-uploader',
  templateUrl: './ns-uploader.component.html',
  styleUrls: ['./ns-uploader.component.scss'],
  providers: [
    NsUploaderService
  ]
})
export class NsUploaderComponent implements OnInit {
  @ViewChild('uploaderZone', { static: true }) uploaderZone: ElementRef;
  @ViewChild('fileInput', { static: true }) fileInput: ElementRef;

  @Input() icon = 'mi-keyboard-capslock';
  @Input() label = 'Subir';
  @Input() type: string;
  @Input() disabled: boolean;
  @Input() material = true;

  @Input() fileUrl: string;
  @Input() accept: string;

  @Input() @Bool multiple: boolean;

  openedModal: boolean;
  dataTransfer = new DataTransfer();

  constructor(private service: NsUploaderService) { }

  ngOnInit(): void {
    const dropContainer = this.uploaderZone.nativeElement;
    dropContainer.ondragover = dropContainer.ondragenter = (evt: any) => {
      evt.preventDefault();
    };

    dropContainer.ondrop = (evt: any) => {
      evt.preventDefault();
      this.onUpdatedElement(evt.dataTransfer.files);
    };
  }

  onUpdatedElement(files: FileList) {
    const fileInput = this.fileInput.nativeElement;

    if (!this.multiple) {
      this.dataTransfer.clearData();
      this.dataTransfer.items.add(files.item(0));
      this.uploadSingleFile(files.item(0));
      return fileInput.files = files.item(0);
    }

    Array.prototype.forEach.call(files, (item: File) => {
      this.dataTransfer.items.add(item);
      this.uploadSingleFile(item);
    });

    fileInput.files = this.dataTransfer.files;
  }

  get _files() {
    const filesTrad = [];
    const files = this.dataTransfer.files;

    Array.prototype.forEach.call(files, (item: any) => {
      const { name, size, type, status, message, loaded, messageType } = item;
      // const typeExt = type.split('/')[1] || name.split('.').slice(-1).pop();
      const typeExtArr = name.split('.').length;
      const typeExt = typeExtArr.length ? typeExtArr.pop() : 'none';
      const sizeMB = (size / 1024 / 1024).toFixed(2);
      filesTrad.push({ name, size, type, typeExt, sizeMB, status, message, loaded, messageType });
    });
    return filesTrad;
  }

  uploadSingleFile(file: any) {
    const fr = new FileReader();
    fr.readAsDataURL(file);

    fr.onload = () => {
      this.service.uploadFile(this.fileUrl, file)
        .subscribe(event => {
          if (event.type === HttpEventType.UploadProgress) {
            const percentCompleted = Math.floor(event.loaded * 100 / event.total);
            file.message = 'UPLOADING';
            file.messageType = 'UPLOADING';
            file.loaded = (event.loaded / 1024 / 1024).toFixed(2);
            file.status = percentCompleted;
          }

          if (event.type === HttpEventType.Response) {
            if (event.body?.error) {
              file.message = event.body.error.message || 'Error';
              file.messageType = 'ERROR';
            } else {
              file.message = 'DONE';
              file.messageType = 'DONE';
            }
          }
        });
    };
  }
}

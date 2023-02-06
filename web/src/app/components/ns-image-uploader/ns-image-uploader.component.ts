import { HttpEventType } from '@angular/common/http';
import { Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { Bool } from '@app/common/decorators';
import { AppHttpClientService } from '@app/services/util-services/app-http-client.service';

@Component({
  selector: 'ns-image-uploader',
  templateUrl: './ns-image-uploader.component.html',
  styleUrls: ['./ns-image-uploader.component.scss']
})
export class NsImageUploaderComponent implements OnInit {
  @ViewChild('inputFile', { static: true }) fileInput: ElementRef;

  @Output() uploaded = new EventEmitter();

  @Input() @Bool noUpload: boolean;
  @Input() @Bool noPreview: boolean;
  @Input() imagesList = [];

  dataTransfer = new DataTransfer();
  dataImageList = [];

  hoverDrag: boolean;
  error: boolean;


  constructor(private http: AppHttpClientService) { }

  ngOnInit(): void {
  }

  onDragOver(event) {
    event.preventDefault();
    this.hoverDrag = true;
  }

  onDragLeave(event) {
    event.preventDefault();
    this.hoverDrag = false;
  }

  onUpdatedElement(files: FileList) {
    const fileInput = this.fileInput.nativeElement;

    Array.prototype.forEach.call(files, (item: File) => {
      this.dataTransfer.items.add(item);
      this.onChangeFile(item);
    });

    fileInput.files = this.dataTransfer.files;
  }

  get _files() {
    const filesTrad = [];
    const files = this.dataTransfer.files;

    Array.prototype.forEach.call(files, (item: any) => {
      const { name, size, type, status, message, loaded, messageType, imageURL, blob } = item;
      // const typeExt = type.split('/')[1] || name.split('.').slice(-1).pop();
      const typeExtArr = name.split('.').length;
      const typeExt = typeExtArr.length ? typeExtArr.pop() : 'none';
      const sizeMB = (size / 1024 / 1024).toFixed(2);
      filesTrad.push({ name, size, type, typeExt, sizeMB, status, message, loaded, messageType, imageURL, blob });
    });
    return filesTrad;
  }


  onChangeFile(file): void {
    // console.log(files);
    // if (files && files.item(0)) {
    const fr = new FileReader();
    fr.readAsDataURL(file);

    fr.onload = () => {
      const imagePreview = fr.result.toString();
      const selectedFile = file;

      const formData = new FormData();
      formData.append('file', selectedFile);

      if (this.noUpload) {
        // TODO: Mapear contenido
        const image = { ...file, blob: imagePreview };
        this.uploaded.emit(image);
        return this.dataImageList.push(image);
      }

      return this.http.post('images', formData, {
        reportProgress: true,
        observe: 'events',
      }).subscribe(event => {
        if (event.type === HttpEventType.UploadProgress) {
        }

        if (event.type === HttpEventType.Response) {
          if (event.body?.error) {
            this.error = true;
          }
          else {
            this.error = false;
            file.imageURL = event.body.data[0]?.ruta;

            this.uploaded.emit(event.body.data[0]);
          }
        }
      });
    };
    // }
  }
}

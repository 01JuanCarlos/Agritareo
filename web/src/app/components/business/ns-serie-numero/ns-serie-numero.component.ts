import { animate, style, transition, trigger } from '@angular/animations';
import { Component, forwardRef, Input, OnInit } from '@angular/core';
import { ControlValueAccessor, FormBuilder, FormGroup, NG_VALUE_ACCESSOR } from '@angular/forms';
import { DOCSERIE_API_PATH } from '@app/common/constants';
import { AppHttpClientService } from '@app/services/util-services/app-http-client.service';
import { finalize, tap } from 'rxjs/operators';
import { NsSerieNumeroService } from './ns-serie-numero.service';
import { Bool } from '@app/common/decorators';

@Component({
  selector: 'ns-serie-numero',
  templateUrl: './ns-serie-numero.component.html',
  styleUrls: ['./ns-serie-numero.component.scss'],
  providers: [
    NsSerieNumeroService,
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => NsSerieNumeroComponent),
      multi: true
    }
  ],
  animations: [
    trigger('fadeInOut', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateX(100%)' }),
        animate(200)
      ]),
      transition(':leave', [
        style({ opacity: 0, transform: 'translateX(-100%)' }),
        animate(200)
      ])
    ]),
    trigger('animLeft', [
      transition(':enter', [
        style({ transform: 'translateX(100%)' }),
        animate(200, style({ transform: 'translateX(0)' })),
      ]),
      transition(':leave', [
        style({ display: 'none', transform: 'translateX(0)' }),
        animate(200, style({ transform: 'translateX(100%)' })),
      ]),
    ]),
    trigger('animRight', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateX(-100%)' }),
        animate(200, style({ opacity: 1, transform: 'translateX(0)' })),
      ]),
      transition(':leave', [
        style({ display: 'none', transform: 'translateX(0)' }),
        animate(200, style({ transform: 'translateX(-100%)' })),
      ]),
    ]),
  ]
})
export class NsSerieNumeroComponent implements ControlValueAccessor, OnInit {
  @Input() viewComponentId: string; // IdComponente  de la vista
  @Input() disabled: boolean;
  @Input() loadDefault: boolean; // Carga serie y numero por defecto
  @Input() readonly: boolean;
  @Input() @Bool inline: boolean;

  public loading = false;
  public expanded = false;

  public documents = [];
  public series = [];
  public value = null;

  public document = '';
  public serie = '';
  public number = '';
  public form : FormGroup;


  public propagateChange = (_: any) => { };
  public onTouched = (_: any) => { };
  // TODO: Reducir code...
  constructor(
    private fb: FormBuilder,
    private http: AppHttpClientService
  ) { }

  ngOnInit() {
    this.form = this.fb.group({
      documentid: [''],
      document: [''],
      serieid: [''],
      serie: [''],
      number: ['']
    });
    this.form.valueChanges.subscribe(() => {
      const doc = this.documents.find(d => d.id === this.form.value.documentid);
      const ser = this.series.find(s => s.id === this.form.value.serieid);

      this.document = doc?.label ?? '-';
      this.serie = ser?.label ?? '-';
      this.number = this.form.value.number;

      this.propagateChange({
        ...this.form.value,
        document: this.document,
        serie: this.serie,
      });
    });

    if (this.inline) {
      this.expand();
    }
  }

  expand() {
    this.expanded = !this.expanded;
    if (this.expanded && !this.documents.length) {
      this.load().subscribe();
    }
  }

  private setSample() {
    const [doc] = this.documents;
    const [ser] = this.series;

    this.document = doc?.label ?? '-';
    this.serie = ser?.label ?? '-';
    if (this.value?.number) {
      this.number = this.value.number;
    }

    this.form.patchValue({
      documentid: doc.id,
      document: doc.label,
      serieid: ser.id,
      serie: ser.label,
      number: this.number
    });
  }

  private load() {
    this.loading = true;
    return this.http
      .get(DOCSERIE_API_PATH, { cid: this.viewComponentId })
      .pipe(
        tap(s => {
          this.documents = s?.documents ?? [];
          this.series = s?.series ?? [];
          this.number = s?.number ?? '';
        }),
        finalize(() => this.loading = false)
      );
  }

  // ControlValueAccessor

  writeValue(value: any) {
    this.value = value;

    if (void 0 !== this.value && null !== this.value) {
      this.form.patchValue(this.value);
      this.document = this.value.document;
      this.serie = this.value.serie;
      this.number = this.value?.number;

    } else if (this.loadDefault) {
      this.load().subscribe(rs => {
        this.setSample();
      });
    }

  }

  registerOnChange(fn: any) {
    this.propagateChange = fn;
  }

  registerOnTouched(fn: any) {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean) {
    this.disabled = isDisabled;
  }
}

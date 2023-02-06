import { Component, EventEmitter, Injector, Input, OnChanges, OnInit, Output } from '@angular/core';
import { Validators } from '@angular/forms';
import { AbstractFormGroup } from '@app/common/classes/abstract-form-group.class';
import { StoreAppState } from '@app/common/interfaces/store/store-state.interface';
import { selectFullMenu } from '@app/store/selectors/app.selector';
import { select, Store } from '@ngrx/store';

@Component({
  selector: 'ns-frm-mnt-menu-setup',
  templateUrl: './frm-mnt-menu-setup.component.html',
  styleUrls: ['./frm-mnt-menu-setup.component.scss']
})
export class FrmMntMenuSetupComponent extends AbstractFormGroup implements OnInit, OnChanges {
  componentId = 'FrmMntMenuSetupComponent';
  @Input() item: any;
  @Input() delete: any;
  @Output() reload = new EventEmitter();

  form = this.fb.group({
    id: [''],
    nombre: ['', [Validators.required, Validators.minLength(1)]],
    link: ['', [Validators.required, Validators.minLength(1)]],
    idmodulo: ['', [Validators.required]],
    target: ['', [Validators.required]],
    tooltip: ['']
  });

  data$ = this.store.pipe(select(selectFullMenu));

  constructor(private store: Store<StoreAppState>, injector: Injector) {
    super(injector);
  }

  // Detecta las propiedades Input que se setean
  ngOnChanges(changes: any) {
    if (changes.item !== undefined) {
      const item = changes.item.currentValue;
      if (item) {
        this.isEditMode = true;
        this.form.controls.target.clearValidators();
        this.form.setValue(
          {
            id: item.id as number,
            nombre: item.title,
            link: item.link as string,
            idmodulo: item.module_id as number,
            target: null,
            tooltip: item.tooltip as string || null
          }
        );
      }
    }
    if (changes.delete !== undefined) {
      this.isEditMode = undefined;
      const deleteId = changes.delete.currentValue;
      if (deleteId) {
        this.formService.delete(this.ajaxPath, deleteId).subscribe(result => {
          console.log('Respuesta del la eliminación: ', result); // Dile al perra anciano que las respuestas son con estado 204 sin contenido.
        });
        super.onSubmit();
      }
    }
  }

  ngOnInit() { }

  cancel() {
    this.isEditMode = false;
    this.item = null; // Oculta los if limpiando el objeto
    this.form.reset(); // Limpia el formulario
    this.form.controls.target.setValidators([Validators.required]); // Vuelve a colocar la regla en target
  }

  onSubmit() {
    super.onSubmit();
    this.reload.emit();
  }

  getModuleId(item: any) {
    this.form.patchValue({
      idmodulo: item.parentId
    });
  }
}

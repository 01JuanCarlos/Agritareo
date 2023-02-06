import { FormArray, FormControl, FormGroup } from '@angular/forms';
import { cloneDeep } from 'lodash-es';

export function deepPatch(valueObj: any, form: FormGroup) {
  Object.keys(valueObj).forEach(formItemKey => {
    const objectItemValue = valueObj[formItemKey];
    const formItemControl = form.controls[formItemKey];

    if (formItemControl instanceof FormArray || objectItemValue instanceof Array) {
      let formArray = formItemControl as FormArray;
      let formGroupStructure: any = formArray?.controls ? cloneDeep(formArray.controls[0]) : null;

      if (!formGroupStructure) {
        formGroupStructure = new FormGroup({});
        Object.keys((objectItemValue || [])[0] ?? {}).forEach(itemKey => {
          if (objectItemValue[0][itemKey] instanceof Array) {
            formGroupStructure.addControl(itemKey, new FormArray([]));
          }
          formGroupStructure.addControl(itemKey, new FormControl(''));
        });
      }

      if (!(formArray instanceof FormArray)) {
        formArray = new FormArray([]);
      }
      formArray.clear();

      Object.keys(objectItemValue || {}).forEach(detailKey => {
        deepPatch(objectItemValue[detailKey], formGroupStructure);
        const copyStructure = cloneDeep(formGroupStructure);
        copyStructure.patchValue(objectItemValue[detailKey]);
        formArray.push(cloneDeep(copyStructure));
      });
      return;
    }

    if (!formItemControl) {
      return;
    }

    formItemControl.patchValue(objectItemValue);
  });
}

import { AfterViewInit, Component, ContentChildren, EventEmitter, Input, NgZone, OnChanges, OnInit, Output, QueryList, SimpleChanges } from '@angular/core';
import { FormArray, FormGroup } from '@angular/forms';
import { debounce } from 'lodash-es';
import { NsGroupControlComponent } from '../form-controls/ns-group-control/ns-group-control.component';

@Component({
  selector: 'ns-detail-section',
  templateUrl: './ns-detail-section.component.html',
  styleUrls: ['./ns-detail-section.component.scss'],
  providers: []
})
export class NsDetailSectionComponent implements OnInit, AfterViewInit, OnChanges {
  @ContentChildren(NsGroupControlComponent, { descendants: true }) public controlGroupList: QueryList<NsGroupControlComponent>;

  @Input() formArray: FormArray;
  @Input() tabLabelKey = 'id';

  @Input() isTab = true;

  @Output() deleteTab = new EventEmitter<number>();

  selectedIndex = 0;
  selectedFormGroup: FormGroup;
  controlList: NsGroupControlComponent[];

  constructor(private zone: NgZone) {
    this.onTabClicked = debounce(this.onTabClicked, 100);
  }

  ngAfterViewInit(): void {
    this.controlList = this.controlGroupList.toArray();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.formArray) {
      this.formArray = changes.formArray.currentValue;
      this.updateValue();
    }
  }

  ngOnInit(): void {
    this.formArray.valueChanges.subscribe(() => this.updateValue());
  }

  get arrayControls() {
    return this.formArray?.controls || [];
  }

  updateValue() {
    this.selectedIndex = this.selectedIndex > this.formArray?.length - 1 ? (this.formArray?.length > 0 ? this.formArray?.length - 1 : 0) : this.selectedIndex;
    const item = this.formArray?.controls[this.selectedIndex] as FormGroup;
    this.zone.run(() => {
      !item || this.onTabClicked(this.selectedIndex, item);
    });
  }

  onTabClicked(index: number, formGroup: FormGroup) {
    this.selectedFormGroup = formGroup;
    this.selectedIndex = index;

    (this.controlList || []).forEach((controlGroup) => {
      const attribute = controlGroup.controlName;
      controlGroup.setValue(formGroup.value[attribute]);

      controlGroup.input.registerOnChange((val) => {
        const changed = formGroup.get([attribute]).value !== val;

        if (changed) {
          formGroup.patchValue({ [attribute]: val });
        }
      });
    });
  }

  onDeleteTab(index: number) {
    if (this.deleteTab.observers.length) {
      this.deleteTab.emit(index);
    }
  }

}

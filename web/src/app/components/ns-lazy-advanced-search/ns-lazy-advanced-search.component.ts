import { CommonModule } from '@angular/common';
import { AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, HostListener, NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SUGGEST_API_PATH } from '@app/common/constants';
import { SearchResult } from '@app/common/interfaces/components';
import { AppHttpClientService } from '@app/services/util-services/app-http-client.service';

enum SearchOperators {
  EQUALS,
  CONTAINS,
  GREATER_THAN,
  LESS_THAN,
}

interface SearchRow {
  field: string;
  operator: SearchOperators;
  value: string;
  isAdvanced?: boolean;
}

@Component({
  selector: 'ns-lazy-advanced-search',
  templateUrl: './ns-lazy-advanced-search.component.html',
  styleUrls: ['./ns-lazy-advanced-search.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class NsLazyAdvancedSearchComponent implements AfterViewInit {
  isAdvancedSearch: boolean;
  operators: { key: string, value: number }[] = [];

  searchResult: SearchResult[] = [];
  searchRows: SearchRow[] = [];
  searchFields: { key: string, type: string }[] = [];

  @HostListener('input', ['$event'])
  onInputEvent(event) {
    if (event.target && event.target.name) {
      const [field, index] = event.target.name.split(/\-/g);
      if (this.searchRows?.[Number(index)]) {
        this.searchRows[Number(index)][field] = event.target.value;
      }
    }
  }

  constructor(private cdr: ChangeDetectorRef, private http: AppHttpClientService) {
    // Add operators
    Object.keys(SearchOperators).forEach(k => {
      if (isNaN(Number(k))) {
        const key = k.toLocaleLowerCase().replace(/_/g, ' ');
        this.operators.push({
          key,
          value: SearchOperators[k]
        });
      }
    });

    // Add default search field
    this.searchRows.push({
      field: 'code',
      operator: SearchOperators.EQUALS,
      value: '',
      isAdvanced: false
    });

    this.resetSearchFields();
    // @Inject(DATA_MODAL) public data: any
  }

  ngAfterViewInit() {
    this.cdr.detectChanges();
  }

  resetSearchFields() {
    this.searchFields = [
      { key: 'code', type: 'string' },
      { key: 'description', type: 'string' }
    ];
  }

  onAdvancedSearch(value: boolean) {
    this.isAdvancedSearch = value;

    if (this.isAdvancedSearch) {
      // Get advanced fields
      const searchFields = this.http.get(SUGGEST_API_PATH);

      // Fill advanced fields
      this.searchFields = [
        { key: 'a', type: 'string' },
        { key: 'b', type: 'string' },
        { key: 'c', type: 'string' },
        { key: 'd', type: 'string' },
        { key: 'e', type: 'string' },
      ];

      // Add default search field

      if (!(this.searchRows.length > 1)) {
        this.searchRows.push({
          field: this.searchFields?.[0].key,
          operator: SearchOperators.EQUALS,
          value: '',
          isAdvanced: true
        });
      }

      this.cdr.detectChanges();
      return;
    }

    this.resetSearchFields();
  }

  addSearchRow() {
    const row = this.searchRows[this.searchRows.length - 1];
    this.searchRows.push({
      ...row,
      isAdvanced: true
    });
  }

  deleteSearchRow(index: number) {
    this.searchRows.splice(index, 1);
  }

  filterResults() {
    if (!this.isAdvancedSearch) {
      console.log('aca busqueda simple');
    } else {
      console.log('aca busqueda avanzada');
    }
  }

}
@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule
  ],
  declarations: [NsLazyAdvancedSearchComponent]
})
class NsLazyTableSettingsModule { }

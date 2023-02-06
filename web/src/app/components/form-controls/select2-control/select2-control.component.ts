import { Component, ElementRef, OnInit, Input, ViewChild, AfterViewInit } from '@angular/core';
import * as $ from 'jquery';
import '@static/js/plugins/forms/selects/select2.min.js';
import { assign } from 'lodash-es';
import { Bool } from '@app/common/decorators';
@Component({
  selector: 'ns-select2-control',
  template: `
    <select class="form-control" data-fouc #input>
      <option *ngIf="placeholder"></option>
    </select>
  `,
  styles: [
    `[hidden] {
      display: none;
    }`
  ]
})
export class Select2ControlComponent implements OnInit, AfterViewInit {
  @ViewChild('input', { static: true }) selectInputElement: ElementRef;

  /** Allows rendering dropdown options from an array. */
  @Input() data: any[] = [];
  /** The minimum number of results required to display the search box. */
  @Input() minimumResultsForSearch = Infinity;
  /** Supports customization of the container width. */
  @Input() width: number;
  @Input() @Bool search: boolean;
  /** Specifies the placeholder for the control. */
  @Input() placeholder: string;
  /** Minimum number of characters required to start a search. */
  @Input() minimumInputLength: number;
  /** 	Maximum number of characters that may be provided for a search term. */
  @Input() maximumInputLength: number;
  /** Provides support for clearable selections. */
  @Input() @Bool allowClear: boolean;
  // tslint:disable-next-line: max-line-length
  /** This option enables multi-select (pillbox) mode. Select2 will automatically map the value of the multiple HTML attribute to this option during initialization. */
  @Input() @Bool multiple = false;
  /** Used to enable free text responses. */
  @Input() tags: boolean | object[];
  // tslint:disable-next-line: max-line-length
  /** The maximum number of items that may be selected in a multi-select control. If the value of this option is less than 1, the number of selected items will not be limited. */
  @Input() maximumSelectionLength: number;
  @Input() maximumSelectionSize: number;
  @Input() @Bool icons: boolean;
  @Input() containerCssClass: string;
  @Input() containerCss: string;
  /** Controls whether the dropdown is closed after a selection is made. */
  @Input() @Bool closeOnSelect = true;
  /** Implements automatic selection when the dropdown is closed. */
  @Input() @Bool selectOnClose = false;
  /** When set to true, the select control will be disabled. */
  @Input() @Bool disabled = false;
  @Input() adaptContainerCssClass: string;
  @Input() adaptDropdownCssClass: string;
  @Input() dropdownCss: string;
  @Input() dropdownCssClass: string;
  /** 	Allows you to customize placement of the dropdown. */
  @Input() dropdownParent: any;
  /** Handles automatic escaping of content rendered by custom templates. */
  @Input() escapeMarkup: any;
  @Input() sorter: any;
  /** Used to override the built-in DataAdapter. */
  @Input() dataAdapter: any;
  /** Used to override the built-in ResultsAdapter. */
  @Input() resultsAdapter: any;
  /** Used to override the built-in SelectionAdapter. */
  @Input() selectionAdapter: any;
  /** Customizes the way that search results are rendered. */
  @Input() templateResult: any;
  /** Customizes the way that selections are rendered. */
  @Input() templateSelection: any;
  /** Used to override the built-in DropdownAdapter */
  @Input() dropdownAdapter: any;
  @Input() @Bool dropdownAutoWidth = false;
  /** Specify the language used for Select2 messages. */
  @Input() language: string | object;
  /** 	Handles custom search matching. */
  @Input() matcher: any;
  /** 	Allows you to set the theme. */
  @Input() theme: any;
  /** A callback that handles automatic tokenization of free-text entry. */
  @Input() tokenizer: any;
  /** The list of characters that should be used as token separators. */
  @Input() tokenSeparators: any[];
  @Input() dir = 'ltr';

  constructor() { }

  ngOnInit() {
    if (!$().select2) {
      console.warn('Warning - select2.min.js is not loaded.');
      return;
    }

    this.multiple = !!this.tags;

    this.data.push({
      text: 'Mountain Time Zone 00',
      id: 1
    });
    this.data.push({
      text: 'Mountain Time Zone 01',
      id: 2
    });
    this.data.push({
      text: 'Mountain Time Zone 02',
      id: 3
    });
  }

  defineSelectOptionProperty(options: any, property: string, value?: any) {
    if (undefined !== value) {
      assign(options, { [property]: value });
    }
  }

  get select2Options() {
    const options = {};
    if (!this.search) {
      this.defineSelectOptionProperty(options, 'minimumResultsForSearch', this.minimumResultsForSearch);
    }
    this.defineSelectOptionProperty(options, 'width', this.width);
    this.defineSelectOptionProperty(options, 'placeholder', this.placeholder);
    this.defineSelectOptionProperty(options, 'minimumInputLength', this.minimumInputLength);
    this.defineSelectOptionProperty(options, 'allowClear', this.allowClear);
    this.defineSelectOptionProperty(options, 'multiple', this.multiple);

    this.defineSelectOptionProperty(options, 'tags', this.tags);
    // tokenSeparators: [',', ' ']

    this.defineSelectOptionProperty(options, 'maximumInputLength', this.maximumInputLength);
    this.defineSelectOptionProperty(options, 'maximumInputLength', this.maximumInputLength);
    this.defineSelectOptionProperty(options, 'maximumSelectionLength', this.maximumSelectionLength);
    this.defineSelectOptionProperty(options, 'maximumSelectionSize', this.maximumSelectionSize);
    this.defineSelectOptionProperty(options, 'containerCssClass', this.containerCssClass);


    // Format icon
    function iconFormat(item) {
      const originalOption = item.element;
      if (!item.id || !item.icon) { return item.text; }
      const $icon = '<i class="icon-' + item.icon + '"></i>' + item.text;
      return $icon;
    }


    if (this.icons) {
      this.defineSelectOptionProperty(options, 'templateResult', iconFormat);
      this.defineSelectOptionProperty(options, 'templateSelection', iconFormat);
      this.defineSelectOptionProperty(options, 'escapeMarkup', m => m);
    }


    return options;
  }


  ngAfterViewInit() {
    // const data = [
    //   {
    //     id: 0,
    //     text: 'Mountain Time Zone',
    //     children: [
    //       { id: 'AZ', icon: 'wordpress2', text: 'Arizona' },
    //       { id: 'CO', text: 'Colorado' },
    //       { id: 'ID', text: 'Idaho' },
    //       { id: 'WY', text: 'Wyoming' },
    //     ]
    //   },
    //   {
    //     id: 1,
    //     text: 'Central Time Zone',
    //     children: [
    //       { id: 'AL', text: 'Alabama' },
    //       { id: 'AR', text: 'Arkansas' },
    //       { id: 'KS', text: 'Kansas' },
    //       { id: 'KY', text: 'Kentucky' },
    //     ]
    //   },
    // ];

    $(this.selectInputElement.nativeElement).select2({ ...this.select2Options, data: this.data });
  }

}

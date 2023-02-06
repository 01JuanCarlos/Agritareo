import { AfterViewInit, Component, OnInit, TemplateRef } from '@angular/core';
import { BaseReport } from '@app/common/classes/abstract-base-report.class';

@Component({
  selector: 'ns-reporte-layout',
  templateUrl: './ns-reporte-layout.component.html',
  styleUrls: ['./ns-reporte-layout.component.scss']
})
export class NsReporteLayoutComponent implements OnInit, AfterViewInit {
  rightTemplates: TemplateRef<any>[] = [];
  leftTemplates: TemplateRef<any>[] = [];

  visibleLeftPanel: boolean;
  expandedLeftPanel: boolean;
  loadingLeftPanel: boolean;

  constructor() { }

  ngOnInit(): void { }

  ngAfterViewInit(): void { }

  toggleLeftPanel() {
    this.visibleLeftPanel = !this.visibleLeftPanel;
  }

  toggleLoadingLeftPanel() {
    this.loadingLeftPanel = !this.loadingLeftPanel;
  }

  toggleExpandedLeftPanel() {
    this.expandedLeftPanel = !this.expandedLeftPanel;
  }

  activatedLayout(obj: BaseReport) {
    obj.templates?.subscribe(it => {
      this.leftTemplates = [];
      this.rightTemplates = [];
      it.forEach(nsTemplate => {
        const template = nsTemplate.template;
        if (nsTemplate.type === 'rightPanel') {
          this.rightTemplates.push(template);
        }
        if (nsTemplate.type === 'leftPanel') {
          this.leftTemplates.push(template);
        }
      });
    });

    obj.onToggleLeftPanel?.subscribe((status) => {
      if (status !== undefined) {
        this.visibleLeftPanel = status;
      } else {
        this.toggleLeftPanel();
      }
    });

    obj.onLoadingLeftPanel?.subscribe((status) => {
      if (status !== undefined) {
        this.loadingLeftPanel = status;
      } else {
        this.toggleLoadingLeftPanel();
      }
    });
  }
}

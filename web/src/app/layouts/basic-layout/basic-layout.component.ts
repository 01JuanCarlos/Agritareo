import { Component, HostListener, Input, OnInit, ViewChild } from '@angular/core';
import { SpeechComponent } from '@app/components/speech/speech.component';
import { NisiraApp } from '@app/scripts/nisira.app';
import { AppService } from '@app/services/app.service';
import { ToolBarService } from '@app/services/component-services/toolbar.service';
import { FormRequest } from '@app/services/util-services/form.service';

@Component({
  selector: 'app-basic-layout',
  templateUrl: './basic-layout.component.html',
  styleUrls: ['./basic-layout.component.scss']
})
export class BasicLayoutComponent implements OnInit {
  @ViewChild(SpeechComponent) speech: SpeechComponent;

  @Input() contentClass: string;
  @Input() defaultOutlet = true;
  isOnRTL$
  nisiraApp: NisiraApp;
  // TODO: Cambiar por okzervavle

  isLoading = true;
  metaForm: any;
  isNewDocument = false;

  constructor(
    private app: AppService,
    public toolbar: ToolBarService
    ) {
      this.nisiraApp = new NisiraApp();
      this.nisiraApp._transitionsDisabled();
    }

    ngOnInit() {
    this.isOnRTL$ = this.app.isRTL;
    this.nisiraApp.initApp();
    this.nisiraApp._transitionsEnabled();
  }

  get wrapperClass() {
    return {
      'toolbar-top': this.toolbar.has('top')
    };
  }

  onFullScreen() { }
  onModules() { }
  onNotifications() { }
  onUser() { }

  onTabs() { }

  speechToggle(status: boolean) {
    this.speech.toggle();
  }


  @HostListener('window:keyup', ['$event'])
  keyEvent(event: KeyboardEvent) {
    if (event.code === 'Space' && event.ctrlKey === true) {
      this.speech.toggle();
    }
  }


  onActivate(componentRef) {
    this.metaForm = null;
    this.isNewDocument = componentRef?.isNewDocument;
    this.isLoading = componentRef.isLoading;

    componentRef.fs?.formStatus.subscribe(({ status, data }) => {
      if (status === FormRequest.DONE) {
        this.metaForm = data?.meta_form;

        if (this.metaForm) {
          this.metaForm = {
            ...this.metaForm, ...{ id: data.id }
          };
        }
      }

      if (status === FormRequest.LOADING) {
        this.isLoading = data;
      }
    });
  }

}

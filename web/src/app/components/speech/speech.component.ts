import { Component, OnInit, OnDestroy, HostListener, ViewChild, ElementRef, ChangeDetectionStrategy } from '@angular/core';
import { finalize } from 'rxjs/operators';
import { SpeechRecognitionService } from '@app/services/component-services/speechrecognition.service';

@Component({
  selector: 'app-speech',
  templateUrl: './speech.component.html',
  styleUrls: ['./speech.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})

export class SpeechComponent implements OnInit, OnDestroy {
  speechData = '';
  listening: boolean;
  visible = false;

  constructor(
    private el: ElementRef,
    private speechRecognitionService: SpeechRecognitionService
  ) { }

  @ViewChild('spotlight') spotlight: ElementRef; // input DOM element

  ngOnInit() { }

  ngOnDestroy() {
    this.speechRecognitionService.DestroySpeechObject();
  }

  toggle() {
    this.visible = !this.visible;
    if (this.visible) {
      this.showSpotlight();
    } else {
      this.hideSpotlight();
    }
  }

  activateSpeech(): void {
    this.speechRecognitionService.record()
      .pipe(
        finalize(() => {
          console.log('Sequence complete');
        }),
      )
      .subscribe(
        (value: string) => { // listener
          this.speechData = value;
          console.log(value);
        },
        (err: { error: string; }) => { // error
          console.log(err);
          if (err.error === 'no-speech') {
            console.log('no speech');
            this.activateSpeech();
          } else if (err.error === 'aborted') {
            console.log('abortado');
          }
        },
        () => { // completion
          console.log('--complete--');
        });
  }

  microOn() {
    if (this.listening) {
      this.listening = false;
      this.speechRecognitionService.DestroySpeechObject();
    } else {
      this.listening = true;
      this.activateSpeech();
    }
  }

  private showSpotlight() {
    this.visible = true;
    setTimeout(() => {
      this.spotlight.nativeElement.focus();
    });
  }

  private hideSpotlight() {
    this.speechData = '';
    this.visible = false;
    this.listening = false;
    this.speechRecognitionService.DestroySpeechObject();
  }

}

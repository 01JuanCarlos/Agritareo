import { Injectable, NgZone } from '@angular/core';
import { Observable } from 'rxjs';
import { trim } from 'lodash-es';

interface IWindow extends Window {
    webkitSpeechRecognition: any;
    SpeechRecognition: any;
}

// @Injectable()
@Injectable({
    providedIn: 'root'  // <- ADD THIS
})
export class SpeechRecognitionService {
    speechRecognition: any;

    constructor(private zone: NgZone) {
    }

    record(): Observable<string> {

        return new Observable((observer: { next: (arg0: string) => void; error: (arg0: any) => void; complete: () => void; }) => {
            const { webkitSpeechRecognition } = window as any;
            this.speechRecognition = new webkitSpeechRecognition();
            this.speechRecognition.continuous = true;
            this.speechRecognition.lang = 'es-es';
            this.speechRecognition.maxAlternatives = 1;

            this.speechRecognition.onresult = (speech: { results: { [x: string]: any; }; resultIndex: string | number; }) => {
                let term = '';
                if (speech.results) {
                    const result = speech.results[speech.resultIndex];
                    const transcript = result[0].transcript;
                    if (result.isFinal) {
                        if (result[0].confidence < 0.3) {
                            console.log('Unrecognized result - Please try again');
                        } else {
                            term = trim(transcript);
                            console.log('Did you said? -> ' + term + ' , If not then say something else...');
                        }
                    }
                }
                this.zone.run(() => {
                    observer.next(term);
                });
            };

            this.speechRecognition.onerror = (error: any) => {
                observer.error(error);
            };

            this.speechRecognition.onend = () => {
                observer.complete();
            };

            this.speechRecognition.start();
            console.log('Say something - We are listening !!!');
        });
    }

    DestroySpeechObject() {
        if (this.speechRecognition) {
            this.speechRecognition.stop();
        }
    }

}

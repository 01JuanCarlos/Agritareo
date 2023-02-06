import { animate, style, transition, trigger } from '@angular/animations';
import { Component, ElementRef, Input, NgModule, OnInit, ViewChild } from '@angular/core';
import { WSCLIENT, WSSERVER } from '@app/common/constants/websocket.constants';
import { StoreAppState } from '@app/common/interfaces/store';
import { FormControlsModule } from '@app/components/form-controls/form-controls.module';
import { AppWsClientService } from '@app/services/util-services/app-ws-client.service';
import { Store } from '@ngrx/store';
import * as moment from 'moment';
import { CommonModule } from '@angular/common';
import { UserService } from '@app/services/user.service';

interface ChatMessage {
  user_id: number;
  message: string;
  time: number;
  id: number;
}

interface ChatUser {
  user_id: number;
  username: string;
  photo: string;
}

interface ChatRoom {
  users: ChatUser[];
  messages: ChatMessage[];
  roomId: string;
  max_messages: number;
  chats: ChatMessage[];
}

@Component({
  selector: 'ns-chat',
  templateUrl: './ns-chat.component.html',
  styleUrls: ['./ns-chat.component.scss'],
  animations: [
    trigger('slideInOut', [
      transition(':enter', [
        style({ transform: 'translateX(100%)' }),
        animate('150ms ease-in', style({ transform: 'translateX(0%)' }))
      ]),
      transition(':leave', [
        animate('150ms ease-in', style({ transform: 'translateX(100%)' }))
      ])
    ])
  ]
  // changeDetection: ChangeDetectionStrategy.OnPush
})
export class NsChatComponent implements OnInit {
  @ViewChild('chatlist', { static: true }) chatListRef: ElementRef;
  @Input() show = false;

  private newMessageAudio = new Audio('/static/audio/chat-notify.ogg');
  private currentUserId = 5;
  private currentUserAlias = 'Guest';

  room: ChatRoom = null;
  message = '';
  public openedChat = false;
  public newchatv = false;

  public userList = [];
  public userListF = [];

  public chats = [];
  //
  loading = false;

  constructor(
    private wss: AppWsClientService,
    private store: Store<StoreAppState>,
    private user: UserService
  ) {
    // Cargar el audio para los mensajes nuevos.
    this.newMessageAudio.load();
  }


  startChat() {
    console.log('Abriendo chat...');
    this.openedChat = !this.openedChat;
  }

  closeChat() {
    console.log('Cerrando chat...');
    this.openedChat = !this.openedChat;
  }

  ngOnInit() {
    this.store.select('app', 'user_configuration').subscribe(user => {
      this.currentUserId = user.user_id;
      this.currentUserAlias = user.alias;

      if (this.currentUserId) {
        this.wss.get(WSCLIENT.CHAT_ROOM, user).subscribe(data => {
          this.room = data || {};
          this.chats = this.room.chats ?? [];
        });
      }
    });

    // this.wss.on(WSSERVER.CHAT_MESSAGE).subscribe((message: ChatMessage) => {
    //   if (this.room && message) {

    //     if (this.room.messages.length > this.room.max_messages) {
    //       this.room.messages.shift();
    //     }

    //     this.room.messages.push(message);

    //     if (!this.isOwnMessage(message)) {
    //       this.newMessageAudio.currentTime = 0;
    //       this.newMessageAudio.play();
    //     }

    //     setTimeout(this.scrollToBottom.bind(this), 150);
    //   }
    // });
  }

  newChat() {
    // Aca llamada asincrona a todos los usuarios dentro de una copañía o quizá empresa
    let users = [
      { photo: null, name: 'Walter Leturia' },
      { photo: null, name: 'Alex Paredes' },
      { photo: null, name: 'Gregorio Recalde' },
      { photo: null, name: 'Eduardo Cordova' }
    ];

    users = users.sort((a, b) => {
      if (a.name < b.name) { return -1; }
      if (a.name > b.name) { return 1; }
      return 0;
    });

    this.userList = users;
    this.userListF = users;
  }


  filterList(txt: string) {
    if (txt) {
      this.userListF = this.userList.filter(a => a.name.toLowerCase().includes(txt.toLowerCase()));
    } else {
      this.userListF = this.userList;
    }
  }

  scrollToBottom() {
    const message = this.room.messages[this.room.messages.length - 1];
    if (message) {
      const el: HTMLLIElement = this.chatListRef.nativeElement.querySelector(`#chat-${message.id}`);
      if (el && el.scrollIntoView) {
        el.scrollIntoView({ behavior: 'smooth', block: 'end', inline: 'nearest' });
      }
    }
  }

  isOwnMessage(chat: ChatMessage) {
    return this.currentUserId === chat.user_id;
  }

  trackByFn(index: number, chat: ChatMessage) {
    return index + chat.id;
  }

  parseTime(timeAgo: any) {
    return moment(new Date(timeAgo)).fromNow();
  }

  SendMessage(text: string) {
    if (!this.message.trim().length) {
      return;
    }

    this.wss.send(WSCLIENT.CHAT_MESSAGE, {
      message: this.message,
      time: Date.now()
    });

    this.message = '';
  }

  onWriteMessage() {
    console.log('Escribiendo mensaje??');
  }
}


@NgModule({
  imports: [
    CommonModule,
    FormControlsModule
  ],
  declarations: [NsChatComponent],
  providers: []
})
class NsChatModule { }

import { Component } from '@angular/core';
import { TrestleComponent} from '../trestle/trestle.component';
import {MessageFeedComponent} from '../message-feed/message-feed.component';

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [TrestleComponent, MessageFeedComponent],
  templateUrl: './chat.component.html',
  styleUrl: './chat.component.less'
})
export class ChatComponent {

}

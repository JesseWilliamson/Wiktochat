import { Component } from '@angular/core';
import {MessageComponent} from '../chat-message/message.component';

@Component({
  selector: 'app-message-feed',
  standalone: true,
  imports: [
    MessageComponent
  ],
  templateUrl: './message-feed.component.html',
  styleUrl: './message-feed.component.less'
})
export class MessageFeedComponent {

}

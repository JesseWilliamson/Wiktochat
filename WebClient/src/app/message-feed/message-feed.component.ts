import { Component, effect } from '@angular/core';
import { MessageComponent } from '../chat-message/message.component';
import { ChatMessageHandlerService } from '../chat-message-handler.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-message-feed',
  standalone: true,
  imports: [MessageComponent, CommonModule],
  templateUrl: './message-feed.component.html',
  styleUrl: './message-feed.component.less',
})
export class MessageFeedComponent {
  constructor(protected chatService: ChatMessageHandlerService) {
    //TODO: Stick to bottom of messages list
  }
}

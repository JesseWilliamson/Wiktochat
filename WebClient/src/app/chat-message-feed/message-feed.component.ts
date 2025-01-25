import { Component } from '@angular/core';
import { MessageComponent } from './chat-message/message.component';
import { CommonModule } from '@angular/common';
import { ChatMessageHandlerService } from '@app/services/chat-message-handler.service';

@Component({
  selector: 'app-message-feed',
  standalone: true,
  imports: [MessageComponent, CommonModule],
  templateUrl: './message-feed.component.html',
  styleUrl: './message-feed.component.less',
})
export class MessageFeedComponent {
  constructor(protected chatService: ChatMessageHandlerService) {}
}

import { Component } from '@angular/core';
import { ChatMessageComponent } from '@app/components/chat-message/chat-message.component';
import { CommonModule } from '@angular/common';
import { ChatMessageHandlerService } from '@app/services/chat-message-handler.service';

@Component({
  selector: 'app-chat-message-feed',
  standalone: true,
  imports: [ChatMessageComponent, CommonModule],
  templateUrl: './chat-message-feed.component.html',
  styleUrl: './chat-message-feed.component.less',
})
export class ChatMessageFeedComponent {
  constructor(protected chatService: ChatMessageHandlerService) {}
}

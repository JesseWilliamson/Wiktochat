import { Component } from '@angular/core';
import { EaselComponent } from '../easel/easel.component';
import { MessageFeedComponent } from '../message-feed/message-feed.component';
import { ChatMessageHandlerService } from '../chat-message-handler.service';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [EaselComponent, MessageFeedComponent],
  templateUrl: './chat.component.html',
  styleUrl: './chat.component.less',
})
export class ChatComponent {
  constructor(
    private chatService: ChatMessageHandlerService,
    private route: ActivatedRoute,
  ) {
    // Get roomId from route parameters
    const roomId = this.route.snapshot.paramMap.get('roomId');
    console.log("roomId ", roomId);
    if (roomId) {
      try {
        this.chatService.joinRoom(roomId);
        this.chatService.subscribeToRoom(roomId);
      } catch (error) {
        console.error('Failed to subscribe to room:', error);
      }
    }
  }
}

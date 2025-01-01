import { Component, OnInit } from '@angular/core';
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
export class ChatComponent implements OnInit {
  constructor(
    private chatService: ChatMessageHandlerService,
    private route: ActivatedRoute,
  ) {}

  ngOnInit() {
    this.initializeRoom();
  }

  private async initializeRoom() {
    const roomId = this.route.snapshot.paramMap.get('roomId');
    console.log("roomId ", roomId);

    if (roomId) {
      try {
        // Wait for connection before proceeding
        await this.chatService.awaitConnection();

        this.chatService.joinRoom(roomId);
        this.chatService.subscribeToRoom(roomId);
      } catch (error) {
        console.error('Failed to connect to room:', error);
      }
    }
  }
}

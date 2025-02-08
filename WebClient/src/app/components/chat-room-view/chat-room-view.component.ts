import { Component, OnInit } from '@angular/core';
import { EaselComponent } from '@app/components/easel/easel.component';
import { ChatMessageFeedComponent } from '@app/components/chat-message-feed/chat-message-feed.component';
import { ChatMessageHandlerService } from '@app/services/chat-message-handler.service';
import { ActivatedRoute } from '@angular/router';
import { ChatMessageFeedScrollerComponent } from '../chat-message-feed-scroller/chat-message-feed-scroller.component';

@Component({
  selector: 'app-chat-room-view',
  standalone: true,
  imports: [EaselComponent, ChatMessageFeedComponent, ChatMessageFeedScrollerComponent],
  templateUrl: './chat-room-view.component.html',
  styleUrl: './chat-room-view.component.less',
})
export class ChatRoomViewComponent implements OnInit {
  constructor(
    private readonly chatService: ChatMessageHandlerService,
    private readonly route: ActivatedRoute,
  ) {}

  ngOnInit() {
    this.initializeRoom();
  }

  private async initializeRoom() {
    const roomId = this.route.snapshot.paramMap.get('roomId');

    if (roomId) {
      try {
        this.chatService.joinRoom(roomId);
      } catch (error) {
        console.error('Failed to connect to room:', error);
      }
    }
  }
}

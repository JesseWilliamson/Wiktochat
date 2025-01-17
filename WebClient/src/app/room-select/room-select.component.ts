import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ChatMessageHandlerService } from '../chat-message-handler.service';

@Component({
  selector: 'app-room-select',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './room-select.component.html',
  styleUrl: './room-select.component.less',
})
export class RoomSelectComponent {
  protected roomId = '';

  constructor(
    private router: Router,
    private chatService: ChatMessageHandlerService,
  ) {}

  public async createRoom() {
    this.chatService.createRoom((roomId) => {
      if (roomId) {
        this.router.navigate(['/chat', roomId]);
      }
    });
  }

  public async joinRoom() {
    this.chatService.joinRoom(this.roomId, () => {
      this.router.navigate(['/chat', this.roomId]);
    });
  }
}

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
  protected roomKey = '';

  constructor(
    private router: Router,
    private chatService: ChatMessageHandlerService,
  ) {}

  public async createRoom() {
    this.chatService.httpCreateRoom((roomid) => {
      if (roomid) {
        this.router.navigate(['/chat', roomid]);
      }
    });
    // const response = await this.chatService.createRoom();
    // console.log(response);
    // if (response.success) {
    //   await this.router.navigate(['/chat', response.roomId]);
    // }
  }

  public async joinRoom() {
    const response = await this.chatService.joinRoom(this.roomKey);
    console.log(response);
    if (response.success) {
      await this.router.navigate(['/chat', this.roomKey]);
    }
  }
}

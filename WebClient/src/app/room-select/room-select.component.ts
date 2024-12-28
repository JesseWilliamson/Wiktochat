import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MessageHandlerService } from '../message-handler.service';

@Component({
  selector: 'app-room-select',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './room-select.component.html',
  styleUrl: './room-select.component.less',
})
export class RoomSelectComponent {
  public roomKey = '';

  constructor(
    private router: Router,
    private chatService: MessageHandlerService,
  ) {}

  public async createRoom() {
    const response = await this.chatService.createRoom();
    console.log(response);
    if (response.success) {
      await this.router.navigate(['/chat', response.roomId]);
    }
  }

  public async joinRoom() {
    const response = await this.chatService.joinRoom(this.roomKey);
    console.log(response);
    if (response.success) {
      await this.router.navigate(['/chat', this.roomKey]);
    }
  }
}

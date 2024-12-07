import { Component, OnDestroy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

@Component({
  selector: 'app-room-select',
  standalone: true,
  imports: [
    FormsModule
  ],
  templateUrl: './room-select.component.html',
  styleUrl: './room-select.component.less'
})
export class RoomSelectComponent implements OnDestroy {
  private readonly stompClient: Client;
  public roomKey: string = "";
  public requestRoomKey: string = "";
  public username: string = "";
  public message: string = "";

  constructor() {
    this.stompClient = new Client({
      webSocketFactory: () => new SockJS('http://localhost:8080/ws'),
      onConnect: () => {
        console.log('Connected to WebSocket');
      },
    });
    this.stompClient.activate();
  }

  public getRoom() {
    console.log("Nothing here yet")
  }

  public requestRoom() {
    if (!this.requestRoomKey || !this.username) {
      console.error('Room key and username are required');
      return;
    }

    this.stompClient.publish({
      destination: `/rooms/${this.requestRoomKey}/join`,
      body: JSON.stringify({ username: this.username })
    });

    // Subscribe to room messages
    this.stompClient.subscribe(`/rooms/${this.requestRoomKey}/messages`, (message) => {
      console.log('Received:', JSON.parse(message.body));
    });
  }

  public sendMessage() {
    if (!this.message) {
      console.error('Message cannot be empty');
      return;
    }

    this.stompClient.publish({
      destination: `/rooms/${this.requestRoomKey}/messages`,
      body: this.message
    });

    this.message = "";
  }

  ngOnDestroy() {
    if (this.stompClient) {
      this.stompClient.deactivate();
    }
  }
}


  import { Component, OnDestroy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Client } from '@stomp/stompjs';
import { Router } from '@angular/router';
import { SessionService } from '../session-service.service';

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

  constructor(
    private router: Router,
    private sessionService: SessionService
  ) {
    this.stompClient = new Client({
      webSocketFactory: () => new SockJS('http://localhost:8080/ws'),
      connectHeaders: {
        sessionId: this.sessionService.getSessionId()
      },
      onConnect: () => {
        console.log('Connected to WebSocket');
      },
    });
    this.stompClient.activate();
  }

  public createRoom() {
    console.log("Requesting to create room");

    const subscription = this.stompClient.subscribe('/user/queue/responses', (message) => {
      const response = JSON.parse(message.body);
      console.log("Got a response!", response);
      if (response.success) {
        console.log("Successfully created room");
        this.router.navigate(['/trestle', response.roomId]);
      } else {
        console.log("Failed to create room");
        alert(response.message);
      }
      subscription.unsubscribe();
    });

    this.stompClient.publish({
      destination: `/app/rooms/create`,
    })
  }

  public joinRoom() {
    console.log("Requesting to join room " + this.roomKey);

    // Subscribe to user-specific queue
    const subscription = this.stompClient.subscribe('/user/queue/responses', (message) => {
      const response = JSON.parse(message.body);
      console.log("Got a response!", response);
      if (response.success) {
        console.log("Successfully joined room");
        this.router.navigate(['/trestle', this.roomKey]);
      } else {
        console.log("Failed to join room");
        alert(response.message);
      }
      subscription.unsubscribe();
    });

    // Then send the join request
    this.stompClient.publish({
      destination: `/app/rooms/${this.roomKey}/join`
    });
  }

  ngOnDestroy() {
    if (this.stompClient) {
      this.stompClient.deactivate();
    }
  }
}


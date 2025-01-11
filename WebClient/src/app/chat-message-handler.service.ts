import { Injectable, signal, effect, OnInit } from '@angular/core';
import { Client, StompSubscription } from '@stomp/stompjs';
import { generateUUID } from './libs/utils';
import {
  ChatMessage,
  CreateRoomResponse,
} from './models/types';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class ChatMessageHandlerService {
  private _chatMessages = signal<ChatMessage[]>([]);
  public chatMessages = this._chatMessages.asReadonly();
  private _isConnected = signal<boolean>(false);
  public isConnected = this._isConnected.asReadonly();
  private _username = signal<string>('');
  public username = this._username.asReadonly();
  private _roomId = signal<string>('');
  public roomId = this._roomId.asReadonly();
  private sessionId = '';
  private messageSubscription: StompSubscription | undefined;
  private _isJoiningRoom = signal<boolean>(false);
  private _isCreatingRoom = signal<boolean>(false);
  public isJoiningRoom = this._isJoiningRoom.asReadonly();
  public isCreatingRoom = this._isCreatingRoom.asReadonly();

  constructor(private http: HttpClient) {
    this.sessionId = generateUUID();
    console.log('sessionId', this.sessionId);
    effect(() => {
      console.log(this.chatMessages());
    });
  }

  public getServerSentEvent(url: string): EventSource {
    return new EventSource(url, { withCredentials: true });
  }

  public joinRoom(
    roomKey: string,
    onSuccess?: () => void,
  ): void {
    if (this._isJoiningRoom()) {
      console.warn('Already joining a room');
      return;
    }

    console.log('Joining room:', roomKey);
    this._isJoiningRoom.set(true);

    const eventSource = this.getServerSentEvent('http://localhost:8080/query?query=test');

    eventSource.addEventListener('message', (event) => {
      console.log('Event Source Message:', event.data);
    });

    // Listen for the close event
    eventSource.addEventListener('close', (event) => {
      console.log('Server requested connection close', event);
      eventSource.close();
    });

    eventSource.addEventListener('error', (error) => {
      // Only log as error if we haven't received a close event
      if (!eventSource.readyState) {
        console.error('EventSource error:', error);
      } else {
        console.log('EventSource closed');
      }
      eventSource.close();
      this._isJoiningRoom.set(false);
    });

    eventSource.addEventListener('open', () => {
      console.log('EventSource connection opened');
    });

    this.http.post(`/rooms/${roomKey}/members`, this.sessionId).subscribe({
      next: () => {
        if (onSuccess) {
          onSuccess();
        }
        this._roomId.set(roomKey);
        this._isJoiningRoom.set(false);
      },
      error: (error) => {
        console.error('Error joining room:', error);
        eventSource.close();
        this._isJoiningRoom.set(false);
      },
    });
  }

  public createRoom(onSuccess?: (roomId: string | null) => void): void {
    // Return early if already creating a room
    if (this._isCreatingRoom()) {
      console.warn('Already creating a room');
      return;
    }

    this._isCreatingRoom.set(true);

    this.http.post<CreateRoomResponse>('/rooms', this.sessionId).subscribe({
      next: (response) => {
        console.log('Room created:', response.roomId);
        if (onSuccess) {
          this._roomId.set(response.roomId ?? '');
          onSuccess(response.roomId || null);
        }
        this._isCreatingRoom.set(false);
      },
      error: (error) => {
        console.error('Error creating room:', error);
        this._isCreatingRoom.set(false);
      },
    });
  }

  public sendGridMessage(
    gridMessage: string[][],
  ): void {
    const payload = {
      grid: gridMessage,
      senderSessionId: this.sessionId,
      timeStamp: new Date()
    };

    this.http.post(`/rooms/${this.roomId()}/messages`, payload).subscribe({
      next: () => {
        console.log('Grid message sent successfully');
      },
      error: (error) => {
        console.error('Error sending message:', error);
      },
    });
  }

  public subscribeToRoom(roomKey: string): void {}

  // sendGrid(grid: string[][]): void {
  //   if (!this.stompClient || !this.stompClient.connected) {
  //     console.error('Not connected to WebSocket');
  //     return;
  //   }

  //   const gridMessage: GridMessage = {
  //     grid: grid,
  //     senderSessionId: this.sessionId,
  //     timeStamp: new Date(),
  //   };

  //   console.log('Sending grid', gridMessage);

  //   const roomId = this.roomId();
  //   if (roomId) {
  //     this.stompClient.publish({
  //       destination: `/rooms/${roomId}/messages`,
  //       body: JSON.stringify(gridMessage)
  //     });
  //   } else {
  //     console.error('Not connected to a room');
  //   }
  // }

  // public sendMessage(roomId: string, message: string): void {
  //   if (this.stompClient && this.stompClient.connected) {
  //     this.stompClient.publish({
  //       destination: `/rooms/${roomId}/messages`,
  //       body: message
  //     });
  //   } else {
  //     console.error('Not connected to WebSocket');
  //   }
  // }
}

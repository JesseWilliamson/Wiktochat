import { Injectable, signal, effect } from '@angular/core';
import { StompSubscription } from '@stomp/stompjs';
import { generateUUID } from './libs/utils';
import {
  CreateRoomResponse,
  GridMessage,
  OutGoingGridMessage,
} from './models/types';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class ChatMessageHandlerService {
  private _chatMessages = signal<GridMessage[]>([]);
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

  public joinRoom(roomKey: string, onSuccess?: () => void): void {
    if (this._isJoiningRoom()) {
      console.warn('Already joining a room');
      return;
    }

    console.log('Joining room:', roomKey);
    this._isJoiningRoom.set(true);

    this.http.post(`/rooms/${roomKey}/members`, this.sessionId).subscribe({
      next: () => {
        const eventSource = this.getServerSentEvent(
          `/rooms/${roomKey}/message-stream?sessionId=${this.sessionId}`,
        );

        eventSource.addEventListener('message', (event) => {
          const message = JSON.parse(event.data) as GridMessage;
          this._chatMessages.update((messages) => [message, ...messages]);
        });

        eventSource.addEventListener('error', (error) => {
          console.error('EventSource error:', error);
          eventSource.close();
          this._isJoiningRoom.set(false);
        });

        if (onSuccess) {
          onSuccess();
        }
        this._roomId.set(roomKey);
        this._isJoiningRoom.set(false);
      },
      error: (error) => {
        console.error('Error joining room:', error);
        this._isJoiningRoom.set(false);
      },
    });
  }

  public createRoom(onSuccess?: (roomId: string | null) => void): void {
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

  public sendGridMessage(grid: string[][]): void {
    const payload = {
      grid: grid,
      senderSessionId: this.sessionId,
      timeStamp: new Date(),
    } as OutGoingGridMessage;

    this.http.post(`/rooms/${this.roomId()}/messages`, payload).subscribe({
      next: () => {
        console.log('Grid message sent successfully');
      },
      error: (error) => {
        console.error('Error sending message:', error);
      },
    });
  }

  // public subscribeToRoom(roomKey: string): void {}

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

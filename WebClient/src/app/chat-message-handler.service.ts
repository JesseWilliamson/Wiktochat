import { Injectable, signal, effect } from '@angular/core';
import { Client, StompSubscription } from '@stomp/stompjs';
import {
  ChatMessage,
  CreateRoomResponse,
  JoinRoomRequest
} from './models/message.types';
import { HttpClient } from '@angular/common/http';
import { delay } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ChatMessageHandlerService {
  private stompClient: Client;
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
    this.stompClient = new Client({
      brokerURL: 'http://localhost:8080/ws',
      onConnect: (header) => {
        console.log('Connected to WebSocket');
        this._isConnected.set(true);
        console.log('got header', header.headers['user-name']);
        this.sessionId = header.headers['user-name'];
      },
      onDisconnect: () => {
        this._isConnected.set(false);
      },
      debug: function (str) {
        console.log(str);
      },
    });
    this.stompClient.activate();
    effect(() => {
      console.log(this.chatMessages());
    });
  }

  // TODO: I'm not sure this polling like this is the best way to handle waiting for connection
  public awaitConnection(): Promise<boolean> {
    return new Promise((resolve) => {
      const checkConnection = () => {
        if (this._isConnected()) {
          resolve(true);
        } else {
          // TODO: Make a config file for these kinds of values
          setTimeout(checkConnection, 100);
        }
      };
      checkConnection();
    });
  }

  // public joinRoom(roomKey: string): Promise<JoinRoomResponse> {
  //   // Return early if already joining a room
  //   if (this._isJoiningRoom()) {
  //     return Promise.reject(new Error('Already joining a room'));
  //   }
  //
  //   this._isJoiningRoom.set(true);
  //
  //   return new Promise((resolve, reject) => {
  //     const subscription = this.stompClient.subscribe(
  //       '/user/queue/responses',
  //       (message) => {
  //         const response = JSON.parse(message.body);
  //         subscription.unsubscribe();
  //         this._isJoiningRoom.set(false);
  //         resolve(response);
  //       },
  //     );
  //
  //     this.stompClient.publish({
  //       destination: `/app/rooms/${roomKey}/join`,
  //     });
  //   }).catch((error) => {
  //     this._isJoiningRoom.set(false);
  //     throw error;
  //   });
  // }

  // public httpJoinRoom(
  //   roomKey: string,
  //   onSuccess?: (response: JoinRoomResponse) => void,
  // ): void {
  //   const body: JoinRoomRequest = {
  //     sessionId: this.sessionId,
  //     roomId: roomKey
  //   };
  //   this.http.post(`/rooms/${roomKey}/members`, body).subscribe({
  //     next: (response) => {
  //       if (response.success) {
  //         console.log('Joined room:', response);
  //         if (onSuccess) {
  //           onSuccess(response);
  //         }
  //       } else {
  //         console.error('Failed to join room');
  //       }
  //     },
  //     error: (error) => {
  //       console.error('Error joining room:', error);
  //     },
  //   });
  // }

  public createRoom(onSuccess?: (roomId: string | null) => void): void {
    // Return early if already creating a room
    if (this._isCreatingRoom()) {
      console.warn('Already creating a room');
      return;
    }

    this._isCreatingRoom.set(true);

    setTimeout(() => {
      this.http.post<CreateRoomResponse>('/rooms', this.sessionId).subscribe({
        next: (response) => {
          console.log('Room created:', response.roomId);
          if (onSuccess) {
            onSuccess(response.roomId || null);
          }
          this._isCreatingRoom.set(false);
        },
        error: (error) => {
          console.error('Error creating room:', error);
          this._isCreatingRoom.set(false);
        },
      });
    }, 1000)


  }

  public subscribeToUser(): void {
    this.messageSubscription = this.stompClient.subscribe(
      '/user/queue/responses',
      (message) => {
        const response = JSON.parse(message.body);
        console.log('Catchall User Queue: ', response);
      },
    );
    console.log('subscribed to user');
  }

  public subscribeToRoom(roomKey: string): void {
    console.log('Subscribed to Room', roomKey);
    this.messageSubscription = this.stompClient.subscribe(
      `/rooms/${roomKey}/messages`,
      (message) => {
        const messageContent = JSON.parse(message.body);
        console.log('Catchall', messageContent);
        const chatMessage = messageContent as ChatMessage;
        this._chatMessages.update((messages) => [...messages, chatMessage]);
      },
    );
  }
}

import { Injectable, signal, effect } from '@angular/core';
import { Client, StompSubscription } from '@stomp/stompjs';
import {
  ChatMessage,
  CreateRoomResponse,
  GridMessage,
} from './models/types';
import { HttpClient } from '@angular/common/http';
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

  public joinRoom(
    roomKey: string,
    onSuccess?: () => void,
  ): void {
    this.http.post(`/rooms/${roomKey}/members`, this.sessionId).subscribe({
      next: () => {
        if (onSuccess) {
          onSuccess();
        }
      },
      error: (error) => {
        console.error('Error joining room:', error);
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

  sendGrid(grid: string[][]): void {
    if (!this.stompClient || !this.stompClient.connected) {
      console.error('Not connected to WebSocket');
      return;
    }

    const gridMessage: GridMessage = {
      roomId: this.roomId(),
      grid,
      timestamp: new Date()
    };

    this.stompClient.publish({
      destination: `/app/rooms/${this.roomId()}/grid`,
      body: JSON.stringify(gridMessage)
    });
  }
}

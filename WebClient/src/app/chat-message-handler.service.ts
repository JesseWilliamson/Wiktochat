import { Injectable, signal } from '@angular/core';
import {Client, StompSubscription} from '@stomp/stompjs';
import {
  ChatMessage,
  RoomState,
  JoinRoomResponse,
  CreateRoomResponse,
} from './models/message.types';
import SockJS from 'sockjs-client';

@Injectable({
  providedIn: 'root',
})
export class ChatMessageHandlerService {
  private stompClient: Client;
  private _chatMessages = signal<ChatMessage[]>([]);
  private _isConnected = signal<boolean>(false);
  public isConnected = this._isConnected.asReadonly();
  private _username = signal<string>("");
  public username = this._username.asReadonly();
  private _roomId = signal<string>("");
  public roomId = this._roomId.asReadonly();
  private messageSubscription: StompSubscription | undefined;

  constructor() {
    this.stompClient = new Client({
      webSocketFactory: () => new SockJS('http://localhost:8080/ws'),
      onConnect: () => {
        console.log('Connected to WebSocket');
        this._isConnected.set(true);
      },
      onDisconnect: () => {
        this._isConnected.set(false);
      },
    });
    this.stompClient.activate();
  }

  public createRoom(): Promise<CreateRoomResponse> {
    return new Promise((resolve) => {
      const subscription = this.stompClient.subscribe(
        '/user/queue/responses',
        (message) => {
          const response = JSON.parse(message.body) as CreateRoomResponse;
          subscription.unsubscribe();
          resolve(response);
        },
      );
      this.stompClient.publish({
        destination: `/app/rooms/create`,
      });
    });
  }

  public joinRoom(roomKey: string): Promise<JoinRoomResponse> {
    return new Promise((resolve) => {
      const subscription = this.stompClient.subscribe(
        '/user/queue/responses',
        (message) => {
          const response = JSON.parse(message.body);
          subscription.unsubscribe();
          resolve(response);
        },
      );
      this.stompClient.publish({
        destination: `/app/rooms/${roomKey}/join`,
      });
    });
  }

  public subscribeToRoom(roomKey: string): void {
    console.log('Subscribed to Room', roomKey);
    this.messageSubscription = this.stompClient.subscribe(
      `/rooms/${roomKey}/messages`,
      (message) => {
        const messageContent = JSON.parse(message.body);
        console.log("Catchall", messageContent);
        // const chatMessage = message.body as ChatMessage;
        // this.chatMessages.update(
        //   (chatMessages) => {
        //     chatMessages.push(chatMessage);
        //     return chatMessages;
        //   }
        // )
      }
    )
  }
}

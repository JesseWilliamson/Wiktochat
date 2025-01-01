import { Injectable, signal, effect } from '@angular/core';
import {Client, StompSubscription} from '@stomp/stompjs';
import {
  ChatMessage,
  JoinRoomResponse,
  CreateRoomResponse,
} from './models/message.types';
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
  private _username = signal<string>("");
  public username = this._username.asReadonly();
  private _roomId = signal<string>("");
  public roomId = this._roomId.asReadonly();
  private sessionId = "";
  private messageSubscription: StompSubscription | undefined;

  constructor(
    private http: HttpClient,
  ) {
    this.stompClient = new Client({
      brokerURL: 'http://localhost:8080/ws',
      onConnect: (header) => {
        console.log('Connected to WebSocket');
        this._isConnected.set(true);
        console.log('got header', header.headers["user-name"]);
        this.sessionId = header.headers["user-name"];
      },
      onDisconnect: () => {
        this._isConnected.set(false);
      },
      debug: function(str) {
        console.log(str);
      }
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
      console.log('published')
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

  public httpCreateRoom(onSuccess?: (roomId: string | null) => void): void {
    this.http.post<CreateRoomResponse>('/rooms', this.sessionId).subscribe({
        next: (response) => {
            if (response.success) {
                console.log("Room created:", response.roomId);
                if (onSuccess) {
                    onSuccess(response.roomId || null);
                }
            } else {
                console.error("Failed to create room");
            }
        },
        error: (error) => {
            console.error("Error creating room:", error);
        }
    });
  }

  public subscribeToUser(): void {
    this.messageSubscription = this.stompClient.subscribe(
      '/user/queue/responses',
      (message) => {
        const response = JSON.parse(message.body);
        console.log("Catchall User Queue: ", response);
      }
    );
    console.log('subscribed to user')
  }

  public subscribeToRoom(roomKey: string): void {
    console.log('Subscribed to Room', roomKey);
    this.messageSubscription = this.stompClient.subscribe(
      `/rooms/${roomKey}/messages`,
      (message) => {
        const messageContent = JSON.parse(message.body);
        console.log("Catchall", messageContent);
        const chatMessage = messageContent as ChatMessage;
        this._chatMessages.update(messages => [...messages, chatMessage]);
      }
    );
  }
}

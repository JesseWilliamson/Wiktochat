import { Injectable, signal, computed } from '@angular/core';
import {Client} from '@stomp/stompjs';
import { ChatMessage, RoomState, JoinRoomResponse, CreateRoomResponse} from './models/message.types';
import SockJS from 'sockjs-client';

@Injectable({
  providedIn: 'root'
})
export class MessageHandlerService {
  private stompClient: Client;
  private messages = signal<ChatMessage[]>([]);
  private roomState = signal<RoomState>({
    connected: false
  });

  public readonly currentRoom = computed(() => this.roomState().currentRoom);
  public readonly isConnected = computed(() => this.roomState().connected);

  constructor() {
    this.stompClient = new Client({
      webSocketFactory: () => new SockJS('http://localhost:8080/ws'),
      onConnect: () => {
        console.log('Connected to WebSocket');
        this.roomState.update(state => ({
          ...state,
          connected: true
        }));
      },
      onDisconnect: () => {
        this.roomState.update(state => ({
          ...state,
          connected: false
        }));
      }
    });
    this.stompClient.activate();
  }

  public createRoom(): Promise<CreateRoomResponse> {
    return new Promise((resolve) => {
      const subscription = this.stompClient.subscribe('/user/queue/responses', (message) => {
        const response = JSON.parse(message.body) as CreateRoomResponse;
        subscription.unsubscribe();
        resolve(response);
      });

      this.stompClient.publish({
        destination: `/app/rooms/create`,
      });
    });
  }

  public joinRoom(roomKey: string): Promise<JoinRoomResponse> {
    return new Promise((resolve) => {
      const subscription = this.stompClient.subscribe('/user/queue/responses', (message) => {
        const response = JSON.parse(message.body);
        subscription.unsubscribe();
        resolve(response);
      });

      this.stompClient.publish({
        destination: `/app/rooms/${roomKey}/join`,
      })
    })
  }
}

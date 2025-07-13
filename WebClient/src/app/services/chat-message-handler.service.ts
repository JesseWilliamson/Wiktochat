import { Injectable, signal, OnDestroy } from '@angular/core';
import { generateUUID } from '@app/libs/utils';
import {
  CreateRoomResponse,
  GridMessage,
  OutGoingGridMessage,
} from '@app/components/models/types';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { webSocket, WebSocketSubject } from 'rxjs/webSocket';
// Using dynamic import to avoid TypeScript module resolution issues
const environment = {
  ws: {
    url: (roomId: string) => {
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      return `${protocol}//${window.location.host}/ws/chat/${roomId}`;
    }
  }
};
import { Observable, Subject, throwError } from 'rxjs';
import { catchError, tap, switchAll, retryWhen, delay } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class ChatMessageHandlerService implements OnDestroy {
  private readonly _chatMessages = signal<GridMessage[]>([]);
  public readonly chatMessages = this._chatMessages.asReadonly();
  private readonly roomId = signal<string>('');
  private readonly sessionId = generateUUID();
  private readonly isJoiningRoom = signal<boolean>(false);
  private readonly isCreatingRoom = signal<boolean>(false);
  
  // WebSocket related properties
  private socket$: WebSocketSubject<GridMessage> | null = null;
  private messagesSubject = new Subject<Observable<GridMessage>>();
  public messages$ = this.messagesSubject.pipe(switchAll(), catchError(e => throwError(e)));
  
  // Reconnection handling
  private reconnectAttempts = 0;
  private readonly MAX_RECONNECT_ATTEMPTS = 5;
  private readonly RECONNECT_INTERVAL = 5000; // 5 seconds
  private reconnectTimeout: ReturnType<typeof setTimeout> | null = null;

  constructor(
    private readonly http: HttpClient
  ) {}

  ngOnDestroy() {
    this.disconnect();
  }

  private connect(roomId: string) {
    if (this.socket$ && !this.socket$.closed) {
      return;
    }

    const wsUrl = this.getWebSocketUrl(roomId);
    console.log(`Connecting to WebSocket at ${wsUrl}`);
    
    try {
      this.socket$ = this.createWebSocket(wsUrl);
      
      const messages = this.socket$.pipe(
        tap({
          next: (message: GridMessage) => {
            console.log('Received message:', message);
            this._chatMessages.update(messages => [message, ...messages]);
          },
          error: (error: Event) => {
            console.error('WebSocket error:', error);
            this.handleDisconnection(roomId);
          },
          complete: () => {
            console.log('WebSocket connection completed');
            this.handleDisconnection(roomId);
          }
        }),
        retryWhen(errors => 
          errors.pipe(
            tap(err => console.error('WebSocket error, retrying...', err)),
            delay(this.RECONNECT_INTERVAL)
          )
        )
      );
      
      this.messagesSubject.next(messages);
      
    } catch (error) {
      console.error('Error creating WebSocket connection:', error);
      this.handleDisconnection(roomId);
    }
  }

  private createWebSocket(url: string): WebSocketSubject<GridMessage> {
    return webSocket<GridMessage>({
      url,
      openObserver: {
        next: () => {
          console.log('WebSocket connection established');
          this.reconnectAttempts = 0;
        }
      },
      closeObserver: {
        next: (event: CloseEvent) => {
          console.log('WebSocket connection closed', event);
          this.handleDisconnection(this.roomId());
        }
      },
      binaryType: 'arraybuffer',
      deserializer: (e: MessageEvent) => {
        try {
          return JSON.parse(e.data);
        } catch (error) {
          console.error('Error parsing WebSocket message:', error, e.data);
          throw error;
        }
      },
      serializer: (value: GridMessage) => {
        try {
          return JSON.stringify(value);
        } catch (error) {
          console.error('Error serializing WebSocket message:', error, value);
          throw error;
        }
      }
    });
  }

  private getWebSocketUrl(roomId: string): string {
    return environment.ws.url(roomId);
  }

  private handleDisconnection(roomId: string) {
    if (this.reconnectAttempts < this.MAX_RECONNECT_ATTEMPTS) {
      const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 30000);
      console.log(`Attempting to reconnect in ${delay}ms...`);
      
      this.reconnectTimeout = setTimeout(() => {
        this.reconnectAttempts++;
        this.connect(roomId);
      }, delay);
    } else {
      console.error('Max reconnection attempts reached');
      // Optionally, you could notify the user here
    }
  }

  private disconnect() {
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }
    
    if (this.socket$) {
      this.socket$.complete();
      this.socket$ = null;
    }
  }

  public getChatMessages(): GridMessage[] {
    return this._chatMessages();
  }

  public getServerSentEvent(url: string): EventSource {
    return new EventSource(url, { withCredentials: true });
  }

  public joinRoom(roomKey: string, onSuccess?: () => void): void {
    if (this.isJoiningRoom()) {
      console.warn('Already joining a room');
      return;
    }

    this.isJoiningRoom.set(true);

    // First, get message history
    this.http.get(`/rooms/${roomKey}/messages`).subscribe({
      next: (messages) => {
        this._chatMessages.set(messages as GridMessage[]);
        
        // Then join the room
        const headers = new HttpHeaders({
          'Content-Type': 'application/json'
        });
        this.http.post(`/rooms/${roomKey}/members`, { sessionId: this.sessionId }, { headers }).subscribe({
          next: () => {
            // Connect to WebSocket after successfully joining
            this.connect(roomKey);
            
            if (onSuccess) {
              onSuccess();
            }
            this.roomId.set(roomKey);
            this.isJoiningRoom.set(false);
          },
          error: (error) => {
            console.error('Error joining room:', error);
            this.isJoiningRoom.set(false);
          },
        });
      },
      error: (error) => {
        console.error('Error fetching messages:', error);
        this.isJoiningRoom.set(false);
      },
    });
  }

  public createRoom(onSuccess?: (roomId: string | null) => void): void {
    if (this.isCreatingRoom()) {
      console.warn('Already creating a room');
      return;
    }

    this.isCreatingRoom.set(true);

    const headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });

    this.http.post<CreateRoomResponse>('/rooms', { sessionId: this.sessionId }, { headers }).subscribe({
      next: (response) => {
        if (onSuccess) {
          this.roomId.set(response.roomId ?? '');
          onSuccess(response.roomId ?? null);
        }
        this.isCreatingRoom.set(false);
      },
      error: (error) => {
        console.error('Error creating room:', error);
        this.isCreatingRoom.set(false);
      },
    });
  }

  public sendMessage(message: OutGoingGridMessage): void {
    const roomId = this.roomId();
    if (!roomId) {
      console.error('No room joined');
      return;
    }

    // Create a new GridMessage with all required properties
    const messageToSend: GridMessage = {
      ...message,
      id: generateUUID(), // Generate a unique ID for the message
      type: 'chat_message',
      senderSessionId: this.sessionId,
      timeStamp: new Date(), // Use Date object instead of string
      roomId: roomId,
      // Add any other required properties from the GridMessage interface
      grid: message.grid || []
    };

    if (this.socket$ && !this.socket$.closed) {
      try {
        this.socket$.next(messageToSend);
      } catch (error) {
        console.error('Error sending WebSocket message:', error);
        this.fallbackToHttp(roomId, messageToSend);
      }
    } else {
      console.warn('WebSocket not connected, falling back to HTTP');
      this.fallbackToHttp(roomId, messageToSend);
    }
  }

  private fallbackToHttp(roomId: string, message: GridMessage) {
    this.http.post(`/rooms/${roomId}/messages`, message).subscribe({
      next: () => {
        console.log('Message sent via HTTP fallback');
      },
      error: (err) => {
        console.error('Error sending message via HTTP fallback:', err);
      },
    });
  }
}

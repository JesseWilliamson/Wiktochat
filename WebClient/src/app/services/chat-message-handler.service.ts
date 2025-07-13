import { Injectable, signal, OnDestroy, computed } from '@angular/core';
import { generateUUID } from '@app/libs/utils';
import {
  CreateRoomResponse,
  GridMessage,
  OutGoingGridMessage,
} from '@app/components/models/types';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { webSocket, WebSocketSubject } from 'rxjs/webSocket';
// WebSocket configuration
const environment = {
  ws: {
    // Always connect to the backend server on port 8080 for WebSockets
    url: (roomId: string) => {
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      // Use localhost:8080 for development
      const host = 'localhost:8080';
      return `${protocol}//${host}/ws/chat/${roomId}`;
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
  // Expose messages with newest at the bottom
  public readonly chatMessages = computed(() => [...this._chatMessages()]);
  private readonly roomId = signal<string>('');
  private readonly sessionId = generateUUID();
  private readonly isJoiningRoom = signal<boolean>(false);
  private readonly isCreatingRoom = signal<boolean>(false);

  // WebSocket related properties
  private socket$: WebSocketSubject<GridMessage> | null = null;
  private messagesSubject = new Subject<GridMessage>();
  public messages$: Observable<GridMessage> = this.messagesSubject.asObservable();

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
    if (this.socket$) {
      return;
    }

    try {
      const url = this.getWebSocketUrl(roomId);
      this.socket$ = this.createWebSocket(url);

      // Reset the messages subject for the new connection
      this.messagesSubject = new Subject<GridMessage>();
      this.messages$ = this.messagesSubject.asObservable();

      // Subscribe to the WebSocket and forward messages to our subject
      this.socket$.subscribe({
        next: (message: GridMessage) => {
          this.handleIncomingMessage(message);
        },
        error: (error: any) => {
          console.error('WebSocket error:', error);
          this.messagesSubject.error(error);
          this.handleDisconnection(roomId);
        },
        complete: () => {
          this.messagesSubject.complete();
          this.handleDisconnection(roomId);
        }
      });
    } catch (error) {
      console.error('Error creating WebSocket connection:', error);
      this.handleDisconnection(roomId);
    }
  }

  private handleIncomingMessage(message: GridMessage) {
    // Skip connection messages and empty messages
    if (message.type === 'connection_established' || 
        (!('content' in message) && 
         (!message.grid || message.grid.length === 0) &&
         message.type !== 'chat_message')) {
      return;
    }
    
    // Update messages with the new one
    this._chatMessages.update(currentMessages => {
      // Add new message to the end of the array (maintain chronological order)
      const newMessages = [...currentMessages, message];
      
      // Emit the new message through the subject
      this.messagesSubject.next(message);
      
      return newMessages;
    });
  }

  private createWebSocket(url: string): WebSocketSubject<GridMessage> {
    return webSocket<GridMessage>({
      url,
      openObserver: {
        next: () => {
          this.reconnectAttempts = 0;
        }
      },
      closeObserver: {
        next: () => {
          this.handleDisconnection(this.roomId());
        }
      },
      binaryType: 'arraybuffer',
      deserializer: (e: MessageEvent) => {
        try {
          return JSON.parse(e.data);
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
          return {
            type: 'error',
            error: 'Invalid message format'
          } as unknown as GridMessage;
        }
      },
      serializer: (value: GridMessage) => {
        const message = {
          ...value,
          senderSessionId: value.senderSessionId || this.sessionId,
          roomId: value.roomId || this.roomId(),
          timeStamp: value.timeStamp || new Date(),
          type: value.type || 'grid_message',
          id: value.id || generateUUID()
        };
        return JSON.stringify(message);
      }
    });
  }

  private getWebSocketUrl(roomId: string): string {
    return environment.ws.url(roomId);
  }

  private handleDisconnection(roomId: string) {
    if (this.reconnectAttempts < this.MAX_RECONNECT_ATTEMPTS) {
      const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 30000);
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
        // Messages from server are in chronological order (oldest first)
        // We'll keep them in this order in the signal
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

    // Skip connection messages from being sent or added to history
    if (message.type === 'connection_established') {
      return;
    }

    // Ensure we have a valid message type
    const messageType = message.type || 'grid_message';

    // Create a complete message object with all required fields
    const messageToSend: GridMessage = {
      id: generateUUID(),
      type: messageType,
      senderSessionId: this.sessionId,
      timeStamp: new Date(),
      roomId: roomId,
      grid: message.grid || []
    };

    // Only send if we have a valid grid
    if (messageToSend.grid && messageToSend.grid.length > 0) {
      // Add message to local state immediately for optimistic updates
      this.handleIncomingMessage({ ...messageToSend });

      // Try to send via WebSocket first, with fallback to HTTP
      const sendViaWebSocket = (): boolean => {
        if (this.socket$ && !this.socket$.closed) {
          try {
            this.socket$.next(messageToSend);
            return true;
          } catch (error) {
            console.error('Error sending message via WebSocket:', error);
            return false;
          }
        }
        return false;
      };

      // Try to send via WebSocket first
      if (!sendViaWebSocket()) {
        // If WebSocket fails, try HTTP fallback
        this.fallbackToHttp(roomId, messageToSend);
      }
    }
  }

  private fallbackToHttp(roomId: string, message: GridMessage) {
    this.http.post(`/rooms/${roomId}/messages`, message).subscribe({
      error: (err) => {
        console.error('Error sending message via HTTP fallback:', err);
      },
    });
  }
}

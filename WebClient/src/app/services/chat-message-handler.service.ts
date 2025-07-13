import { Injectable, signal, OnDestroy, computed, effect, Signal } from '@angular/core';
import { generateUUID } from '@app/libs/utils';
import {
  CreateRoomResponse,
  GridMessage,
  OutGoingGridMessage,
} from '@app/components/models/types';
import { HttpClient, HttpHeaders } from '@angular/common/http';

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

@Injectable({
  providedIn: 'root',
})
export class ChatMessageHandlerService implements OnDestroy {
  private readonly _chatMessages = signal<GridMessage[]>([]);
  // Expose messages with oldest at the top and newest at the bottom
  public readonly chatMessages = computed(() => {
    const messages = [...this._chatMessages()];
    // Sort by timestamp (oldest first)
    return messages.sort((a, b) => new Date(a.timeStamp).getTime() - new Date(b.timeStamp).getTime());
  });
  private readonly roomId = signal<string>('');
  private readonly sessionId = generateUUID();
  private readonly isJoiningRoom = signal<boolean>(false);
  private readonly isCreatingRoom = signal<boolean>(false);

  // New message signal to replace the Subject
  private readonly _latestMessage = signal<GridMessage | null>(null);
  public readonly latestMessage = computed(() => this._latestMessage());

  // WebSocket related properties
  private socket: WebSocket | null = null;

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

  private connect(roomId: string, initialMessageIds?: Set<string>) {
    if (this.socket) {
      return;
    }

    try {
      const url = this.getWebSocketUrl(roomId);
      this.createWebSocket(url, initialMessageIds);
    } catch (error) {
      console.error('Error creating WebSocket connection:', error);
      this.handleDisconnection(roomId);
    }
  }

  private handleIncomingMessage(message: GridMessage) {
    console.log('[Service] Processing incoming message:', message.id, message.type);

    // Skip connection messages and empty messages
    if (message.type === 'connection_established' ||
        (!('content' in message) &&
         (!message.grid || message.grid.length === 0) &&
         message.type !== 'chat_message')) {
      console.log('[Service] Skipping message:', message.id, '- empty or connection message');
      return;
    }

    // Set latest message signal
    this._latestMessage.set(message);

    // Check if message already exists in the array by ID
    const existingMessages = this._chatMessages();
    const existingMessageById = existingMessages.find(m => m.id === message.id);
    if (existingMessageById) {
      console.warn('[Service] Duplicate message detected by ID:', message.id);
      return; // Skip adding duplicate messages
    }

    // Also check for content-based duplicates (messages with different IDs but same content)
    const contentDuplicate = existingMessages.find(m => this.areMessagesEqual(m, message));
    if (contentDuplicate) {
      console.warn('[Service] Duplicate message detected by content:', message.id);
      return; // Skip adding content duplicates
    }

    // Update messages with the new one
    this._chatMessages.update(currentMessages => {
      // Add new message to the array
      const newMessages = [...currentMessages];
      newMessages.push(message);
      newMessages.sort((a, b) => new Date(a.timeStamp).getTime() - new Date(b.timeStamp).getTime());
      console.log('[Service] Added message to state:', message.id, '- Total messages:', newMessages.length);
      return newMessages;
    });
  }

  private createWebSocket(url: string, initialMessageIds?: Set<string>): void {
    this.socket = new WebSocket(url);

    this.socket.onopen = () => {
      console.log('WebSocket connection established');
      this.reconnectAttempts = 0;
    };

    this.socket.onclose = () => {
      console.log('WebSocket connection closed');
      this.socket = null;
      this.handleDisconnection(this.roomId());
    };

    this.socket.onerror = (error) => {
      console.error('WebSocket error:', error);
      this.handleDisconnection(this.roomId());
    };

    this.socket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        // Ensure we have a valid message object
        const message: GridMessage = {
          id: data.id || generateUUID(),
          type: data.type || 'unknown',
          senderSessionId: data.senderSessionId || 'unknown',
          timeStamp: data.timeStamp ? new Date(data.timeStamp) : new Date(),
          roomId: data.roomId || '',
          grid: data.grid || [],
        };

        // Skip messages that were already loaded via HTTP
        if (initialMessageIds && initialMessageIds.has(message.id)) {
          console.log('[Service] Skipping already loaded message from WebSocket:', message.id);
          return;
        }

        this.handleIncomingMessage(message);
      } catch (err) {
        console.error('Error deserializing message:', err);
      }
    };
  }

  private getWebSocketUrl(roomId: string): string {
    return environment.ws.url(roomId);
  }

  // Store initial message IDs to prevent duplicates during reconnection
  private initialMessageIds: Set<string> | undefined;

  private handleDisconnection(roomId: string) {
    // Close and clean up the socket
    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }

    // Attempt reconnection if we haven't exceeded max attempts
    if (this.reconnectAttempts < this.MAX_RECONNECT_ATTEMPTS) {
      this.reconnectAttempts++;
      console.log(`Attempting to reconnect (${this.reconnectAttempts}/${this.MAX_RECONNECT_ATTEMPTS})...`);

      this.reconnectTimeout = setTimeout(() => {
        this.connect(roomId);
      }, this.RECONNECT_INTERVAL);
    }
  }

  private disconnect() {
    // Clear any pending reconnection
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }

    // Close the WebSocket connection
    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }
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

    // Set the current room ID
    this.roomId.set(roomKey);

    // Fetch existing messages first
    this.http.get<GridMessage[]>(`/rooms/${roomKey}/messages`).subscribe({
      next: (messages) => {
        // Process existing messages
        if (messages && messages.length > 0) {
          console.log(`[Service] Loaded ${messages.length} messages from HTTP`);

          // Track IDs of messages we've loaded via HTTP to avoid duplicates from WebSocket
          const initialMessageIds = new Set<string>();

          // Update messages in state
          this._chatMessages.update(currentMessages => {
            // Filter out messages that already exist in our state
            const newMessages = messages.filter(message => {
              // Add all message IDs to our tracking set
              initialMessageIds.add(message.id);

              // Check if this message already exists in our current messages
              return !currentMessages.some(existingMsg => existingMsg.id === message.id);
            });

            // Return updated messages array
            return [...currentMessages, ...newMessages];
          });

          // Connect to WebSocket after loading initial messages
          this.connect(roomKey, initialMessageIds);

          if (onSuccess) {
            onSuccess();
          }
        } else {
          // No existing messages, just connect to WebSocket
          console.log('[Service] No existing messages, connecting to WebSocket');
          this.connect(roomKey);

          if (onSuccess) {
            onSuccess();
          }
        }

        this.isJoiningRoom.set(false);
      },
      error: (error) => {
        console.error('Error joining room:', error);
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

    console.log('[Service] Creating new message with ID:', messageToSend.id);

    // Only send if we have a valid grid
    if (messageToSend.grid && messageToSend.grid.length > 0) {
      // Check if a message with identical content already exists to prevent duplicates
      const existingMessages = this._chatMessages();
      const isDuplicate = existingMessages.some(existingMsg =>
        this.areMessagesEqual(existingMsg, messageToSend)
      );

      if (isDuplicate) {
        console.warn('[Service] Prevented sending duplicate message with content:', messageToSend.grid);
        return;
      }

      // Add message to local state immediately for optimistic updates
      this.handleIncomingMessage({ ...messageToSend });

      // Try to send via WebSocket first
      if (this.socket && this.socket.readyState === WebSocket.OPEN) {
        try {
          console.log('[Service] Sending message via WebSocket:', messageToSend.id);
          this.socket.send(JSON.stringify(messageToSend));
        } catch (error) {
          console.error('Error sending message via WebSocket:', error);
          // If WebSocket fails, try HTTP fallback
          this.fallbackToHttp(roomId, messageToSend);
        }
      } else {
        // No active WebSocket, use HTTP
        console.log('[Service] Sending message via HTTP fallback:', messageToSend.id);
        this.fallbackToHttp(roomId, messageToSend);
      }
    }
  }

  /**
   * Compare two messages to check if they have the same content
   * This helps prevent duplicate messages
   */
  private areMessagesEqual(msg1: GridMessage, msg2: GridMessage): boolean {
    // If IDs are the same, they're the same message
    if (msg1.id === msg2.id) return true;

    // If grid data is identical, consider them duplicates
    if (msg1.grid && msg2.grid) {
      // Compare grid length
      if (msg1.grid.length !== msg2.grid.length) return false;

      // Deep compare grid contents
      return JSON.stringify(msg1.grid) === JSON.stringify(msg2.grid);
    }

    return false;
  }

  private fallbackToHttp(roomId: string, message: GridMessage) {
    this.http.post(`/rooms/${roomId}/messages`, message).subscribe({
      error: (err) => {
        console.error('Error sending message via HTTP fallback:', err);
      },
    });
  }
}

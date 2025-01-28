import { Injectable, signal, effect } from '@angular/core';
import { generateUUID } from '@app/libs/utils';
import {
  CreateRoomResponse,
  GridMessage,
  OutGoingGridMessage,
} from '@app/models/types';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class ChatMessageHandlerService {
  private readonly _chatMessages = signal<GridMessage[]>([]);
  public readonly chatMessages = this._chatMessages.asReadonly();
  private readonly roomId = signal<string>('');
  private readonly sessionId = generateUUID();
  private readonly isJoiningRoom = signal<boolean>(false);
  private readonly isCreatingRoom = signal<boolean>(false);

  constructor(
    private readonly http: HttpClient
  ) {}

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

    this.http.get(`/rooms/${roomKey}/messages`).subscribe({
      next: (messages) => {
        this._chatMessages.set(messages as GridMessage[]);
      },
      error: (error) => {
        console.error('Error fetching messages:', error);
        this.isJoiningRoom.set(false);
      },
    });

    this.http.post(`/rooms/${roomKey}/members`, this.sessionId).subscribe({
      next: () => {
        const eventSource = new EventSource(
          `/rooms/${roomKey}/message-stream?sessionId=${this.sessionId}`,
        );

        eventSource.addEventListener('message', (event) => {
          const message = JSON.parse(event.data) as GridMessage;
          this._chatMessages.update((messages) => [message, ...messages]);
        });

        eventSource.addEventListener('error', (error) => {
          console.error('EventSource error:', error);
          eventSource.close();
          this.isJoiningRoom.set(false);
        });

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
  }

  public createRoom(onSuccess?: (roomId: string | null) => void): void {
    if (this.isCreatingRoom()) {
      console.warn('Already creating a room');
      return;
    }

    this.isCreatingRoom.set(true);

    this.http.post<CreateRoomResponse>('/rooms', this.sessionId).subscribe({
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

  public sendGridMessage(grid: string[][]): void {
    const payload = {
      grid: grid,
      senderSessionId: this.sessionId,
      timeStamp: new Date(),
    } as OutGoingGridMessage;

    this.http.post(`/rooms/${this.roomId()}/messages`, payload).subscribe({
      error: (error) => {
        console.error('Error sending message:', error);
      },
    });
  }
}

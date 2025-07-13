export interface ChatMessage {
  sender: string;
  content: string;
  timestamp?: Date;
}

export interface ChatRoom {
  roomId: string;
  messages: ChatMessage[];
}

export interface RoomState {
  currentRoom?: string;
  username?: string;
  connected: boolean;
}

export interface JoinRoomRequest {
  sessionId: string;
  roomId: string;
}

export interface CreateSessionIdResponse {
  sessionId: string;
}

export interface CreateRoomResponse {
  roomId?: string;
  message?: string;
}

export interface Point {
  x: number;
  y: number;
}

// Base type for all possible property types in GridMessage
type GridMessageValue = string | number | boolean | Date | string[] | string[][];

export interface GridMessage {
  grid: string[][];
  senderSessionId: string;
  timeStamp: Date;
  id: string;
  type?: string;
  roomId?: string;
  [key: string]: GridMessageValue | undefined; // Allow additional properties with specific types
}

export interface OutGoingGridMessage {
  grid: string[][];
  type?: string;
  senderSessionId: string;
  timeStamp: Date;
}

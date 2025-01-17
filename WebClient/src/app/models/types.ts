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

export interface GridMessage {
  grid: string[][];
  senderSessionId: string;
  timeStamp: Date;
  id: string;
}

export interface OutGoingGridMessage {
  grid: string[][];
  senderSessionId: string;
  timeStamp: Date;
}


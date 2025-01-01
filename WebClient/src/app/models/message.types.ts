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

export interface CreateRoomResponse {
  success: boolean;
  roomId?: string;
  message?: string;
}

export interface JoinRoomResponse {
  success: boolean;
}

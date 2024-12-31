package wiktochat.roomserver;

import java.util.ArrayList;
import java.util.List;

public class ChatRoom {
  private final String roomId;
  private final List<ChatMessage> messages;

  public ChatRoom(String roomId) {
    this.roomId = roomId;
    this.messages = new ArrayList<>();
  }

  public void addMessage(ChatMessage message) {
    System.out.println("ChatRoom.addMessage - Message: " + message + " from " + message.getSenderSessionId());
    messages.add(message);
  }

  public List<ChatMessage> getMessages() {
    return messages;
  }

  public String getRoomId() {
    return roomId;
  }
}

package com.wiktochat;

import java.util.ArrayList;
import java.util.List;

public class ChatRoom {
  private final String roomId;
  private final List<GridMessage> messages;

  public ChatRoom(String roomId) {
    this.roomId = roomId;
    this.messages = new ArrayList<>();
  }

  public void addMessage(GridMessage message) {
    if (message instanceof GridMessage gridMessage) {
      System.out.println("ChatRoom.addMessage - Grid message from " + message.getSenderSessionId());
      messages.add(gridMessage);
    }
  }

  public List<GridMessage> getMessages() {
    // Return a new list to prevent external modification
    return new ArrayList<>(messages);
  }

  public String getRoomId() {
    return roomId;
  }
}

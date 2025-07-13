package com.wiktochat;

public class GridMessageEvent {
  private final String roomId;
  private final GridMessage message;

  public GridMessageEvent(String roomId, GridMessage message) {
    this.roomId = roomId;
    this.message = message;
  }

  public String getRoomId() {
    return roomId;
  }

  public GridMessage getMessage() {
    return message;
  }
}

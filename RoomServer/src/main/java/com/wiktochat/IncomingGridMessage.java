package com.wiktochat;

import java.util.Date;

import io.micronaut.core.annotation.Introspected;
import io.micronaut.serde.annotation.Serdeable;

@Introspected
@Serdeable
public class IncomingGridMessage {
  private String[][] grid;
  private String senderSessionId;
  private String type = "chat_message";
  private Date timeStamp;
  private String roomId;

  public IncomingGridMessage(String[][] grid, String senderSessionId, Date timestamp) {
    this.grid = grid.clone();
    this.senderSessionId = senderSessionId;
    this.timeStamp = timestamp;
  }

  public String[][] getGrid() {
    return grid.clone();
  }

  public String getSenderSessionId() {
    return senderSessionId;
  }

  public Date getTimeStamp() {
    return timeStamp;
  }

  public String getType() {
    return type;
  }

  public void setType(String type) {
    this.type = type;
  }

  public String getRoomId() {
    return roomId;
  }

  public void setRoomId(String roomId) {
    this.roomId = roomId;
  }

  public void setGrid(String[][] grid) {
    this.grid = grid;
  }

  public void setSenderSessionId(String senderSessionId) {
    this.senderSessionId = senderSessionId;
  }

  public void setTimeStamp(Date timeStamp) {
    this.timeStamp = timeStamp;
  }
}

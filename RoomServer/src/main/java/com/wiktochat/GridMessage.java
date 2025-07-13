package com.wiktochat;

import java.util.Date;
import java.util.UUID;

import io.micronaut.core.annotation.Introspected;
import io.micronaut.serde.annotation.Serdeable;

@Introspected
@Serdeable
public class GridMessage {
  private String[][] grid;
  private String senderSessionId;
  private String type = "chat_message";
  private Date timeStamp;
  private String id;
  private String roomId;

  public GridMessage(String[][] grid, String senderSessionId, Date timestamp) {
    this.grid = grid.clone();
    this.senderSessionId = senderSessionId;
    this.timeStamp = timestamp;
    this.id = UUID.randomUUID().toString();
  }

  public GridMessage(IncomingGridMessage incomingGridMessage) {
    this.grid = incomingGridMessage.getGrid();
    this.senderSessionId = incomingGridMessage.getSenderSessionId();
    this.timeStamp = incomingGridMessage.getTimeStamp();
    this.id = UUID.randomUUID().toString();
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

  public String getId() {
    return id;
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

  public void setSenderSessionId(String senderSessionId) {
    this.senderSessionId = senderSessionId;
  }

  public void setTimeStamp(Date timeStamp) {
    this.timeStamp = timeStamp;
  }

  public void setId(String id) {
    this.id = id;
  }
}

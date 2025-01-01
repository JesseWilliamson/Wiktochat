package wiktochat.roomserver;

public class CreateRoomResponse {
  private final String roomId;
  private final String message;

  public CreateRoomResponse(boolean success, String message, String roomId) {
    this.roomId = roomId;
    this.message = message;
  }

  public String getMessage() {
    return message;
  }

  public String getRoomId() {
    return roomId;
  }
}

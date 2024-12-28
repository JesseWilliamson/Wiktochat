package wiktochat.roomserver;

public class CreateRoomResponse {
  private final boolean success;
  private final String roomId;
  private final String message;

  public CreateRoomResponse(boolean success, String message, String roomId) {
    this.success = success;
    this.roomId = roomId;
    this.message = message;
  }

  public boolean isSuccess() {
    return success;
  }

  public String getMessage() {
    return message;
  }

  public String getRoomId() {
    return roomId;
  }
}

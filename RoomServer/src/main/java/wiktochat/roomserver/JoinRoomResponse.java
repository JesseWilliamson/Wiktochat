package wiktochat.roomserver;

public class JoinRoomResponse {
  private final boolean success;
  private final String message;

  public JoinRoomResponse(boolean success, String message) {
    this.success = success;
    this.message = message;
  }

  public String getMessage() {
    return message;
  }
}

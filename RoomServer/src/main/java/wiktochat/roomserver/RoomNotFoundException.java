package wiktochat.roomserver;

public class RoomNotFoundException extends RuntimeException {
  public RoomNotFoundException(String message) {
    super(message);
  }
}

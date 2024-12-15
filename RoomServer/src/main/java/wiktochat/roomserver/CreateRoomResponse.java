package wiktochat.roomserver;

public class CreateRoomResponse {
    private boolean success;
    private String roomId;
    private String message;

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

    public String getRoomId() { return roomId; }
}

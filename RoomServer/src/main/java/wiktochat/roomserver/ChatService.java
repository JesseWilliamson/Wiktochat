package wiktochat.roomserver;

import org.springframework.stereotype.Service;
import java.util.concurrent.ConcurrentHashMap;
import java.util.Random;

@Service
public class ChatService {
    private final ConcurrentHashMap<String, ChatRoom> rooms = new ConcurrentHashMap<>();
    private final ConcurrentHashMap<String, String> userSessions = new ConcurrentHashMap<>();

    public String createRoom(String username) {
        String roomId = generateRoomId();
        ChatRoom room = new ChatRoom(roomId);
        room.addUser(username);
        rooms.put(roomId, room);
        userSessions.put(username, roomId);
        return roomId;
    }

    public void joinRoom(String roomId, String username) {
        ChatRoom room = rooms.get(roomId);
        if (room != null) {
            room.addUser(username);
            userSessions.put(username, roomId);
        } else {
            throw new RuntimeException("Room not found");
        }
    }

    public void sendMessage(String username, String message) {
        String roomId = userSessions.get(username);
        if (roomId != null) {
            ChatRoom room = rooms.get(roomId);
            if (room != null) {
                room.addMessage(new ChatMessage(username, message));
            }
        }
    }

    public ChatRoom getRoomData(String roomId) {
        return rooms.get(roomId);
    }

    private String generateRoomId() {
        String chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
        StringBuilder roomId = new StringBuilder();
        Random random = new Random();
        for (int i = 0; i < 6; i++) {
            roomId.append(chars.charAt(random.nextInt(chars.length())));
        }
        return roomId.toString();
    }
}

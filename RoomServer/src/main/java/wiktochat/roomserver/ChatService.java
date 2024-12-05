package wiktochat.roomserver;

import java.util.Random;
import java.util.concurrent.ConcurrentHashMap;

import org.springframework.stereotype.Service;

@Service
public class ChatService {
    private final ConcurrentHashMap<String, ChatRoom> rooms = new ConcurrentHashMap<>();
    private final ConcurrentHashMap<String, String> userSessions = new ConcurrentHashMap<>();

    public String createRoom(String roomID) {
        ChatRoom room = new ChatRoom(roomID);
        rooms.put(roomID, room);
        System.out.println("Created room " + roomID + ". Total rooms: " + rooms.toString());
        return roomID;
    }

    public void joinRoom(String sessionId, String roomId) {
        System.out.println("ChatService.joinRoom - Session: " + sessionId + " Room: " + roomId);
        ChatRoom room = rooms.get(roomId);
        if (room != null) {
            userSessions.put(sessionId, roomId);
            System.out.println("Current users in sessions: " + userSessions.toString());
        } else {
            System.out.println("Room not found: " + roomId);
            throw new RuntimeException("Room not found");
        }
    }

    public void sendMessage(String sessionId, String message) {
        String roomId = userSessions.get(sessionId);
        if (roomId != null) {
            ChatRoom room = rooms.get(roomId);
            if (room != null) {
                room.addMessage(new ChatMessage(sessionId, message));
            }
        }
    }

    public ChatRoom getRoomData(String roomId) {
        System.out.println("Getting room data for: " + roomId);
        return rooms.get(roomId);
    }

    // TODO: make sure this doesn't generate duplicate IDs
    public String generateRoomId() {
        String chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
        StringBuilder roomId = new StringBuilder();
        Random random = new Random();
        for (int i = 0; i < 6; i++) {
            roomId.append(chars.charAt(random.nextInt(chars.length())));
        }
        return roomId.toString();
    }
}

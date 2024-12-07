package wiktochat.roomserver;

import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;

public class ChatRoom {
    private String roomId;
    private List<ChatMessage> messages;

    public ChatRoom(String roomId) {
        this.roomId = roomId;
        this.messages = new ArrayList<>();
    }

    public void addMessage(ChatMessage message) {
        System.out.println("ChatRoom.addMessage - Message: " + message + " from " + message.getSender());
        messages.add(message);
        // Broadcasting is now handled by ChatService
    }

    public List<ChatMessage> getMessages() {
        return messages;
    }

    public String getRoomId() {
        return roomId;
    }
}

package wiktochat.roomserver;

import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

public class ChatRoom {
    private String roomId;
    private Set<String> users;
    private List<ChatMessage> messages;

    public ChatRoom(String roomId) {
        this.roomId = roomId;
        this.users = new HashSet<>();
        this.messages = new ArrayList<>();
    }

    public void addUser(String username) {
        users.add(username);
    }

    public void removeUser(String username) {
        users.remove(username);
    }

    public void addMessage(ChatMessage message) {
        System.out.println("ChatRoom.addMessage - Message: " + message + " from " + message.getSender());
        messages.add(message);
    }

    public Set<String> getUsers() {
        return users;
    }

    public List<ChatMessage> getMessages() {
        return messages;
    }

    public String getRoomId() {
        return roomId;
    }
}

package wiktochat.roomserver;

import java.util.ArrayList;
import java.util.HashSet;

public class User {
    private String username;
    private HashSet<ChatRoom> chatRooms;

    public User(String sender, String content) {
        this.sender = sender;
        this.content = content;
    }

    public String getUsername() {
      return username;
    }

    public void setUsername(String username) {
      this.username = username;
    }

    public void addChatRoom(ChatRoom chatRoom) {
      chatRooms.add(chatRoom);
    }

    public void removeChatRoom(ChatRoom chatRoom) {
      chatRooms.remove(chatRoom);
    }

    @Override
    public String toString() {
      return "User [username=" + username + ", sessionId=" + sessionId + ", chatRooms=" + chatRooms + "]";
    }
}

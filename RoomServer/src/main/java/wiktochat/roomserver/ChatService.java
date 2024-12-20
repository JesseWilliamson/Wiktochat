package wiktochat.roomserver;

import java.security.Principal;
import java.util.Random;
import java.util.concurrent.ConcurrentHashMap;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

@Service
public class ChatService {
  @Autowired
  private SimpMessagingTemplate messagingTemplate;

  private final ConcurrentHashMap<String, ChatRoom> rooms = new ConcurrentHashMap<>();
  private final ConcurrentHashMap<String, User> users = new ConcurrentHashMap<>();
  private final RoomManager roomManager = new RoomManager();

  public String createRoom(Principal principal) {
    String roomId = generateRoomId();
    ChatRoom room = new ChatRoom(roomId);
    rooms.put(roomId, room);
    System.out.println("Created room " + roomId + ". Total rooms: " + rooms.toString());
    return roomId;
  }

  public void joinRoom(Principal principal, String roomId) {
    System.out.println("ChatService.joinRoom - Principal: " + principal.getName() + " Room: " + roomId);
    ChatRoom room = rooms.get(roomId);
    if (room != null) {
      roomManager.addUserToRoom(principal, roomId);
      System.out.println("Current users in " + roomId + ": " + roomManager.getUsersInRoom(roomId));
    } else {
      System.out.println("Room not found: " + roomId);
      throw new RuntimeException("Room not found");
    }
  }

  public void sendMessage(Principal principal, String roomId, String message) {
    if (!roomManager.isUserInRoom(principal, roomId)) {
      System.out.println("User " + principal + " tried to send a message to a room (" + roomId + ") which they aren't in!");
      System.out.println("Users in " + roomId + " are " + roomManager.getUsersInRoom(roomId));
      return;
    }
    ChatRoom room = rooms.get(roomId);
    ChatMessage chatMessage = new ChatMessage(principal, message);
    room.addMessage(chatMessage);
    // Broadcast the message to all users subscribed to this room's topic
    messagingTemplate.convertAndSend(String.format("rooms/%s/messages", roomId), chatMessage);
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

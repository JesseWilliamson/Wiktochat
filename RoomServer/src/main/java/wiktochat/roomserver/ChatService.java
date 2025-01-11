package wiktochat.roomserver;

import java.util.Random;
import java.util.concurrent.ConcurrentHashMap;

import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;

@Service
public class ChatService {
  private final ConcurrentHashMap<String, ChatRoom> rooms = new ConcurrentHashMap<>();
  private final ConcurrentHashMap<String, User> users = new ConcurrentHashMap<>();
  private final RoomManager roomManager = new RoomManager();
  private final ApplicationEventPublisher eventPublisher;

  public ChatService(ApplicationEventPublisher eventPublisher) {
    this.eventPublisher = eventPublisher;
  }

  public String createRoom(String sessionId) {
    String roomId = generateRoomId();
    ChatRoom room = new ChatRoom(roomId);
    rooms.put(roomId, room);
    System.out.println("Created room " + roomId + ". Total rooms: " + rooms);
    return roomId;
  }

  public void joinRoom(String sessionId, String roomId) {
    System.out.println("ChatService.joinRoom - SessionId: " + sessionId + " Room: " + roomId);
    ChatRoom room = rooms.get(roomId);
    if (room == null) {
        throw new RoomNotFoundException("Room " + roomId + " does not exist");
    }
    roomManager.addUserToRoom(sessionId, roomId);
    System.out.println("Current users in " + roomId + ": " + roomManager.getUsersInRoom(roomId));
  }

  public void sendMessage(String roomId, GridMessage message) {
    if (!roomManager.isUserInRoom(message.getSenderSessionId(), roomId)) {
        System.out.println("User " + message.getSenderSessionId() + " tried to send a message to a room (" + roomId + ") which they aren't in!");
        System.out.println("Users in " + roomId + " are " + roomManager.getUsersInRoom(roomId));
        return;
    }
    ChatRoom room = rooms.get(roomId);
    room.addMessage(message);
    
    eventPublisher.publishEvent(new GridMessageEvent(roomId, message));
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

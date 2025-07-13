package com.wiktochat;

import jakarta.inject.Singleton;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import java.util.function.Consumer;
import java.time.Instant;

@Singleton
public class ChatService {
    private final ConcurrentHashMap<String, ChatRoom> rooms = new ConcurrentHashMap<>();
    private final ConcurrentHashMap<String, User> users = new ConcurrentHashMap<>();
    private final RoomManager roomManager = new RoomManager();
    private final Map<String, Set<Consumer<GridMessage>>> messageConsumers = new ConcurrentHashMap<>();
  private final Object consumersLock = new Object();

    public ChatService() {
        // No event publisher needed for WebSocket implementation
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

  public boolean isUserInRoom(String sessionId, String roomId) {
    return roomManager.isUserInRoom(sessionId, roomId);
  }

  public void sendMessage(String roomId, IncomingGridMessage incomingMessage) {
    String sessionId = incomingMessage.getSenderSessionId();
    if (sessionId == null || sessionId.isEmpty()) {
      System.out.println("Message has no session ID, cannot verify room membership");
      return;
    }

    // Add user to room if not already present
    if (!roomManager.isUserInRoom(sessionId, roomId)) {
      System.out.println("Adding user " + sessionId + " to room " + roomId + " based on message");
      joinRoom(sessionId, roomId);
    }

    try {
      // Create a proper GridMessage from the incoming message
      GridMessage message = new GridMessage(
        incomingMessage.getGrid(),
        sessionId,
        new Date()
      );
      message.setRoomId(roomId);
      message.setType(incomingMessage.getType() != null ? incomingMessage.getType() : "grid_message");

      // Add message to room and notify subscribers
      ChatRoom room = rooms.get(roomId);
      if (room != null) {
        room.addMessage(message);
        notifySubscribers(roomId, message);
      } else {
        System.out.println("Room " + roomId + " not found");
      }
    } catch (Exception e) {
      System.err.println("Error creating GridMessage: " + e.getMessage());
      e.printStackTrace();
    }
  }

  public void subscribeToRoom(String roomId, Consumer<GridMessage> messageConsumer) {
      synchronized (consumersLock) {
          messageConsumers.computeIfAbsent(roomId, k -> ConcurrentHashMap.newKeySet())
              .add(messageConsumer);
          System.out.println("Subscribed consumer for room: " + roomId + ", total consumers: " +
              messageConsumers.getOrDefault(roomId, Collections.emptySet()).size());
      }
  }

  public void unsubscribeFromRoom(String roomId, Consumer<GridMessage> messageConsumer) {
      synchronized (consumersLock) {
          Set<Consumer<GridMessage>> consumers = messageConsumers.get(roomId);
          if (consumers != null) {
              consumers.remove(messageConsumer);
              if (consumers.isEmpty()) {
                  messageConsumers.remove(roomId);
              }
              System.out.println("Unsubscribed consumer from room: " + roomId + ", remaining consumers: " +
                  messageConsumers.getOrDefault(roomId, Collections.emptySet()).size());
          }
      }
  }

  private void notifySubscribers(String roomId, GridMessage message) {
      Set<Consumer<GridMessage>> consumersCopy;
      synchronized (consumersLock) {
          Set<Consumer<GridMessage>> consumers = messageConsumers.get(roomId);
          if (consumers == null || consumers.isEmpty()) {
              System.out.println("No active consumers for room: " + roomId);
              return;
          }
          // Create a copy to avoid ConcurrentModificationException
          consumersCopy = new HashSet<>(consumers);
      }

      System.out.println("Notifying " + consumersCopy.size() + " consumers in room: " + roomId);
      for (Consumer<GridMessage> consumer : consumersCopy) {
          try {
              consumer.accept(message);
          } catch (Exception e) {
              System.err.println("Error notifying consumer in room " + roomId + ": " + e.getMessage());
              e.printStackTrace();
          }
      }
  }

  public ChatRoom getRoomData(String roomId) {
    System.out.println("Getting room data for: " + roomId);
    return rooms.get(roomId);
  }

  public java.util.List<GridMessage> getMessages(String roomId) {
    System.out.println("Getting messages for: " + roomId);
    ChatRoom room = rooms.get(roomId);
    if (room == null) {
      throw new RoomNotFoundException("Room " + roomId + " does not exist");
    }
    return room.getMessages();
  }

  // TODO: make sure this doesn't generate duplicate IDs
  public String generateRoomId() {
    String chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    StringBuilder roomId = new StringBuilder();
    java.util.Random random = new java.util.Random();
    for (int i = 0; i < 6; i++) {
      roomId.append(chars.charAt(random.nextInt(chars.length())));
    }
    return roomId.toString();
  }
}

package com.wiktochat;

import jakarta.inject.Singleton;

@Singleton
public class RoomManager {
  private final java.util.HashSet<UserRoom> relationships = new java.util.HashSet<>();

  public void addUserToRoom(String sessionId, String roomId) {
    relationships.add(new UserRoom(sessionId, roomId));
  }

  public void removeUserFromRoom(String sessionId, String roomId) {
    relationships.remove(new UserRoom(sessionId, roomId));
  }

  public java.util.Set<String> getRoomsForUser(String sessionId) {
    return relationships.stream()
      .filter(ur -> ur.sessionId().equals(sessionId))
      .map(UserRoom::roomId)
      .collect(java.util.stream.Collectors.toSet());
  }

  public java.util.Set<String> getUsersInRoom(String roomId) {
    return relationships.stream()
      .filter(ur -> ur.roomId().equals(roomId))
      .map(UserRoom::sessionId)
      .collect(java.util.stream.Collectors.toSet());
  }

  public boolean isUserInRoom(String sessionId, String roomId) {
    return relationships.contains(new UserRoom(sessionId, roomId));
  }

  private record UserRoom(String sessionId, String roomId) {
  }
}

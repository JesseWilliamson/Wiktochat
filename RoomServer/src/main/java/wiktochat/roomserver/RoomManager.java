package wiktochat.roomserver;

import java.util.HashSet;
import java.util.Set;
import java.util.stream.Collectors;

public class RoomManager {
  private final HashSet<UserRoom> relationships = new HashSet<>();

  public void addUserToRoom(String sessionId, String roomId) {
    relationships.add(new UserRoom(sessionId, roomId));
  }

  public void removeUserFromRoom(String sessionId, String roomId) {
    relationships.remove(new UserRoom(sessionId, roomId));
  }

  public Set<String> getRoomsForUser(String sessionId) {
    return relationships.stream()
      .filter(ur -> ur.sessionId().equals(sessionId))
      .map(UserRoom::roomId)
      .collect(Collectors.toSet());
  }

  public Set<String> getUsersInRoom(String roomId) {
    return relationships.stream()
      .filter(ur -> ur.roomId().equals(roomId))
      .map(UserRoom::sessionId)
      .collect(Collectors.toSet());
  }

  public boolean isUserInRoom(String sessionId, String roomId) {
    return relationships.contains(new UserRoom(sessionId, roomId));
  }

  private record UserRoom(String sessionId, String roomId) {
  }
}

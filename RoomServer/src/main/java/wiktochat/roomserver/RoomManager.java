package wiktochat.roomserver;

import java.util.HashSet;
import java.util.Set;
import java.util.stream.Collectors;

public class RoomManager {
  private record UserRoom(String userId, String roomId) {}

  private final HashSet<UserRoom> relationships = new HashSet<>();

  public void addUserToRoom(String userId, String roomId) {
    relationships.add(new UserRoom(userId, roomId));
  }

  public void removeUserFromRoom(String userId, String roomId) {
    relationships.remove(new UserRoom(userId, roomId));
  }

  public Set<String> getRoomsForUser(String userId) {
    return relationships.stream()
      .filter(ur -> ur.userId().equals(userId))
      .map(UserRoom::roomId)
      .collect(Collectors.toSet());
  }

  public Set<String> getUsersInRoom(String roomId) {
    return relationships.stream()
      .filter(ur -> ur.roomId().equals(roomId))
      .map(UserRoom::userId)
      .collect(Collectors.toSet());
  }

  public boolean isUserInRoom(String userId, String roomId) {
    return relationships.contains(new UserRoom(userId, roomId));
  }
}

package wiktochat.roomserver;

import java.security.Principal;
import java.util.HashSet;
import java.util.Set;
import java.util.stream.Collectors;

public class RoomManager {
  private record UserRoom(Principal principal, String roomId) {}

  private final HashSet<UserRoom> relationships = new HashSet<>();

  public void addUserToRoom(Principal principal, String roomId) {
    relationships.add(new UserRoom(principal, roomId));
  }

  public void removeUserFromRoom(Principal principal, String roomId) {
    relationships.remove(new UserRoom(principal, roomId));
  }

  public Set<String> getRoomsForUser(Principal principal) {
    return relationships.stream()
      .filter(ur -> ur.principal().equals(principal))
      .map(UserRoom::roomId)
      .collect(Collectors.toSet());
  }

  public Set<Principal> getUsersInRoom(String roomId) {
    return relationships.stream()
      .filter(ur -> ur.roomId().equals(roomId))
      .map(UserRoom::principal)
      .collect(Collectors.toSet());
  }

  public boolean isUserInRoom(Principal principal, String roomId) {
    return relationships.contains(new UserRoom(principal, roomId));
  }
}

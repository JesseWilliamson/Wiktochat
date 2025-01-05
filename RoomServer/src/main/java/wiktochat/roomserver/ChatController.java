package wiktochat.roomserver;

import org.springframework.http.ResponseEntity;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

@RestController
@CrossOrigin
public class ChatController {

  private final ChatService chatService;
  private final SimpMessagingTemplate simpMessagingTemplate;

  public ChatController(ChatService chatService, SimpMessagingTemplate simpMessagingTemplate) {
    this.chatService = chatService;
    this.simpMessagingTemplate = simpMessagingTemplate;
  }

  @PostMapping("/rooms")
  public ResponseEntity<CreateRoomResponse> createRoom(@RequestBody String sessionId) {
    try {
      String roomId = chatService.createRoom(sessionId);
      return ResponseEntity.ok(new CreateRoomResponse(true, "Room created", roomId));
    } catch (Exception e) {
      return ResponseEntity.badRequest()
        .body(new CreateRoomResponse(false, "Failed to create room: " + e.getMessage(), null));
    }
  }

  @PostMapping("/rooms/{roomId}/members")
  public ResponseEntity<Void> joinRoom(@RequestBody String sessionId, @PathVariable String roomId) {
    try {
      System.out.println("Join attempt - sessionId: " + sessionId + " Room: " + roomId);
      chatService.joinRoom(sessionId, roomId);
      return ResponseEntity.ok().build();
    } catch (RoomNotFoundException e) {
      return ResponseEntity.notFound().build();
    } catch (Exception e) {
      return ResponseEntity.badRequest().build();
    }
  }


  @GetMapping("/rooms/{roomId}/info")
  public ChatRoom getRoomData(@PathVariable String roomId) {
    return chatService.getRoomData(roomId);
  }

  @MessageMapping("/rooms/{roomId}/messages")
  public void sendMessage(StompHeaderAccessor headerAccessor, @DestinationVariable String roomId, @Payload GridMessage message) {
    System.out.println("ChatController.sendMessage - Grid received for room: " + roomId);
    String sessionId = headerAccessor.getSessionId();
    chatService.sendMessage(sessionId, roomId, message);
  }
}

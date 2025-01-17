package wiktochat.roomserver;

import org.springframework.context.event.EventListener;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

@RestController
@CrossOrigin
public class ChatController {

  private final ChatService chatService;
  private final EmitterService emitterService;

  public ChatController(ChatService chatService, EmitterService emitterService) {
    this.chatService = chatService;
    this.emitterService = emitterService;
  }

  @EventListener
  public void handleGridMessage(GridMessageEvent event) {
    emitterService.sendMessage(event.getRoomId(), event.getMessage());
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

  @PostMapping("rooms/{roomId}/messages")
  public ResponseEntity<Void> sendMessage(@RequestBody IncomingGridMessage incomingGridMessage, @PathVariable String roomId) {
    try {
      System.out.println("Send message - Room: " + roomId + " Message: " + incomingGridMessage);
      GridMessage message = new GridMessage(incomingGridMessage);
      chatService.sendMessage(roomId, message);
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

  @CrossOrigin
  @GetMapping(value = "/rooms/{roomId}/message-stream", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
  public SseEmitter subscribeToRoom(@PathVariable String roomId, @RequestParam String sessionId) {
    return emitterService.createEmitter(roomId, sessionId);
  }
}

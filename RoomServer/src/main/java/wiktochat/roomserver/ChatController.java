package wiktochat.roomserver;

import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

@RestController
@CrossOrigin
public class ChatController {

  private final ChatService chatService;

  public ChatController(ChatService chatService) {
    this.chatService = chatService;
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
  public ResponseEntity<Void> sendMessage(@RequestBody GridMessage message, @PathVariable String roomId) {
    try {
      System.out.println("Send message - Room: " + roomId + " Message: " + message);
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
  @GetMapping(value = "/query", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
  public SseEmitter query(@RequestParam String query) {
    SseEmitter emitter = new SseEmitter(Long.MAX_VALUE);

    emitter.onCompletion(() -> {
        System.out.println("SSE completed for query: " + query);
    });

    emitter.onTimeout(() -> {
        System.out.println("SSE timeout for query: " + query);
        emitter.complete();
    });

    emitter.onError((ex) -> {
        System.out.println("SSE error for query: " + query);
        System.out.println("Error: " + ex.getMessage());
    });

    ExecutorService executor = Executors.newSingleThreadExecutor();
    executor.execute(() -> {
        try {
            for (int i = 0; i < 5; i++) {
                try {
                    emitter.send(SseEmitter.event()
                        .data("Response part " + (i + 1))
                        .id(String.valueOf(i))
                        .name("message")
                        .build());
                    Thread.sleep(1000);
                } catch (Exception e) {
                    emitter.completeWithError(e);
                    break;
                }
            }
            emitter.send(SseEmitter.event()
                .data("CLOSE")
                .name("close")
                .build());
            emitter.complete();
        } catch (Exception e) {
            emitter.completeWithError(e);
        } finally {
            executor.shutdown();
        }
    });

    return emitter;
  }
}

package wiktochat.roomserver;

import java.security.Principal;

import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.messaging.simp.annotation.SendToUser;
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

  @PostMapping
  public void createRoom(@RequestBody String sessionId) {
    chatService.createRoom(sessionId);
  }

  @MessageMapping("/rooms/{roomId}/join")
  @SendToUser("/queue/responses")
  public JoinRoomResponse handleJoinRoom(@DestinationVariable String roomId, Principal principal) {
    String sessionId = principal.toString();
    System.out.println("Join attempt - sessionId: " + sessionId + " Room: " + roomId);

    try {
      chatService.joinRoom(sessionId, roomId);
      System.out.println("Broadcasting join message to room: " + roomId);
      simpMessagingTemplate.convertAndSend("/rooms/" + roomId + "/messages",
        new ChatMessage("User joined the room"));
      return new JoinRoomResponse(true, "Successfully joined room");
    } catch (Exception e) {
      return new JoinRoomResponse(false, "Failed to join room: " + e.getMessage());
    }
  }

  @GetMapping("/rooms/{roomId}/info")
  public ChatRoom getRoomData(@PathVariable String roomId) {
    return chatService.getRoomData(roomId);
  }

  @MessageMapping("/rooms/create")
  @SendToUser("/queue/responses")
  public CreateRoomResponse handleCreateRoom(Principal principal) {
    String sessionId = principal.toString();
    System.out.println("Room create attempt - sessionId: " + sessionId);

    try {
      String roomId = chatService.createRoom(sessionId);
      System.out.println("Room created: " + roomId + " by " + sessionId);
      return new CreateRoomResponse(true, "Room created", roomId);
    } catch (Exception e) {
      return new CreateRoomResponse(false, "Failed to create room: " + e.getMessage(), null);
    }
  }

//    @MessageMapping("/rooms/{roomId}/messages")
//    public void sendMessage(StompHeaderAccessor headerAccessor, @DestinationVariable String roomId, @Payload MessageDTO message) {
//        System.out.println("ChatController.sendMessage - Message: " + message.getMessage() + " Room: " + roomId);
//        String sessionId = headerAccessor.getSessionId();
//        chatService.sendMessage(sessionId, roomId, message.getMessage());
//    }
}

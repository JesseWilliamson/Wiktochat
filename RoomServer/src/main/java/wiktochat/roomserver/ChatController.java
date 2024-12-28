package wiktochat.roomserver;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.messaging.simp.annotation.SendToUser;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RestController;

import java.security.Principal;

@RestController
@CrossOrigin
public class ChatController {

  @Autowired
  private ChatService chatService;

  @Autowired
  private SimpMessagingTemplate simpMessagingTemplate;

  @MessageMapping("/rooms/{roomId}/join")
  @SendToUser("/queue/responses")
  public JoinRoomResponse handleJoinRoom(@DestinationVariable String roomId, StompHeaderAccessor headerAccessor, Principal principal) {
    System.out.println("Join attempt - principal: " + principal.getName() + " Room: " + roomId);

    try {
      chatService.joinRoom(principal, roomId);
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
  public CreateRoomResponse handleCreateRoom(StompHeaderAccessor headerAccessor, Principal principal) {
    System.out.println("Room create attempt - principal: " + principal);

    try {
      String roomId = chatService.createRoom(principal);
      System.out.println("Room created: " + roomId + " by " + principal.getName());
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

package wiktochat.roomserver;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RestController;

import jakarta.annotation.PostConstruct;

@RestController
@CrossOrigin
public class ChatController {

    @Autowired
    private ChatService chatService;

    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    @PostConstruct
    public void init() {
        String roomID = chatService.generateRoomId();
        this.chatService.createRoom(roomID);
    }

    @MessageMapping("/room.join/{roomId}")
    public void handleJoinRoom(@DestinationVariable String roomId, StompHeaderAccessor headerAccessor) {
        String sessionId = headerAccessor.getSessionId();
        System.out.println("Join attempt - Session: " + sessionId + " Room: " + roomId);
        chatService.joinRoom(sessionId, roomId);
        
        System.out.println("Broadcasting join message to room: " + roomId);
        messagingTemplate.convertAndSend("/topic/room/" + roomId,
            new ChatMessage("System", "User joined the room"));
    }

    @GetMapping("/api/rooms/{roomId}")
    public ChatRoom getRoomData(@PathVariable String roomId) {
        return chatService.getRoomData(roomId);
    }

    @MessageMapping("/chat.send")
    @SendTo("/topic/messages")
    public void sendMessage(String username, String message) {
        chatService.sendMessage(username, message);
    }
}

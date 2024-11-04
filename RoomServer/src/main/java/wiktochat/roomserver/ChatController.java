package wiktochat.roomserver;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.web.bind.annotation.*;

@RestController
@CrossOrigin
public class ChatController {

    @Autowired
    private ChatService chatService;

    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    @PostMapping("/api/rooms")
    public String createRoom(@RequestParam String username) {
        return chatService.createRoom(username);
    }

    @PostMapping("/api/rooms/{roomId}/join")
    public void joinRoom(@PathVariable String roomId, @RequestParam String username) {
        chatService.joinRoom(roomId, username);
        // Notify other users about new join
        messagingTemplate.convertAndSend("/topic/room/" + roomId,
            new ChatMessage("System", username + " joined the room"));
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

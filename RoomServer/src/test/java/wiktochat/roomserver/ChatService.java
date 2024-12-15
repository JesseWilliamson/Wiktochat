package wiktochat.roomserver;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

@SpringBootTest
class ChatServiceTest {
    @Autowired
    private ChatService chatService;

    @Test
    void testRoomJoinAndMessage() {
//        // Create a room
//        String roomId = chatService.createRoom("TEST123");
//
//        // Join room
//        String sessionId = "test-session-1";
//        chatService.joinRoom(sessionId, roomId);
//
//        // Verify room exists
//        ChatRoom room = chatService.getRoomData(roomId);
//        assertNotNull(room);
//        assertEquals(roomId, room.getRoomId());
    }
}

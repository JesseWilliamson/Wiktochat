package com.wiktochat;

import io.micronaut.http.MediaType;
import io.micronaut.http.annotation.*;
import io.micronaut.http.HttpResponse;
import jakarta.inject.Inject;
import jakarta.inject.Singleton;
import java.util.List;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@Singleton
@Controller("/rooms")
public class ChatController {

    private static final Logger LOG = LoggerFactory.getLogger(ChatController.class);
    private final ChatService chatService;

    @Inject
    public ChatController(ChatService chatService) {
        this.chatService = chatService;
    }

    @Post(uri = "/", consumes = MediaType.APPLICATION_JSON)
    public HttpResponse<CreateRoomResponse> createRoom(@Body String sessionId) {
        try {
            String roomId = chatService.createRoom(sessionId);
            return HttpResponse.ok(new CreateRoomResponse(true, "Room created", roomId));
        } catch (Exception e) {
            return HttpResponse.badRequest(new CreateRoomResponse(false, "Failed to create room: " + e.getMessage(), null));
        }
    }

    @Post(uri = "/{roomId}/members", consumes = MediaType.APPLICATION_JSON)
    public HttpResponse<?> joinRoom(@Body String sessionId, @PathVariable String roomId) {
        try {
            System.out.println("Join attempt - sessionId: " + sessionId + " Room: " + roomId);
            chatService.joinRoom(sessionId, roomId);
            return HttpResponse.ok();
        } catch (RoomNotFoundException e) {
            return HttpResponse.notFound();
        } catch (Exception e) {
            return HttpResponse.badRequest();
        }
    }

    @Post(uri = "/{roomId}/messages", consumes = MediaType.APPLICATION_JSON)
    public HttpResponse<?> sendMessage(@Body IncomingGridMessage incomingGridMessage, @PathVariable String roomId) {
        try {
            System.out.println("Send message - Room: " + roomId + " Message: " + incomingGridMessage);
            GridMessage message = new GridMessage(incomingGridMessage);
            chatService.sendMessage(roomId, message);
            return HttpResponse.ok();
        } catch (RoomNotFoundException e) {
            return HttpResponse.notFound();
        } catch (Exception e) {
            return HttpResponse.badRequest();
        }
    }

    @Get(uri = "/{roomId}/messages", produces = MediaType.APPLICATION_JSON)
    public HttpResponse<List<GridMessage>> getMessages(@PathVariable String roomId) {
        try {
            System.out.println("Get messages - Room: " + roomId);
            return HttpResponse.ok(chatService.getMessages(roomId));
        } catch (RoomNotFoundException e) {
            return HttpResponse.notFound();
        }
    }

    @Get(uri = "/{roomId}/info", produces = MediaType.APPLICATION_JSON)
    public ChatRoom getRoomData(@PathVariable String roomId) {
        return chatService.getRoomData(roomId);
    }
}

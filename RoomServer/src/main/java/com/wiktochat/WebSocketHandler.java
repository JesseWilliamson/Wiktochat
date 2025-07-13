package com.wiktochat;

import io.micronaut.websocket.WebSocketSession;
import io.micronaut.websocket.annotation.*;
import io.micronaut.core.async.publisher.Publishers;
import org.reactivestreams.Publisher;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import jakarta.inject.Inject;
import jakarta.inject.Singleton;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.function.Consumer;

@Singleton
@ServerWebSocket("/ws/chat/{roomId}")
public class WebSocketHandler implements AutoCloseable {
    private static final Logger LOG = LoggerFactory.getLogger(WebSocketHandler.class);
    private final Map<String, WebSocketSession> sessions = new ConcurrentHashMap<>();
    private final ChatService chatService;
    private final Map<String, Consumer<GridMessage>> messageConsumers = new ConcurrentHashMap<>();

    @Inject
    public WebSocketHandler(ChatService chatService) {
        this.chatService = chatService;
    }

    @OnOpen
    public Publisher<Void> onOpen(String roomId, WebSocketSession session) {
        String sessionId = session.getId();
        sessions.put(sessionId, session);
        LOG.info("WebSocket opened for room: {}, session: {}", roomId, sessionId);
        
        try {
            // Add user to the room
            chatService.joinRoom(sessionId, roomId);
            LOG.info("User {} successfully joined room {}", sessionId, roomId);
            
            // Register message consumer
            Consumer<GridMessage> messageConsumer = message -> {
                if (session.isOpen()) {
                    session.sendAsync(message);
                }
            };

            messageConsumers.put(sessionId, messageConsumer);
            chatService.subscribeToRoom(roomId, messageConsumer);
            LOG.info("Message consumer registered for user {} in room {}", sessionId, roomId);

            // Send message history to the new client
            for (GridMessage message : chatService.getMessages(roomId)) {
                session.sendAsync(message);
            }
            LOG.info("Sent message history to user {} in room {}", sessionId, roomId);
            
        } catch (Exception e) {
            LOG.error("Error during WebSocket connection setup for room: {}, session: {}", roomId, sessionId, e);
            return Publishers.empty();
        }

        return Publishers.empty();
    }

    @OnMessage
    public Publisher<Void> onMessage(String roomId, IncomingGridMessage message, WebSocketSession session) {
        String messageSessionId = message.getSenderSessionId();
        String socketSessionId = session.getId();
        
        LOG.info("Received message from session {} (socket: {}) in room {}: {}", 
                messageSessionId, socketSessionId, roomId, message);

        try {
            // Ensure the user is in the room with their message session ID
            if (!chatService.isUserInRoom(messageSessionId, roomId)) {
                LOG.info("Adding user {} to room {} based on message session", messageSessionId, roomId);
                chatService.joinRoom(messageSessionId, roomId);
            }
            
            // Forward the message to the chat service
            chatService.sendMessage(roomId, message);
        } catch (Exception e) {
            LOG.error("Error processing message: {}", e.getMessage(), e);
        }
        return Publishers.empty();
    }

    @OnClose
    public void onClose(String roomId, WebSocketSession session) {
        String sessionId = session.getId();
        Consumer<GridMessage> consumer = messageConsumers.remove(sessionId);
        if (consumer != null) {
            chatService.unsubscribeFromRoom(roomId, consumer);
        }
        sessions.remove(sessionId);
        LOG.info("WebSocket closed for room: {}, session: {}", roomId, sessionId);
    }

    @OnError
    public void onError(String roomId, WebSocketSession session, Throwable error) {
        String sessionId = session.getId();
        LOG.error("WebSocket error in room: {}, session: {}", roomId, sessionId, error);
        onClose(roomId, session);
    }

    @Override
    public void close() {
        // Clean up all resources when the bean is destroyed
        for (Map.Entry<String, Consumer<GridMessage>> entry : messageConsumers.entrySet()) {
            String sessionId = entry.getKey();
            WebSocketSession session = sessions.get(sessionId);
            if (session != null) {
                try {
                    session.close();
                } catch (Exception e) {
                    LOG.warn("Error closing WebSocket session: {}", sessionId, e);
                }
            }
        }
        sessions.clear();
        messageConsumers.clear();
    }
}

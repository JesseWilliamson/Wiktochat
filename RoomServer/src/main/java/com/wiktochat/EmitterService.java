package com.wiktochat;

import jakarta.inject.Singleton;

@Singleton
public class EmitterService {
    // SSE logic using Micronaut's Publisher-based SSE endpoints
    // Uses a simple PublishProcessor per room for demonstration purposes
    private final java.util.concurrent.ConcurrentHashMap<String, java.util.concurrent.SubmissionPublisher<GridMessage>> roomPublishers = new java.util.concurrent.ConcurrentHashMap<>();

    public java.util.concurrent.Flow.Publisher<GridMessage> subscribeToRoom(String roomId, String sessionId) {
        return roomPublishers.computeIfAbsent(roomId, id -> new java.util.concurrent.SubmissionPublisher<>());
    }

    public void sendMessage(String roomId, Object message) {
        if (message instanceof GridMessage) {
            java.util.concurrent.SubmissionPublisher<GridMessage> publisher = roomPublishers.get(roomId);
            if (publisher != null) {
                publisher.submit((GridMessage) message);
            }
        }
    }
}

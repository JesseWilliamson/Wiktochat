package wiktochat.roomserver;

import java.time.LocalDateTime;

public class ChatMessage {
    private String sender;
    private String content;
    private LocalDateTime timestamp;

    public ChatMessage(String sender, String content) {
        this.sender = sender;
        this.content = content;
        this.timestamp = LocalDateTime.now();
    }

    // Getters
    public String getSender() { return sender; }
    public String getContent() { return content; }
    public LocalDateTime getTimestamp() { return timestamp; }
}

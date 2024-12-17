package wiktochat.roomserver;

import java.security.Principal;

public class ChatMessage {
    private Principal sender;
    private String content;

    public ChatMessage(Principal sender, String content) {
        this.sender = sender;
        this.content = content;
    }

    public ChatMessage(String content) { this.content = content; }

    public Principal getSender() {
        return sender;
    }

    public void setSender(Principal sender) {
        this.sender = sender;
    }

    public String getContent() {
        return content;
    }

    public void setContent(String content) {
        this.content = content;
    }

    @Override
    public String toString() {
        return "ChatMessage{" +
                "sender='" + sender + '\'' +
                ", content='" + content + '\'' +
                '}';
    }
}

package com.wiktochat;

public class ChatMessage {
  private String senderSessionId;
  private String content;

  public ChatMessage(String sender, String content) {
    this.senderSessionId = sender;
    this.content = content;
  }

  public ChatMessage(String content) {
    this.content = content;
  }

  public String getSenderSessionId() {
    return senderSessionId;
  }

  public void setSenderSessionId(String sender) {
    this.senderSessionId = sender;
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
      "sender='" + senderSessionId + '\'' +
      ", content='" + content + '\'' +
      '}';
  }
}

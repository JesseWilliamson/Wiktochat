package com.wiktochat;

public class CreateSessionIdResponse {
  private final String sessionId;

  public CreateSessionIdResponse(String sessionId) {
    this.sessionId = sessionId;
  }

  public String getSessionId() {
    return sessionId;
  }
}

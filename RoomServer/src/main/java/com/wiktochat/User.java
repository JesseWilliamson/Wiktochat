package com.wiktochat;

public class User {
  private String username;

  public User() {
  }

  public String getUsername() {
    return username;
  }

  public void setUsername(String username) {
    this.username = username;
  }

  @Override
  public String toString() {
    return "User [username=" + username + "]";
  }
}

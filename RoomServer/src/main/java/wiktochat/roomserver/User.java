package wiktochat.roomserver;

import java.util.ArrayList;
import java.util.HashSet;

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
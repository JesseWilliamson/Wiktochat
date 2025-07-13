package com.wiktochat;

import io.micronaut.core.annotation.Introspected;
import io.micronaut.serde.annotation.Serdeable;

@Introspected
@Serdeable
public class CreateRoomResponse {
    public boolean success;
    public String message;
    public String roomId;

    public CreateRoomResponse(boolean success, String message, String roomId) {
        this.success = success;
        this.message = message;
        this.roomId = roomId;
    }
}

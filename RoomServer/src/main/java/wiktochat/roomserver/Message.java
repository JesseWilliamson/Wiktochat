package wiktochat.roomserver;

import java.util.Date;

public abstract class Message {
    private String senderSessionId;
    private Date timestamp;

    protected Message(String senderSessionId, Date timestamp) {
        this.senderSessionId = senderSessionId;
        this.timestamp = timestamp;
    }

    protected Message() {
        this.senderSessionId = "";
        this.timestamp = new Date();
    }

    public String getSenderSessionId() {
        return senderSessionId;
    }

    public void setSenderSessionId(String senderSessionId) {
        this.senderSessionId = senderSessionId;
    }

    public Date getTimestamp() {
        return timestamp;
    }

    public void setTimestamp(Date timestamp) {
        this.timestamp = timestamp;
    }

    public abstract Object getData();
} 

package wiktochat.roomserver;

import java.util.Date;

public class GridMessage {
    private String[][] grid;
    private String senderSessionId;
    private Date timeStamp;

    public GridMessage(String[][] grid, String senderSessionId, Date timestamp) {
        this.grid = grid.clone();
        this.senderSessionId = senderSessionId;
        this.timeStamp = timestamp;
    }

    public String[][] getGrid() {
        return grid.clone();
    }
    public String getSenderSessionId() { return senderSessionId; }
    public Date getTimeStamp() { return timeStamp; }
}

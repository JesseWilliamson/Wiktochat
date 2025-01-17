package wiktochat.roomserver;

import java.util.Date;
import java.util.UUID;

public class  GridMessage {
    private String[][] grid;
    private String senderSessionId;
    private Date timeStamp;
    private String id;

    public GridMessage(String[][] grid, String senderSessionId, Date timestamp) {
        this.grid = grid.clone();
        this.senderSessionId = senderSessionId;
        this.timeStamp = timestamp;
        this.id = UUID.randomUUID().toString();
    }

    public GridMessage(IncomingGridMessage incomingGridMessage) {
      this.grid = incomingGridMessage.getGrid();
      this.senderSessionId = incomingGridMessage.getSenderSessionId();
      this.timeStamp = incomingGridMessage.getTimeStamp();
      this.id = UUID.randomUUID().toString();
    }

    public String[][] getGrid() {
        return grid.clone();
    }
    public String getSenderSessionId() { return senderSessionId; }
    public Date getTimeStamp() { return timeStamp; }
  public String getId() { return id; }
}

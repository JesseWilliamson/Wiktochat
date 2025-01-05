package wiktochat.roomserver;

import java.util.Date;

public class GridMessage extends Message {
    private String[][] grid;

    public GridMessage(String[][] grid, String senderSessionId, Date timestamp) {
        super(senderSessionId, timestamp);
        this.grid = grid.clone();
    }

    public GridMessage() {
        super();
        this.grid = new String[0][0];
    }

    public String[][] getGrid() {
        return grid.clone();
    }

    public void setGrid(String[][] grid) {
        this.grid = grid.clone();
    }

    @Override
    public String[][] getData() {
        return getGrid();
    }
} 

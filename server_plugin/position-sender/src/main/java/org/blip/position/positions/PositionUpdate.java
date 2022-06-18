package org.blip.position.positions;

import java.util.HashMap;

public class PositionUpdate {
    public final String type = "PositionUpdate";

    public HashMap<String, Position> positions;

    public PositionUpdate(HashMap<String, Position> positions) {
        this.positions = positions;
    }
}

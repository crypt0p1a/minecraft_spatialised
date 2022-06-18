package org.blip.position.positions;

import java.util.HashMap;

public class SendUUID {
    public String type = "SendUUID";

    public String requestID;

    public String uuid;

    public SendUUID(String requestID, String uuid) {
        this.requestID = requestID;
        this.uuid = uuid;
    }
}

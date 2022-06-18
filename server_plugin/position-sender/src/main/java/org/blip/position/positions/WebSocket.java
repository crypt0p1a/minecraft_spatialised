package org.blip.position.positions;

import org.java_websocket.client.WebSocketClient;
import org.java_websocket.handshake.ServerHandshake;

import java.net.URI;
import java.net.URISyntaxException;
import java.util.logging.Level;
import java.util.logging.Logger;

public class WebSocket {

    private final Logger logger;
    private WebSocketClient socket;
    private String waiting;
    private OnMessage onMessage;
    private Thread thread;

    private int _id = 0;
    private String url;

    public WebSocket(String url, Logger logger, OnMessage onMessage) throws URISyntaxException {
        this.url = url;
        this.logger = logger;
        this.onMessage = onMessage;

        createSocket();
    }

    private boolean canConnect = true;

    private void createSocket() throws URISyntaxException {
        if (_id == -1 || !canConnect) return;

        canConnect = false;

        if (null != socket && socket.isOpen()) {
            return;
        }

        _id ++;
        socket = new WebSocketClient(new URI(url)) {
            @Override
            public void onOpen(ServerHandshake handshakedata) {
                logger.log(Level.INFO, "onOpen");
                if (null != waiting) socket.send(waiting);
                canConnect = true;
            }

            @Override
            public void onMessage(String message) {
                logger.log(Level.INFO, "message received : " + message);
                onMessage.apply(message);
            }

            @Override
            public void onClose(int code, String reason, boolean remote) {
                logger.log(Level.SEVERE, code + " " + reason);
                canConnect = true;
                internalRetry();
            }

            @Override
            public void onError(Exception ex) {
                logger.log(Level.SEVERE, ex.getMessage(), ex);
                canConnect = true;
                internalRetry();
            }
        };
        socket.connect();
    }

    private void internalRetry() {
        try {
            close();
            _id = 0;
            createSocket();
        } catch(Throwable throwable) {
            throwable.printStackTrace();
            close();
        }
    }

    public void post(String message) {
        if (!socket.isOpen()) {
            logger.log(Level.SEVERE, "Not opened, putting in cache " + message);
            this.waiting = message;
            return;
        }

        socket.send(message);
    }

    public void close() {
        _id = -1;
        try {
            socket.close();
        } catch(Throwable throwable) {
            throwable.printStackTrace();
        }
    }

    public interface OnMessage {
        void apply(String message);
    }
}

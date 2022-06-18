package org.blip.position;

import com.google.gson.Gson;
import com.google.gson.GsonBuilder;

import org.blip.position.positions.Position;
import org.blip.position.positions.PositionUpdate;
import org.blip.position.positions.RequestUUID;
import org.blip.position.positions.SendUUID;
import org.blip.position.positions.WebSocket;
import org.bukkit.Bukkit;
import org.bukkit.Location;
import org.bukkit.entity.Player;
import org.bukkit.scheduler.BukkitScheduler;

import java.net.URISyntaxException;
import java.util.HashMap;
import java.util.logging.Level;
import java.util.logging.Logger;

public class ApiFetchThread {

    private final static int MILLISECOND_500 = 10;
    private WebSocket webSocket;
    private final Gson gson;
    private BukkitScheduler scheduler;
    private Runnable next;

    private Runnable runner;
    private Logger logger;

    private GetUUID getUUID;

    public ApiFetchThread(
            String url,
            PositionSenderPlugin plugin,
            Logger logger,
            GetUUID getUUID) throws URISyntaxException {
        this.scheduler = Bukkit.getScheduler();
        this.logger = logger;
        this.webSocket = new WebSocket(url, logger, this::onMessageReceived);
        this.getUUID = getUUID;

        gson = new GsonBuilder().create();

        next = () -> {
            if (null != scheduler) scheduler.runTaskAsynchronously(plugin, runner);
        };

        runner = () -> {
            HashMap<String, Position> positions = new HashMap<>();

            for (Player player : Bukkit.getOnlinePlayers()) {
                Location eye = player.getEyeLocation();
                positions.put(player.getUniqueId().toString(), new Position(player.getEyeLocation()));
            }

            String message = gson.toJson(new PositionUpdate(positions));
            if (null != webSocket) webSocket.post(message);
            if (next == null) return;
            scheduler.runTaskLater(plugin, next, MILLISECOND_500);
        };
    }

    private void onMessageReceived(String message) {
        RequestUUID object = gson.fromJson(message, RequestUUID.class);
        log("message received for type " + object);
        String uuid = getUUID.get(object.code);
        if (null != uuid) {
            SendUUID sendUUID = new SendUUID(object.id, uuid);
            webSocket.post(gson.toJson(sendUUID));
        }
    }

    public void start() {
        next.run();
    }

    public void stop() {
        webSocket.close();
        webSocket = null;
        next = null;
    }

    private void log(String log) {
        if (null == logger) return;

        logger.log(Level.INFO, log);
    }

    public interface GetUUID {
        String get(String code);
    }
}

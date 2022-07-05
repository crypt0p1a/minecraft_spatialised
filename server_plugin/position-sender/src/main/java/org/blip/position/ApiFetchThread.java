package org.blip.position;

import com.google.gson.Gson;
import com.google.gson.GsonBuilder;

import org.blip.position.positions.Position;
import org.blip.position.positions.PositionUpdate;
import org.blip.position.positions.RequestUUID;
import org.blip.position.positions.SendUUID;
import org.blip.position.positions.WebSocket;
import org.blip.position.room.Room;
import org.bukkit.Bukkit;
import org.bukkit.Location;
import org.bukkit.entity.Player;
import org.bukkit.scheduler.BukkitScheduler;

import java.net.URISyntaxException;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.concurrent.ConcurrentLinkedQueue;
import java.util.logging.Level;
import java.util.logging.Logger;

public class ApiFetchThread {

    private final static int MILLISECOND_500 = 10;
    private WebSocket webSocket;
    private final Gson gson;
    private final BukkitScheduler scheduler;
    private Runnable next;

    private Runnable runner;
    private final Logger logger;

    private final GetUUID getUUID;
    private final GetScale getScale;

    public ApiFetchThread(
            String url,
            PositionSenderPlugin plugin,
            Logger logger,
            GetUUID getUUID,
            GetScale getScale,
            GetRooms getRooms) throws URISyntaxException {
        this.scheduler = Bukkit.getScheduler();
        this.logger = logger;
        this.webSocket = new WebSocket(url, logger, this::onMessageReceived);
        this.getUUID = getUUID;
        this.getScale = getScale;

        gson = new GsonBuilder().create();

        next = () -> {
            if (null != scheduler) scheduler.runTaskAsynchronously(plugin, runner);
        };

        runner = () -> {
            HashMap<String, Position> positions = new HashMap<>();

            ConcurrentLinkedQueue<Room> rooms = getRooms.get();

            for (Player player : Bukkit.getOnlinePlayers()) {
                String uuid = player.getUniqueId().toString();
                Location eye = player.getEyeLocation();
                float scale = getScale.get(uuid);
                List<String> inRooms = new ArrayList<>();
                System.out.println("sending y " + eye.getX() + "/" + eye.getY() + "/" + eye.getZ());
                for (Room room : rooms) {
                    if (room.isInRoom(player)) inRooms.add(room.id());
                }
                positions.put(uuid, new Position(eye, scale, inRooms));
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

    public interface GetScale {
        float get(String uuid);
    }

    public interface GetRooms {
        ConcurrentLinkedQueue<Room> get();
    }
}

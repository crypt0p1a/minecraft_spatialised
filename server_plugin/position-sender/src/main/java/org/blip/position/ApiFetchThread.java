package org.blip.position;

import com.google.gson.Gson;
import com.google.gson.GsonBuilder;

import org.blip.position.positions.Position;
import org.blip.position.positions.PositionUpdate;
import org.blip.position.positions.RequestUUID;
import org.blip.position.positions.SendUUID;
import org.blip.position.positions.WebSocket;
import org.blip.position.room.Room;
import org.blip.position.room.RoomManager;
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
import java.util.stream.Collectors;

public class ApiFetchThread {

    private final static int MILLISECOND_500 = 10;
    private final RoomManager roomManager;
    private WebSocket webSocket;
    private final Gson gson;
    private final BukkitScheduler scheduler;
    private Runnable next;

    private Runnable runner;
    private final Logger logger;

    private final GetUUID getUUID;
    private final GetScale getScale;

    private HashMap<String, List<Room>> roomsForParticipant = new HashMap<>();

    public ApiFetchThread(
            String url,
            PositionSenderPlugin plugin,
            Logger logger,
            RoomManager roomManager,
            GetUUID getUUID,
            GetScale getScale) throws URISyntaxException {
        this.scheduler = Bukkit.getScheduler();
        this.logger = logger;
        this.webSocket = new WebSocket(url, logger, this::onMessageReceived);
        this.roomManager = roomManager;
        this.getUUID = getUUID;
        this.getScale = getScale;

        gson = new GsonBuilder().create();

        next = () -> {
            if (null != scheduler) scheduler.runTaskAsynchronously(plugin, runner);
        };

        runner = () -> {
            HashMap<String, Position> positions = new HashMap<>();

            ConcurrentLinkedQueue<Room> rooms = roomManager.getRooms();

            for (Player player : Bukkit.getOnlinePlayers()) {
                String uuid = player.getUniqueId().toString();
                String name = player.getName();
                Location eye = player.getEyeLocation();
                float scale = getScale.get(uuid);

                List<Room> list = roomsForParticipant.computeIfAbsent(uuid, k -> new ArrayList<>());

                // now for the rooms that this participant was into (or none), we check if they left said rooms
                List<Room> left = list.stream().filter(room -> !rooms.contains(room) || !room.isInRoom(player))
                        .collect(Collectors.toList());
                for (Room room : left) {
                    player.sendMessage("You're leaving the room " + room.getName());
                    list.remove(room);
                }

                // now manages every rooms existing but not in the local list
                List<Room> containing = rooms.stream().filter(room -> room.isInRoom(player) && !list.contains(room))
                        .collect(Collectors.toList());

                for (Room room : containing) {
                    player.sendMessage("You're entering the room " + room.getName());
                    list.add(room);
                }

                // transform the rooms for the participant to string
                List<String> inRooms = list.stream().map(Room::getName).collect(Collectors.toList());

                positions.put(uuid, new Position(name, eye, scale, inRooms));
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
}

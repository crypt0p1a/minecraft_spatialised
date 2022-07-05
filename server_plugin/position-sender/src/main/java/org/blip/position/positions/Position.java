package org.blip.position.positions;

import org.bukkit.Location;

import java.util.List;

public class Position {
    double x;
    double y;
    double z;
    float yaw;
    float pitch;
    float scale;
    List<String> rooms;

    public Position(double x, double y, double z, float yaw, float pitch, float scale, List<String> rooms) {
        this.x = x;
        this.y = y;
        this.z = z;
        this.yaw = yaw;
        this.pitch = pitch;
        this.scale = scale;
        this.rooms = rooms;
    }

    public Position(Location loc, float scale, List<String> rooms) {
        this(loc.getX(), loc.getY(), loc.getZ(), loc.getYaw(), loc.getPitch(), scale, rooms);
    }
}

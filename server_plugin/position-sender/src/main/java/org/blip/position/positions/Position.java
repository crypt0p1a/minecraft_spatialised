package org.blip.position.positions;

import org.bukkit.Location;

public class Position {
    double x;
    double y;
    double z;
    float yaw;
    float pitch;

    public Position(double x, double y, double z, float yaw, float pitch) {
        this.x = x;
        this.y = y;
        this.z = z;
        this.yaw = yaw;
        this.pitch = pitch;
    }

    public Position(Location loc) {
        this(loc.getX(), loc.getY(), loc.getY(), loc.getYaw(), loc.getPitch());
    }
}

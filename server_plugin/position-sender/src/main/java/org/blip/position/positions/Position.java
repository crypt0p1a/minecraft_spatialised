package org.blip.position.positions;

import org.bukkit.Location;

public class Position {
    double x;
    double y;
    double z;
    float yaw;
    float pitch;
    float scale;

    public Position(double x, double y, double z, float yaw, float pitch, float scale) {
        this.x = x;
        this.y = y;
        this.z = z;
        this.yaw = yaw;
        this.pitch = pitch;
        this.scale = scale;
    }

    public Position(Location loc, float scale) {
        this(loc.getX(), loc.getY(), loc.getY(), loc.getYaw(), loc.getPitch(), scale);
    }
}

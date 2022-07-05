package org.blip.position.room;

import org.bukkit.Location;
import org.bukkit.entity.Player;

public class Coordinate {

    public final int x;
    public final int y;
    public final int z;

    public Coordinate(int x, int y, int z) {
        this.x = x;
        this.y = y;
        this.z = z;
    }

    @Override
    public String toString() {
        return "Coordinate{" +
                "x=" + x +
                ", y=" + y +
                ", z=" + z +
                "}\n";
    }

    private boolean isDelta(int left, int right, int delta) {
        return Math.abs(left - right) <= delta;
    }

    public boolean contains(Player player) {
        Location location = player.getLocation();
        //System.out.println(location.getBlockX() + "/" + x
        //        + " " + location.getBlockZ() + "/" + z
        //        + " " + isDelta(location.getBlockY(), y, 3));
        return location.getBlockX() == x
                && location.getBlockZ() == z
                && isDelta(location.getBlockY(), y, 3);
    }
}

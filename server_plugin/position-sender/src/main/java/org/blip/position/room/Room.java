package org.blip.position.room;

import org.bukkit.World;
import org.bukkit.block.Block;
import org.bukkit.entity.Player;

import java.util.Arrays;
import java.util.List;
import java.util.Objects;
import java.util.UUID;
import java.util.concurrent.ConcurrentLinkedQueue;

public class Room {

    private final String id;
    private String name;
    private String world;
    private ConcurrentLinkedQueue<Coordinate> coordinates = new ConcurrentLinkedQueue<>();
    private Coordinate origin;

    Room(String name, String world, int x, int y, int z) {
        this(UUID.randomUUID().toString(), name, world, x, y, z);
    }

    Room(String id, String name, String world, int x, int y, int z) {
        this.id = id;
        this.name = name;
        this.world = world;
        origin = new Coordinate(x, y, z);
    }

    public String id() {
        return id;
    }

    public void addBlocks(List<Block> around) {
        for (Block block : around) addBlock(block.getX(), block.getY(), block.getZ());
    }

    public void addBlock(int x, int y, int z) {
        coordinates.add(new Coordinate(x, y, z));
    }

    public Coordinate getOrigin() {
        return origin;
    }

    public boolean isSameWorld(World world) {
        return null != world && world.getUID().equals(world.getUID());
    }

    public boolean isInRoom(Player player) {
        if (!isSameWorld(player.getWorld())) return false;
        for (Coordinate coordinate : coordinates) {
            if (coordinate.contains(player)) {
                return true;
            }
        }

        return false;
    }

    @Override
    public String toString() {
        return "Room{" +
                "world=" + world +
                ", coordinates=" + Arrays.toString(coordinates.toArray()) +
                '}';
    }

    public String getName() {
        return name;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        Room room = (Room) o;
        return null != id && Objects.equals(id, room.id);
    }

    @Override
    public int hashCode() {
        return Objects.hash(id);
    }
}

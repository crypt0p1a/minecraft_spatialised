package org.blip.position.room;

import com.njkremer.Sqlite.DataConnectionException;
import com.njkremer.Sqlite.SqlStatement;

import org.blip.position.room.db.DBRoom;
import org.bukkit.Bukkit;
import org.bukkit.World;
import org.bukkit.block.Block;

import java.util.List;
import java.util.UUID;
import java.util.concurrent.ConcurrentLinkedQueue;

public class RoomManager {

    private ConcurrentLinkedQueue<Room> rooms = new ConcurrentLinkedQueue<>();

    public RoomManager() {
        try {
            List<DBRoom> rooms = SqlStatement.select(DBRoom.class).getList();

            for (DBRoom room : rooms) {
                Room memory = new Room(room.getUuid(),
                        room.getName(),
                        room.getWorld(),
                        room.getX(),
                        room.getY(),
                        room.getZ());

                World world = Bukkit.getWorld(UUID.fromString(room.getWorld()));

                if (null != world) {
                    manageBlocks(memory, world);
                    this.rooms.add(memory);
                }
            }
        } catch (DataConnectionException e) {
            e.printStackTrace();
        }
    }

    public Room create(String name, World world, int x, int y, int z) {
        Room room = new Room(name, world.getUID().toString(), x, y, z);
        DBRoom dbRoom = new DBRoom();
        dbRoom.setUuid(room.id());
        dbRoom.setName(name);
        dbRoom.setWorld(world.getUID().toString());
        dbRoom.setX(x);
        dbRoom.setY(y);
        dbRoom.setZ(z);
        try {
            SqlStatement.insert(dbRoom).execute();
        } catch (DataConnectionException e) {
            e.printStackTrace();
        }
        rooms.add(room);
        return room;
    }


    public ConcurrentLinkedQueue<Room> getRooms() {
        return rooms;
    }

    public void manageBlocks(Room room, World world) {
        SpreadGatherer spreadGatherer = new SpreadGatherer(world);
        List<Block> around = spreadGatherer.around(room.getOrigin().x,
                room.getOrigin().y,
                room.getOrigin().z);

        room.addBlocks(around);
    }
}

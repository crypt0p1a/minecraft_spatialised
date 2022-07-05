package org.blip.position.commands;

import org.blip.position.room.Room;
import org.blip.position.room.SpreadGatherer;
import org.bukkit.ChatColor;
import org.bukkit.Location;
import org.bukkit.World;
import org.bukkit.block.Block;
import org.bukkit.command.Command;
import org.bukkit.command.CommandSender;
import org.bukkit.entity.Player;

import java.util.Arrays;
import java.util.Collections;
import java.util.List;

public class DolbyioRoomCommand extends RegisterableCommandExecutor {
    private final OnRoom onRoom;

    public DolbyioRoomCommand(OnRoom onRoom) {
        super("dolbyio-room");
        this.onRoom = onRoom;
    }

    protected final boolean onCommandExecute(CommandSender sender, Command command, String label, String[] args) {
        if (args.length == 0) {
            sender.sendMessage(ChatColor.RED + "Invalid command received");
            return false;
        }

        if ("create".equals(args[0]) && args.length == 2) {
            try {
                Player player = (Player) sender;
                World world = player.getWorld();


                Location location = player.getLocation();
                var x = location.getBlockX();
                var z = location.getBlockZ();
                var y = location.getBlockY();

                Room room = new Room(world, x, y, z);

                SpreadGatherer spreadGatherer = new SpreadGatherer(world);
                List<Block> around = spreadGatherer.around(x,y,z);

                room.addBlocks(around);
                System.out.println(room);

                onRoom.apply(room);
                sender.sendMessage(ChatColor.WHITE + "room set " + room.getOrigin());
                return true;
            } catch (Throwable throwable) {
                throwable.printStackTrace();
                sender.sendMessage(ChatColor.RED + "Unable to run this command");
                return false;
            }
        }

        return false;
    }

    @Override
    public List<String> onTabCompleteExecute(CommandSender sender, Command command, String label, String[] args) {
        if (args.length == 0) {
            return Arrays.asList("create");
        }

        if ("create".equals(args[0]) && args.length == 1) {
            return Collections.singletonList("name");
        }

        return null;
    }

    public interface OnRoom {
        void apply(Room room);
    }
}

package org.blip.position.commands;

import org.blip.position.room.Room;
import org.blip.position.room.RoomManager;
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
    private final RoomManager roomManager;

    public DolbyioRoomCommand(RoomManager roomManager) {
        super("dolbyio-room");
        this.roomManager = roomManager;
    }

    protected final boolean onCommandExecute(CommandSender sender, Command command, String label, String[] args) {
        if (args.length == 0) {
            sender.sendMessage(ChatColor.RED + "Invalid command received");
            return false;
        }

        if ("create".equals(args[0]) && args.length == 2) {
            try {
                String name = args[1];
                Player player = (Player) sender;
                World world = player.getWorld();


                Location location = player.getLocation();
                var x = location.getBlockX();
                var z = location.getBlockZ();
                var y = location.getBlockY();

                Room room = roomManager.create(name, world, x, y, z);

                roomManager.manageBlocks(room, world);
                System.out.println(room);

                sender.sendMessage(ChatColor.WHITE + "room set " + room.getName() + " " + room.getOrigin());
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
}

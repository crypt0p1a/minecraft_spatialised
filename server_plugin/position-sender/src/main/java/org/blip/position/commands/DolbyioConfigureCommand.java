package org.blip.position.commands;

import org.bukkit.ChatColor;
import org.bukkit.command.Command;
import org.bukkit.command.CommandSender;
import org.bukkit.entity.Player;

import java.util.Arrays;
import java.util.Collections;
import java.util.List;

public class DolbyioConfigureCommand extends RegisterableCommandExecutor {
    private final OnScale onScale;

    public DolbyioConfigureCommand(OnScale onScale) {
        super("dolbyio-configure");
        this.onScale = onScale;
    }

    protected final boolean onCommandExecute(CommandSender sender, Command command, String label, String[] args) {
        if (args.length == 0) {
            sender.sendMessage(ChatColor.RED + "Invalid command received");
            return false;
        }

        if ("scale".equals(args[0]) && args.length == 2) {
            try {
                Player player = (Player) sender;
                String uuid = player.getUniqueId().toString();

                float scale = Float.parseFloat(args[1]);

                onScale.apply(uuid, scale);
                sender.sendMessage(ChatColor.WHITE + "scale set to " + scale);
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
            return Arrays.asList("scale", "1");
        }

        if ("scale".equals(args[0]) && args.length == 1) {
            return Collections.singletonList("1");
        }

        return null;
    }

    public interface OnScale {
        void apply(String uuid, float scale);
    }
}

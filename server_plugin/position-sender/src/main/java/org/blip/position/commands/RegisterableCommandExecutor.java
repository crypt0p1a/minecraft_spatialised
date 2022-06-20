package org.blip.position.commands;

import org.bukkit.ChatColor;
import org.bukkit.command.Command;
import org.bukkit.command.CommandExecutor;
import org.bukkit.command.CommandSender;
import org.bukkit.command.TabCompleter;
import org.bukkit.entity.Player;
import org.bukkit.plugin.java.JavaPlugin;

import java.util.List;

public abstract class RegisterableCommandExecutor implements CommandExecutor, TabCompleter {

    protected String name;

    public RegisterableCommandExecutor(String name) {
        this.name = name;
    }

    public void registerInto(JavaPlugin plugin) {
        plugin.getCommand(name).setExecutor(this);
    }

    @Override
    public final boolean onCommand(CommandSender sender, Command command, String label, String[] args) {
        if (isInvalid(sender, command, label, args)) {
            return false;
        }

        return onCommandExecute(sender, command, label, args);
    }

    @Override
    public final List<String> onTabComplete(CommandSender sender, Command command, String label, String[] args) {
        if (isInvalid(sender, command, label, args)) {
            return null;
        }

        return onTabCompleteExecute(sender, command, label, args);
    }

    private boolean isInvalid(CommandSender sender, Command command, String label, String[] args) {
        if (!(sender instanceof Player)) {
            sender.sendMessage(ChatColor.RED + "You must be a player in order to execute this command.");
            return true;
        }

        if (null == label) {
            sender.sendMessage(ChatColor.RED + "Invalid command received");
            return true;
        }

        return !label.equals(name);
    }

    protected abstract List<String> onTabCompleteExecute(CommandSender sender, Command command, String label, String[] args);

    protected abstract boolean onCommandExecute(CommandSender sender, Command command, String label, String[] args);
}

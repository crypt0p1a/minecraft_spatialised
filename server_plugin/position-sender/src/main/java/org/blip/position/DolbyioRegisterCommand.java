package org.blip.position;

import org.bukkit.ChatColor;
import org.bukkit.command.Command;
import org.bukkit.command.CommandExecutor;
import org.bukkit.command.CommandSender;
import org.bukkit.entity.Player;

import java.util.Random;
import java.util.concurrent.ConcurrentHashMap;

public class DolbyioRegisterCommand implements CommandExecutor {

    private Random random = new Random();

    public String generateRandomString() {
        String values = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
        int targetStringLength = 6;

        String generatedString = random.ints(0, targetStringLength)
                .limit(targetStringLength)
                .collect(StringBuilder::new, (stringBuilder, value) -> stringBuilder.append(values.charAt(value)), StringBuilder::append)
                .toString();

        return generatedString;
    }

    private OnCode onCode;
    private GetCode getCode;

    public DolbyioRegisterCommand(OnCode onCode, GetCode getCode) {
        this.onCode = onCode;
        this.getCode = getCode;
    }

    @Override
    public boolean onCommand(CommandSender sender, Command command, String label, String[] args) {
        if (!(sender instanceof Player)) {
            sender.sendMessage(ChatColor.RED + "You must be a player in order to execute this command.");
            return true;
        }

        Player player = (Player) sender;
        String uuid = player.getUniqueId().toString();

        String code = getCode.get(uuid);
        if (null == code) {
            String generated = generateRandomString();
            onCode.apply(uuid, generated);
        }

        code = getCode.get(uuid);
        if (null != code) {
            sender.sendMessage("Please go to the website and use the following code : " + ChatColor.DARK_RED + code);
        }

        return true;
    }

    public interface OnCode {
        void apply(String uuid, String code);
    }

    public interface GetCode {
        String get(String uuid);
    }
}

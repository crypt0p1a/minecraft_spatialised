package org.blip.position.commands;

import org.bukkit.ChatColor;
import org.bukkit.command.Command;
import org.bukkit.command.CommandSender;
import org.bukkit.entity.Player;

import java.util.List;
import java.util.Random;

public class DolbyioRegisterCommand extends RegisterableCommandExecutor {

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
        super("dolbyio-register");
        this.onCode = onCode;
        this.getCode = getCode;
    }

    protected final boolean onCommandExecute(CommandSender sender, Command command, String label, String[] args) {
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

    @Override
    public List<String> onTabCompleteExecute(CommandSender sender, Command command, String label, String[] args) {
        return null;
    }

    public interface OnCode {
        void apply(String uuid, String code);
    }

    public interface GetCode {
        String get(String uuid);
    }
}

package org.blip.position.utils;

import org.blip.position.PositionSenderPlugin;
import org.bukkit.configuration.file.FileConfiguration;

public class Config {

    private static FileConfiguration config = null;

    public static FileConfiguration getConfig() {
        if (config == null)
            config = PositionSenderPlugin.getPlugin().getConfig();

        return config;
    }

    public static void reloadConfig() {
        config = PositionSenderPlugin.getPlugin()
                .saveSignsConfig().reloadSignsConfig().getConfig();
    }
}

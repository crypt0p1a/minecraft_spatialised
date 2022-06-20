package org.blip.position;


import org.blip.position.commands.DolbyioConfigureCommand;
import org.blip.position.commands.DolbyioRegisterCommand;
import org.blip.position.commands.RegisterableCommandExecutor;
import org.bukkit.command.Command;
import org.bukkit.command.CommandSender;
import org.bukkit.plugin.java.JavaPlugin;

import java.io.IOException;
import java.net.URISyntaxException;
import java.util.ArrayList;
import java.util.List;
import java.util.Properties;
import java.util.concurrent.ConcurrentHashMap;

public class PositionSenderPlugin extends JavaPlugin {

    private ConcurrentHashMap<String, Float> scales = new ConcurrentHashMap<>();
    private ConcurrentHashMap<String, String> codes = new ConcurrentHashMap<>();

    private static PositionSenderPlugin plugin;

    private ApiFetchThread thread;

    public PositionSenderPlugin() {
    }

    public static PositionSenderPlugin getPlugin() {
        return plugin;
    }

    public PositionSenderPlugin saveSignsConfig() {
        plugin.saveConfig();
        return this;
    }

    public PositionSenderPlugin reloadSignsConfig() {
        plugin.reloadConfig();
        return this;
    }

    private List<RegisterableCommandExecutor> commands = new ArrayList<>();

    @Override
    public void onEnable() {
        plugin = this;
        plugin.

                getLogger().info("dolbyio onEnable");

        try {
            String url = loadURLWebSocket();
            getLogger().info("url: " + url);

            thread = new ApiFetchThread(url, this, getLogger(), this::getUUID, this::getScale);
            thread.start();
        } catch (URISyntaxException | IOException e) {
            e.printStackTrace();
        }

        commands.add(new DolbyioRegisterCommand(
                codes::put,
                codes::get
        ));
        commands.add(new DolbyioConfigureCommand(
                scales::put
        ));

        for (RegisterableCommandExecutor executor : commands) {
            executor.registerInto(this);
        }
    }

    @Override
    public void onDisable() {
        commands.clear(); //no need to unregister as reenabling the plugin will reregister new ones

        getLogger().info("dolbyio onDisable");
        if (null != thread) {
            thread.stop();
            thread = null;
        }
        super.onDisable();
    }

    @Override
    public List<String> onTabComplete(CommandSender sender, Command command, String alias, String[] args) {
        if (null == alias || null == args) return null;

        for (RegisterableCommandExecutor executor : commands) {
            List<String> onTabComplete = executor.onTabComplete(sender, command, alias, args);
            if(null != onTabComplete) return onTabComplete;
        }

        return null;
    }

    public String loadURLWebSocket() throws IOException {
        Properties properties = new Properties();
        properties.load(getClass().getResourceAsStream("/server.properties"));
        String host = properties.getProperty("websocket_server_host");
        String port = properties.getProperty("websocket_server_port");

        return "ws://" + host + ":" + port;
    }

    private float getScale(String uuid) {
        if (null == uuid) return 1;
        Float scale = 1.f;
        if(scales.contains(uuid)) scale = scales.get(uuid);

        if(null != scale) return scale;
        return scale;
    }

    private String getUUID(String code) {
        if (null == code) return null;
        try {
            for (String uuid : codes.keySet()) {
                if (code.equals(codes.get(uuid))) return uuid;
            }
        } catch (Throwable throwable) {
            throwable.printStackTrace();
        }
        return null;
    }

}
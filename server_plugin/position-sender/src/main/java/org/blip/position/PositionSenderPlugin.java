package org.blip.position;


import org.blip.position.utils.Config;
import org.bukkit.plugin.java.JavaPlugin;

import java.io.IOException;
import java.net.URISyntaxException;
import java.util.Properties;
import java.util.concurrent.ConcurrentHashMap;

public class PositionSenderPlugin extends JavaPlugin {

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

    @Override
    public void onEnable() {
        plugin = this;

        getLogger().info("dolbyio onEnable");

        try {
            String url = loadURLWebSocket();
            getLogger().info("url: " + url);

            thread = new ApiFetchThread(url, this, getLogger(), this::getUUID);
            thread.start();
        } catch (URISyntaxException|IOException e) {
            e.printStackTrace();
        }

        getCommand("dolbyio-register").setExecutor(new DolbyioRegisterCommand(
                codes::put,
                codes::get
        ));
    }

    @Override
    public void onDisable() {
        getLogger().info("dolbyio onDisable");
        if (null != thread) {
            thread.stop();
            thread = null;
        }
        super.onDisable();
    }

    public String loadURLWebSocket() throws IOException {
        Properties properties = new Properties();
        properties.load(getClass().getResourceAsStream("/server.properties"));
        String host = properties.getProperty("websocket_server_host");
        String port = properties.getProperty("websocket_server_port");

        return "ws://" + host + ":" + port;
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
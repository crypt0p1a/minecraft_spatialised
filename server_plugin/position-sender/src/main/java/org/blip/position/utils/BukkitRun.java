package org.blip.position.utils;

import org.bukkit.plugin.Plugin;
import org.bukkit.scheduler.BukkitRunnable;

public class BukkitRun {

    private final BukkitRunnable runner;
    private Plugin plugin;

    public BukkitRun(Plugin plugin, Runnable runnable) {
        this.plugin = plugin;
        runner = new BukkitRunnable() {
            @Override
            public void run() {
                runnable.run();
            }
        };
    }

    public static void schedule(Plugin plugin, Runnable runnable) {
        new BukkitRun(plugin, runnable).run();
    }

    public void run() {
        runner.runTaskAsynchronously(plugin);
        plugin = null;
    }

}

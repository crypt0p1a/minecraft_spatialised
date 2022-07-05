package org.blip.position.room;

import org.bukkit.World;
import org.bukkit.block.Block;

import java.lang.ref.WeakReference;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

public class SpreadGatherer {

    private WeakReference<World> world;

    public SpreadGatherer(World world) {
        this.world = new WeakReference<>(world);
    }

    public List<Block> around(int x, int y, int z) {
        World world = this.world.get();
        if (null == world) return new ArrayList<>();
        List<Block> found = new ArrayList<>();
        List<Block> toScan = new ArrayList<>();
        List<Block> scanned = new ArrayList<>();

        Block first = world.getBlockAt(x, y, z);
        toScan.add(first);

        while (toScan.size() > 0) {
            Block block = toScan.remove(0); // remove and get
            if (null == block || distance(block, first) >= 3) continue;

            scanned.add(block);

            if (!block.getType().isAir()) {
                continue;
            }

            // the block found is air, we post it for consumption
            if (!isIn(found, block)) found.add(block);

            // first add all surrounding blocks
            List<Block> aroundThisBlock = around(block, world);
            for (Block around : aroundThisBlock) {
                if (!isIn(scanned, around)) toScan.add(around);
            }
        }
        return found;
    }

    private double distance(Block left, Block right) {
        int x1 = left.getX(), x2 = right.getX();
        int y1 = left.getY(), y2 = right.getY();
        int z1 = left.getZ(), z2 = right.getZ();
        return Math.sqrt(Math.pow(x1 - x2, 2) + Math.pow(y1 - y2, 2) + Math.pow(z1 - z2, 2));
    }

    private boolean isIn(List<Block> blocks, Block block) {
        for (Block blc : blocks) {
            if (blc.getX() == block.getX() && blc.getY() == block.getY() && blc.getZ() == block.getZ()) {
                return true;
            }
        }
        return false;
    }

    private List<Block> around(Block block, World world) {
        return Arrays.asList(
                //in front
                world.getBlockAt(block.getX() - 1, block.getY(), block.getZ() + 1),
                world.getBlockAt(block.getX(), block.getY(), block.getZ() + 1),
                world.getBlockAt(block.getX() + 1, block.getY(), block.getZ() + 1),

                //< >
                world.getBlockAt(block.getX() - 1, block.getY(), block.getZ()),
                world.getBlockAt(block.getX() + 1, block.getY(), block.getZ()),

                //behind
                world.getBlockAt(block.getX() - 1, block.getY(), block.getZ() - 1),
                world.getBlockAt(block.getX(), block.getY(), block.getZ() - 1),
                world.getBlockAt(block.getX() + 1, block.getY(), block.getZ() - 1)
        );
    }

    private boolean isAirAt(int x, int y, int z) {
        World world = this.world.get();
        return null != world && world.getBlockAt(x, y, z).getType().isAir();
    }
}

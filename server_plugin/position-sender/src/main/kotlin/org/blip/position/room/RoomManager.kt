package org.blip.position.room

import org.blip.position.room.db.DBRoom
import org.bukkit.Bukkit
import org.bukkit.World
import org.ktorm.database.Database
import org.ktorm.database.use
import org.ktorm.dsl.forEach
import org.ktorm.dsl.from
import org.ktorm.dsl.insert
import org.ktorm.dsl.select
import org.ktorm.logging.Slf4jLoggerAdapter
import org.ktorm.support.sqlite.SQLiteDialect
import org.slf4j.Logger
import org.slf4j.LoggerFactory
import java.util.*
import java.util.concurrent.ConcurrentLinkedQueue

class RoomManager {
    private val _rooms: ConcurrentLinkedQueue<Room>
    val database: Database

    val rooms: ConcurrentLinkedQueue<Room> get() = _rooms

    private val logger: Logger = LoggerFactory.getLogger(this.javaClass)

    init {
        database = Database.connect(
            url = "jdbc:sqlite:dolbyio.db",
            logger = Slf4jLoggerAdapter(logger),
            dialect = SQLiteDialect()
        )

        execSqlScript("db.sql", database)

        _rooms = ConcurrentLinkedQueue()
        database.from(DBRoom).select().forEach {

            val memory = Room(
                it[DBRoom.uuid],
                it[DBRoom.name],
                it[DBRoom.world],
                it[DBRoom.x]!!,
                it[DBRoom.y]!!,
                it[DBRoom.z]!!,
            )
            val world = Bukkit.getWorld(UUID.fromString(memory.world))
            if (null != world) {
                manageBlocks(memory, world)
                this.rooms.add(memory)
            }
        }
    }

    fun create(name: String?, world: World, x: Int, y: Int, z: Int): Room? {
        val room = Room(name, world.uid.toString(), x, y, z)

        database.insert(DBRoom) {
            set(it.uuid, room.id)
            set(it.name, room.name)
            set(it.world, world.uid.toString())
            set(it.x, x)
            set(it.y, y)
            set(it.z, z)
        }

        rooms.add(room)
        return room
    }

    fun manageBlocks(room: Room, world: World?) {
        val spreadGatherer = SpreadGatherer(world)
        val around = spreadGatherer.around(
            room.origin.x,
            room.origin.y,
            room.origin.z
        )
        room.addBlocks(around)
    }

    fun execSqlScript(filename: String, database: Database) {
        database.useConnection { conn ->
            conn.createStatement().use { statement ->
                javaClass.classLoader
                    ?.getResourceAsStream(filename)
                    ?.bufferedReader()
                    ?.use { reader ->
                        for (sql in reader.readText().split(';')) {
                            if (sql.any { it.isLetterOrDigit() }) {
                                statement.executeUpdate(sql)
                            }
                        }
                    }
            }
        }
    }
}
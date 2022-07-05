package org.blip.position.room.db


import org.ktorm.schema.*

object DBRoom : Table<Nothing>("room") {
    val id = int("id").primaryKey()
    val name = varchar("name")
    val uuid = varchar("uuid")
    val world = varchar("world")
    val x = int("x")
    val y = int("y")
    val z = int("z")
}
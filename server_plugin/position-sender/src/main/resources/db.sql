
create table room (
  id            integer primary key autoincrement,
  name          text    not null,
  uuid          text    not null,
  world         text    not null,
  x             integer not null,
  y             integer not null,
  z             integer not null
);
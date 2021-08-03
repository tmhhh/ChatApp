const table = "room";
const db = require("../utils/db");
module.exports = {
  addRoom: (room) => {
    const query = `insert into room values(0,"${room.roomName}",'{"user":"${room.roomMembers.user}"}')`;
    return db.optionalInsert(query);
  },
  getAllRooms: () => {
    return db.getAll(table);
  },
};

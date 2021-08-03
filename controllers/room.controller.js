const { addRoom, getAllRooms } = require("../models/room.model");
module.exports = {
  addNewRoom: async (req, res) => {
    try {
      if (!req.body.roomName) {
        res.redirect("/Chat");
        return;
      }
      const Room = {
        roomName: req.body.roomName,
        roomMembers: { user: req.user.name },
      };
      const check = await addRoom(Room);
      const listRooms = await getAllRooms();
      console.log(check);
      if (check.affectedRows > 0) return res.redirect("/Chat");
      return res.json("error");
    } catch (err) {
      console.log(err);
    }
  },
};

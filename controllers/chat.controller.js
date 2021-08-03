const { getAllRooms } = require("../models/room.model");
module.exports = {
  chatHome: async (req, res, next) => {
    try {
      const Room = await getAllRooms();
      return res.render("home", { Room });
    } catch (err) {
      console.log(err);

      return res.redirect("/Chat");
    }
  },
};

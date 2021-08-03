const db = require("../utils/db");
const table = "user";
module.exports = {
  add: (user) => {
    return db.insert(table, user);
  },
  findUser: (userID) => {
    return db.findByID(table, +userID);
  },
};

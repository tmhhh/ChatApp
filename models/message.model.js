const db = require("../utils/db");
const table = `message`;
module.exports = {
  addMessage: (message) => {
    return db.insert(table, message);
  },
  getUserSendingMessages: (userID) => {
    const query = `select * from message,user where senderID= ? and message.senderID=user.userID `;
    return db.getByCondition(query, userID);
  },
  getUserReceivingMessages: (userID) => {
    const query = `select * from message,user where receiverID= ? and message.senderID=user.userID `;
    return db.getByCondition(query, userID);
  },
};

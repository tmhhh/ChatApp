const db = require("../utils/db");
const table = `message`;
module.exports = {
  addMessage: (message) => {
    return db.insert(table, message);
  },
  getUserSendingMessages: (userID) => {
    const query = `select * from message,user where senderID= ? and message.senderID=user.userID `;
    return db.getWithCondition(query, userID);
  },
  getUserReceivingMessages: (userID) => {
    const query = `select * from message,user where receiverID= ? and message.senderID=user.userID `;
    return db.getWithCondition(query, userID);
  },
  getMessagesByRoomID: (roomID) => {
    const query = `select * from ${table},user where roomID=? and senderID=userID`;
    console.log(query);
    return db.getWithCondition(query, parseInt(roomID));
  },
};

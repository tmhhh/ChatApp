const messageModel = require("../models/message.model");

module.exports = {
  getUserMessages: async (req, res) => {
    try {
      const data = await Promise.all([
        messageModel.getUserReceivingMessages(req.user.userID),
        messageModel.getUserSendingMessages(req.user.userID),
      ]);
      var messages = [...data[0], ...data[1]];
      messages = messages.sort((a, b) => a.messageID - b.messageID);
      console.log(messages);
      res.json(messages);
      //   if (Object.keys(messages).length > 0) return res.json(messages);
      //   return res.json("error");
    } catch (error) {
      console.log(error);
      res.json("error");
    }
  },
};

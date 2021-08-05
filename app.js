const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");
const logger = require("morgan");
const passport = require("passport");
const PORT = process.env.PORT || 4000;
const session = require("express-session");
const app = express();
const server = require("http").createServer(app);
const io = require("socket.io")(server);
const messageModel = require("./models/message.model");
app.use(
  session({
    secret: "keyboard cat",
    resave: false,
    saveUninitialized: true,
    // cookie: { maxAge: 3000 },
  })
);
const exphbs = require("express-handlebars");
const exphbs_sections = require("express-handlebars-sections");
app.engine(
  "hbs",
  exphbs({
    defaultLayout: "main",
    extname: ".hbs",
    helpers: {
      section: exphbs_sections(),
    },
  })
);
// Setting template Engine
app.set("view engine", "hbs");

// app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));
///passport
require("./middlewares/authenticate.mdw").initialize(app, passport);

//
var user = {};
app.use((req, res, next) => {
  if (req.user) {
    res.locals.user = req.user;
    user = req.user;
  }
  next();
});
var listClients = [];
//socket io
io.on("connection", (socket) => {
  console.log(socket.id + " has connected");
  // socket.emit("send-client-socketid", socket.id);
  //inform new user has connected
  io.sockets.emit("Notify", "New user has connected !!!");
  //broadcast message
  socket.on("private-message", async (data) => {
    // console.log(data);

    try {
      const message = {
        messageContent: data.message,
        senderID: data.user.userID,
        receiverID: data.otherSocketID,
        roomID: null,
      };
      const check = await messageModel.addMessage(message);
      if (check.affectedRows <= 0) return;
      socket.join(data.otherSocketID);
      socket
        .to(data.otherSocketID)
        .emit("private-message", { message: data.message, user: data.user });
    } catch (error) {
      console.log(error);
    }
  });
  //get client info
  // var checkExist = false;
  socket.on("send-client-info", (client) => {
    // client.socketID = socket.id;
    // console.log(client.id);
    socket.join(client.userID);

    // listClients.forEach((e) => {
    //   if (e.id === client.id) {
    //     checkExist = true;
    //     return;
    //   }
    // });
    // if (!checkExist) {
    //   listClients.push(client);
    //   checkExist = false;
    // }
    console.log(listClients);
    console.log(client.userID);

    //other way to check if the user exists in an array || cannot use includes or index of in this case!!!
    var checkExist = listClients.some((e) => e.userID === client.userID);
    console.log(checkExist);
    if (!checkExist) {
      listClients.push(client);
      // checkExist = false;
    }

    socket.on("join-room-chat", (data) => {
      socket.join(data.roomID);
    });

    //chat room
    socket.on("room-message", async (data) => {
      try {
        const message = {
          messageContent: data.message,
          senderID: data.user.userID,
          receiverID: null,
          roomID: data.roomID,
        };
        const check = await messageModel.addMessage(message);
        if (check.affectedRows > 0) {
          socket.to(data.roomID).emit("room-message", {
            room: data.roomID,
            message: data.message,
            user: data.user,
          });
        } else return;
      } catch (error) {
        console.log(error);
      }
    });
    // socket.on("leave-room-chat", (data) => socket.leave(data.roomID));
    io.sockets.emit("send-list-clients", listClients);

    // list of rooms
    // console.log(socket.adapter.rooms);
  });
  // user disconnected
  socket.on("disconnect", () => {
    console.log("User disconnect");
  });
});
app.use("/", require("./routes/main.route"));
server.listen(PORT, () => {
  console.log(`Sever is running at http://localhost:${PORT}`);
});

module.exports = app;

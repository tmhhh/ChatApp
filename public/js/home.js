const frmChatInput = document.querySelector(".chatbox-input");
const chatBox = document.querySelector(".chatbox-content");
const txaMessage = document.getElementById("txaMessage");
const socket = io();
var user = {};
var otherSocketID = null;
var roomID = null;
var listMessages = [];
async function getUserInfo() {
  var data = await fetch("http://localhost:4000/userInfo");
  return data.json();
}
async function getMessageData() {
  var data = await fetch("http://localhost:4000/user/messages");
  return data.json();
}

function handleSocketIO() {
  socket.emit("send-client-info", user);
  socket.on("Notify", (data) => {});
  socket.on("private-message", (data) => renderReceiveMessage(data));
  socket.on("send-list-clients", (listClients) => {
    console.log("list clients:");
    console.log(listClients);
    renderListClients(listClients);
  });
  socket.on("room-message", (data) => {
    renderReceiveMessage(data);
    console.log(data);
  });
}

const renderListClients = (listClients) => {
  const currentClientImageSrc = document.getElementById("user-image").src;
  var otherUsers = document.querySelector(".other-users");
  otherUsers.innerHTML = "";
  listClients.forEach((e) => {
    if (e.userPic !== currentClientImageSrc) {
      otherUsers.innerHTML += `<div class="other-user"><img height="30" width="30" src="${e.userPic}" alt="" >
        <span id="user-name">${e.userName}</span>
        <i class="fa fa-circle online-icon" aria-hidden="true"></i>
      <input type="hidden" value="${e.userID}"/> </div>
        `;
    }
  });
  const listOtherUsers = document.querySelectorAll(".other-user");
  listOtherUsers.forEach((otherUser, index) => {
    otherUser.addEventListener("click", async (e) => {
      //get saved message from db
      listMessages = await getMessageData();
      //change room name&& description
      document.querySelector(".room-name").innerHTML =
        otherUser.childNodes[2].innerText;
      // document.querySelector(".room-description").innerHTML=;
      //clear chatbox
      chatBox.innerHTML = "";

      // e.target.className == "other-user"
      //   ? (otherSocketID = e.target.children[3].defaultValue)
      //   : (otherSocketID = e.target.parentElement.children[3].defaultValue);

      //other way
      otherSocketID =
        e.target.className == "other-user"
          ? e.target.children[3].defaultValue
          : e.target.parentElement.children[3].defaultValue;
      //
      renderPersonalSavedMessages();
      roomID = null;
    });
  });
};

function Validated(inputValue) {
  return inputValue.trim(" ");
}

const renderPersonalSavedMessages = () => {
  listMessages.forEach((e) => {
    if (
      e.senderID === user.userID &&
      e.receiverID === otherSocketID &&
      e.roomID === null
    ) {
      chatBox.innerHTML =
        ` <div class="user-message mt-3">
    <span class="">${e.messageContent}</span>
    <img height=40 width=40
    src="${e.userPic}"
    alt="">
      </div>` + chatBox.innerHTML;
    } else if (e.receiverID === user.userID) {
      chatBox.innerHTML =
        ` <div class="mr-5 other-message mt-3">
    <img height=40 width=40
  src="${e.userPic}"
  alt="">
  <span class="">${e.messageContent}</span>
      </div>` + chatBox.innerHTML;
    }
    //      else if (e.roomID === roomID && e.senderID === user.userID) {
    //       chatBox.innerHTML =
    //         ` <div class="user-message mt-3">
    //   <span class="">${e.messageContent}</span>
    //   <img height=40 width=40
    //   src="${e.userPic}"
    //   alt="">
    //     </div>` + chatBox.innerHTML;
    //     } else if (
    //       e.roomID === roomID &&
    //       e.senderID !== user.userID &&
    //       e.receiverID === null
    //     ) {
    //       chatBox.innerHTML =
    //         ` <div class="mr-5 other-message mt-3">
    //   <img height=40 width=40
    // src="${e.userPic}"
    // alt="">
    // <span class="">${e.messageContent}</span>
    //     </div>` + chatBox.innerHTML;
    //     }
  });
};
const getRoomMessages = async () => {
  const data = await fetch(
    `http://localhost:4000/room/messages?roomID=${roomID}`
  );
  return data.json();
};
const renderRoomSavedMessage = async () => {
  const data = await getRoomMessages();
  data.forEach((e) => {
    if (e.senderID === user.userID) {
      chatBox.innerHTML =
        ` <div class="user-message mt-3">
      <span class="">${e.messageContent}</span>
      <img height=40 width=40
      src="${user.userPic}"
      alt="">
        </div>` + chatBox.innerHTML;
    } else {
      chatBox.innerHTML =
        ` <div class="other-message mt-3">
        <img height=40 width=40
        src="${e.userPic}"
        alt="">
        <span class="">${e.messageContent}</span>
        </div>` + chatBox.innerHTML;
    }
  });
};

const renderReceiveMessage = (data) => {
  if (
    (data.user.userID === otherSocketID && roomID === null) ||
    (otherSocketID === null && roomID === data.room)
  ) {
    chatBox.innerHTML =
      ` <div class="mr-5 other-message mt-3">
    <img height=40 width=40
  src="${data.user.userPic}"
  alt="">
  <span class="">${data.message}</span>
      </div>` + chatBox.innerHTML;
  }

  //other way to get value
  // e.target.children.txaMessage.value = "";
};
const renderSendMessage = (data) => {
  chatBox.innerHTML =
    ` <div class="user-message mt-3">
  <span class="">${data}</span>
  <img height=40 width=40
  src="${user.userPic}"
  alt="">
    </div>` + chatBox.innerHTML;
  txaMessage.value = "";

  // e.target.children.txaMessage.value = "";
};

//event
frmChatInput.addEventListener("submit", (e) => {
  e.preventDefault();
  if (otherSocketID !== null) {
    const message = Validated(txaMessage.value);
    if (message && message !== "") {
      if (otherSocketID !== null) {
        renderSendMessage(message);
        socket.emit("private-message", { message, otherSocketID, user });
      } else if (roomID !== null) {
        renderSendMessage(message);
        socket.emit("room-message", { message, roomID, user });
      }
      txaMessage.value = "";
    }
  }
});
txaMessage.addEventListener("keypress", (e) => {
  if (e.keyCode === 13) {
    e.preventDefault();
    const message = Validated(txaMessage.value);
    if (message && message !== "") {
      if (otherSocketID !== null) {
        renderSendMessage(message);
        socket.emit("private-message", { message, otherSocketID, user });
      } else if (roomID !== null) {
        renderSendMessage(message);
        socket.emit("room-message", { message, roomID, user });
      }
      txaMessage.value = "";
    }
  }
});
//

const listRooms = document.querySelectorAll(".room");
listRooms.forEach((room, index) =>
  room.addEventListener("click", (e) => {
    //change room name&& description
    document.querySelector(".room-name").innerHTML = room.innerText;
    // document.querySelector(".room-description").innerHTML=;
    //
    otherSocketID = null;
    chatBox.innerHTML = "";
    // socket.emit("leave-room-chat", { roomID });
    // roomID = document
    //   .getElementsByClassName("room")
    //   [index].textContent.trim("\n")
    //   .concat(index);
    roomID = document.querySelectorAll(".txhRoomID")[index].value;
    console.log(roomID);
    renderRoomSavedMessage();

    socket.emit("join-room-chat", { roomID });
  })
);

//execute
const main = async () => {
  user = await getUserInfo();
  handleSocketIO();
};

main();

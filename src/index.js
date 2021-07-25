const http = require("http");
const path = require("path");
const express = require("express");
const socketio = require("socket.io");
const Filter = require("bad-words");
const { generateMessage, generateLocationMessage } = require("./utils/messages")
const {
  addUser,
  removeUser,
  getUser,
  getUsersInRoom
} = require("./utils/users")


const app = express();
const server = http.createServer(app); // express does this behind the scenes anyways but we need this for thw web socket setup
const io = socketio(server); // here is the use

const port = process.env.PORT || 3000;
const publicDirectoryPath = path.join(__dirname, "../public");

app.use(express.static(publicDirectoryPath));

io.on("connection", (socket) => {
  //use methods on socket to handle the connections
  console.log("New WebSocket Connection");



  socket.on('join',(options, callback) => {

    const {error, user} = addUser({id:socket.id, ...options});
    
    if(error) {
      return callback(error);
    }

    socket.join(user.room);

    socket.emit("message",generateMessage('admin',`Welcome to the chatroom ${user.username}.`));
    socket.broadcast.to(user.room).emit('message',generateMessage('admin',`${user.username} has joined!`)); // all except the current new user

    io.to(user.room).emit('roomData', {
      room:user.room,
      users:getUsersInRoom(user.room)
    })
    callback();//acknowledgement
    // socket.emit
    // io.emit
    // socket.broadcast.emit
    // io.to.emit , socket.broadcast.to.emit - emits a message to everyone(,not to himself) in a room
  })

  socket.on("sendMessage", (message, callback) => {
    const user = getUser(socket.id);

    const filter = new Filter();

    if(filter.isProfane(message)) {
      return callback('Profanity is not allowed!'); 
    }
    io.to(user.room).emit("message", generateMessage(user.username,message));
    // const acknowledgementMessage = "Delivered!";
    callback(); // acknowledgement acceptance and sending a message again for validation
  });

  socket.on('sendLocation', (coords,callback) => {
    const user = getUser(socket.id);
      io.to(user.room).emit("locationMessage", generateLocationMessage(user.username,`https://google.com/maps?q=${coords.latitude},${coords.longitude}`));
      callback(); // acknowledgement that location is shared.

  })



  //send message to all when a user disconnects
  socket.on('disconnect', () =>{
    const user = removeUser(socket.id);

    if(user) {
      io.to(user.room).emit('message', generateMessage(user.username,`${user.username} has left the chat.`))
      io.to(user.room).emit('roomData', {
        room:user.room,
        users:getUsersInRoom(user.room)
      })
    }
  })
});

server.listen(port, () => {
  // server.listen insteasd of app.listen here
  console.log(`Server listening on port ${port}`);
});

// counter poll application!
// server (emit) -> client (receieve) - count Updated
// client (emit) -> server (receieve) - increment
// let count = 0;
// io.on('connection', (socket) => {  //use methods on socket to handle the connections
//     console.log('New WebSocket Connection');
//     socket.emit('countUpdated',count); // emit to send an event to client here "count will be availiable on callback function on client side"
//     socket.on('increment',()=>{
//         count++;
//         //socket.emit('countUpdated',count); // here emit is to emit to a single connection
//         io.emit('countUpdated',count); // io for the complete connection
//     })
// })

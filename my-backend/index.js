const express = require("express");
const app = express();
const http = require('http')
const { Server } = require("socket.io");

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000", 
    methods: ["GET", "POST"]
  },
  transports: ['websocket', 'polling'],
  pingTimeout: 60000,
  pingInterval: 25000
});
const cors = require('cors');
const mongoose = require('mongoose');
const axios = require('axios');
const db = require('./dbConfig');

// --- Mongoose Connection ---
async function connectWithMongoose(){
  try {
    await mongoose.connect(process.env.MONGO_URI);
    // console.log("uri: ", process.env.MONGO_URI);
    console.log('Connected to MongoDB with Mongoose!');
  } catch (error) {
    console.error('Error connecting to MongoDB with Mongoose:', error);
  }
}
connectWithMongoose();

// --- Routers ---
const userRouter = require('./routes/UserRouter');
const userDetailsRouter = require('./routes/UserDetailRouter');
const toDoRouter = require('./routes/ToDoRouter');
const flagRouter = require('./routes/FlagRouter');
const groupChatRouter = require('./routes/GrupChatRouter');
const privateChatRouter = require('./routes/PrivateChatRouter');
const privateMessageRouter = require('./routes/PrivateMessageRouter');
const groupMessageRouter = require('./routes/GroupMessageRouter');
const photoRouter = require('./routes/PhotoRouter');
const feedbackRouter = require('./routes/FeedbackRouter');

// --- Postgress Connection ---
db.connect((err) => {
    if (err) {
        console.error('ERROR:', err.stack)
    } else {
        console.log('Connected to the database successfully!')
    }
});

// --- Start Server ---
server.listen(7979, () => {
    console.log('Server is running on port 3000');}
);

// --- Routes ---
app.use(cors());
app.use(express.json());
app.use('/users', userRouter);
app.use('/userDetails', userDetailsRouter);
app.use('/toDoList', toDoRouter);
app.use('/flags', flagRouter);
app.use('/groupChat', groupChatRouter);
app.use('/privateChat', privateChatRouter)
app.use('/privateMessages', privateMessageRouter);
app.use('/groupMessages', groupMessageRouter);
app.use('/photos', photoRouter);
app.use('/feedback', feedbackRouter); 

// --- Socket.io ---
let chatRooms = {};

io.on("connection", (socket) => {
 
  socket.on('join private chat', (privateRoomObj) => {
    console.log('Join private', privateRoomObj);
    if(chatRooms.roomId){
      socket.leave(chatRooms.roomId);
    }
    chatRooms = {
      ...privateRoomObj,
    };

    socket.join(privateRoomObj.roomId);
    console.log(chatRooms);
  
  });

  // sending the message
  socket.on('chat private server', (request) => {
    console.log(request);
    //let timestamp = new Date();

    const messageObj = {
      content: request.content,
      timestamp: request.timestamp,
      chat_id: request.chat_id,
      user_id: request.user_id,

      fileName: request.fileName,
      imageName: request.imageName,
      imageObject: request.imageObject,
      imageURL: request.imageURL,
    }

    if (chatRooms.roomId) {
      socket.emit('chat private server', messageObj);
      io.to(chatRooms.roomId).emit('chat private client', messageObj);
      const goodObj = {
        content: request.content,
        timestamp: request.timestamp,
        chat_id: request.chat_id,
        user_id: request.user_id,
  
        fileName: request.fileName,
        imageName: request.imageName,
        
      }

      // add message to database using axios
      axios.post('http://localhost:7979/privateMessages/add', goodObj)
      .then((res) => {
          console.log('Message added to database:', res.data);
      })
      .catch((error) => {
          console.error('EROARE BACK ADD MSG', error);
      });
    
    }
  })

  
  socket.on("edit private message", ( newContent, chatID, timestamp) => {
   console.log('Edit',newContent, chatID, timestamp);
   io.to(chatRooms.roomId).emit("edit private message", newContent, chatID, timestamp);
  });

  socket.on("delete private message", (userID, timestamp, chatID) => {
    console.log('Delete',userID, timestamp, chatID);
    io.to(chatRooms.roomId).emit("delete private message", userID, timestamp, chatID);
  });

  socket.on('mark message as seen', (userID, timestamp, chatID) => {
    axios.put(`http://localhost:7979/privateMessages/markAsSeen/${userID}/${timestamp}/${chatID}`)
      .then((res) => {
        console.log('Message marked as seen:', res.data);
        io.to(chatRooms.roomId).emit('message seen', userID, timestamp, chatID);
      })
      .catch((error) => {
        console.error('Error marking message as seen:', error);
      });
  });

  socket.on('leave chat', (roomObj) => {
    if (roomObj.roomId) {
      socket.leave(roomObj.roomId);
      console.log('Left room:', roomObj.roomId);
    }
  });


  // joining
  socket.on("join group chat", (roomObject) => {
    console.log("Join", roomObject);
    if (chatRooms.roomId) {
      socket.leave(chatRooms.roomId);
    }
    chatRooms = {
      ...roomObject,
    };
    socket.join(roomObject.roomId);
    console.log(chatRooms);
  });


  // sending the message
  socket.on("chat group server", (request) => {
    console.log(request);

    //let timestamp = new Date();
        const messageObj = {
          content: request.content,
          timestamp: request.timestamp,
          group_id: request.group_id,
          user_id: request.user_id,
          fileName: request.fileName,
          imageName: request.imageName,
          imageObject: request.imageObject,
        };

        if (chatRooms.roomId) {
          socket.emit('chat group server',messageObj);
          io.to(chatRooms.roomId).emit("chat group client", messageObj);

          const goodObj = {
            content: request.content,
          timestamp: request.timestamp,
          group_id: request.group_id,
          user_id: request.user_id,
          fileName: request.fileName,
          imageName: request.imageName,
            
          }

          // add message to database using axios
          axios.post('http://localhost:7979/groupMessages/add', goodObj)
          .then((res) => {
              console.log('Message added to database:', res.data);
          })
          .catch((error) => {
              console.error('EROARE BACK ADD MSG', error);
          });

        }
    });

    socket.on("edit group message", ( newContent, chatID, timestamp) => {
      console.log('Edit',newContent, chatID, timestamp);
      io.to(chatRooms.roomId).emit("edit group message", newContent, chatID, timestamp);
     });
   
      socket.on("delete group message", (userID, timestamp, chatID) => {
        console.log('Delete',userID, timestamp, chatID);
        io.to(chatRooms.roomId).emit("delete group message", userID, timestamp, chatID);
      });
    
   
      socket.on("disconnect", () => {
        if (chatRooms.roomId) {
          socket.leave(chatRooms.roomId);
        }
        console.log("User disconnected");
        
      });

  });
  
  





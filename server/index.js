// entry point to our server
const express = require("express");
const app = express();                      // an instance of the express function
const http = require("http");
const cors = require("cors");               // helps with requests across different origins
const { Server } = require("socket.io")     // importing class Server from socket.io library

// using cors middleware
app.use(cors());

// create express server
const server = http.createServer(app);

// connection that we are establishing
// pass the server that we have created to connect our socket io
// server with the express one we have created
const io = new Server(server, {
    cors: {
        origin: "http://localhost:3000",    // which server (react) will be making the calls to our socketio server
        methods: ["GET", "POST"]            // which methods we accept
    }
});

// initiate and detect if someone connected to this socket io server
// listening for an event with "connection" name
io.on("connection", (socket) => {
    console.log(`User connected: ${socket.id}`);

    // create an event in socket.io which determines when someone wants to join a room
    socket.on("join_room", (id) => {
        socket.join(id);
        console.log(`User with ID: ${socket.id} joined room: ${id}`);
    })

    // event when user sends a messsage
    socket.on("send_message", (data) => {
        io.in(data.room).emit("receive_message", data);
    })

    // event when user leaves (refreshes)
    socket.on("disconnect", () => {
        console.log(`User disconnected: ${socket.id}`);
    })
});

server.listen(3001, () => {
    console.log("Server running :)");
});

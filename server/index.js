// entry point to our server
const express = require("express");
const app = express();                      // an instance of the express function
const http = require("http");
const cors = require("cors");               // helps with requests across different origins
const { Server } = require("socket.io");    // importing class Server from socket.io library

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

const status = {
    WAITING: 'waiting',
    PLAYING: 'playing',
    WIN: 'win',
    RESTART: 'restart'
}

let gameState = {
    board: {},
    players: [],
    status: status.WAITING
};

// initiate and detect if someone connected to this socket io server
// listening for an event with "connection" name
io.on("connection", (socket) => {
    console.log(`User connected: ${socket.id}`);

    // create an event in socket.io which determines when someone wants to join a room
    socket.on("join_room", (room) => {
        socket.join(room);
        gameState.players.push(socket.id);

        // create board when first player joins game room
        if (gameState.players.length == 1) {
            const board = require("./board");
            gameState.board = board.createBoard();
        }
        
        // io.in(id).emit("generate_puzzle", puzzle);
        console.log(`User with ID: ${socket.id} joined room: ${room}`);
    })

    socket.on("start_game", (data) => {
        gameState.status = status.PLAYING;
        data.gameState = gameState;
        data.showGame = true;
        io.in(data.room).emit("game_state", data);
    })

    // event when user sends a messsage
    socket.on("send_message", (data) => {
        // send message to entire room
        io.in(data.room).emit("receive_message", data);

        if (gameState.status === "playing") {
            // parse and check player guess
            let guess = parseGuess(data.message);
            checkGuess(guess, data.username);

            // send updated game board to room
            io.in(data.room).emit("game_state", {gameState: gameState, showGame: true});
        }
    })

    // event when user leaves (refreshes)
    socket.on("disconnect", () => {
        console.log(`User disconnected: ${socket.id}`);
    })
});

/* parse the text from chat box */
function parseGuess(text) {
    // regex pattern
    const regex = /([0-9]+)([a-z]) ([a-z]+)/;
    const match = text.toLowerCase().match(regex);
    
    let guess = {
        number: 0,
        dir: "",
        word: ""
    }

    if (match != null) {
        guess.number = parseInt(match[1]);
        guess.dir = match[2];
        guess.word = match[3];
    }

    return guess;
}

/* see if the guess is correct or not */
function checkGuess(guess, player) {
    for (let i = 0; i < gameState.board.numbers.length; i++) { 
        let numData = gameState.board.numbers[i];
        if (guess.number === numData.number && guess.dir === numData.dir) { // valid number and dir
            start_x = numData.index[0];
            start_y = numData.index[1];
            for (let j = 0; j < numData.length; j++) { // compare the letters
                // need to check that is hasnt been discovered yet
                if (guess.dir === "h") {
                    if (guess.word.charAt(j) === gameState.board.words[start_x][start_y + j]) {
                        console.log("we have a letter match!!");
                        gameState.board.discovered[start_x][start_y + j] = true;
                    }
                } else if (guess.dir === "v") {
                    if (guess.word.charAt(j) === gameState.board.words[start_x + j][start_y]){
                        console.log("we have a letter match!!");
                        gameState.board.discovered[start_x + j][start_y] = true;
                    }
                }        
            }
        }
    }
}

server.listen(3001, () => {
    console.log("Server is listening on port 3001");
});

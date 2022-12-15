/* entry point to the server */
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

const LETTER_POINT = 1;

const status = {
    WAITING: 'waiting',
    PLAYING: 'playing',
    OVER: 'over',
    RESTART: 'restart'
}

let gameState = {
    board: {},
    players: new Map(),
    status: status.WAITING
};

// map of id : username
let playersMap = new Map();

// initiate and detect if someone connected to this socket io server
// listening for an event with "connection" name
io.on("connection", (socket) => {
    console.log(`User connected: ${socket.id}`);

    // first check that username is available
    // socket.on("username_check", () => {
    //     const usernames = [...gameState.players.keys()];
    //     console.log(usernames);
    //     socket.emit("return_usernames", usernames);
    // })

    // create an event in socket.io which determines when someone wants to join a room
    socket.on("join_room", (joinData) => {
        socket.join(joinData.room);

        if (gameState.players.get(joinData.player) != null) {
            return "Username is taken";
        } else {
            gameState.players.set(joinData.player, 0);
            playersMap.set(socket.id, joinData.player);
        }

        // create board when first player joins game room
        if (gameState.players.size == 1) {
            const board = require("./board");
            gameState.board = board.createBoard();
        }

        console.log(`Player with username: ${joinData.player} joined room: ${joinData.room}`);
    })

    socket.on("start_game", (data) => {
        gameState.status = status.PLAYING;

        // send updated game board to room
        const serializedPlayers = [...gameState.players.entries()];
        io.in(data.room).emit("game_state", {gameState: gameState, playerScores: serializedPlayers, showGame: true});
    })

    // event when user sends a messsage
    socket.on("send_message", (data) => {
        // send message to entire room
        io.in(data.room).emit("receive_message", data);

        if (gameState.status === "playing") {
            // parse and check player guess
            let guess = parseGuess(data.message);
            checkGuess(guess, data.author);

            // send updated game board to room
            const serializedPlayers = [...gameState.players.entries()];
            if (serializedPlayers === undefined) serializedPlayers = [];
            io.in(data.room).emit("game_state", {gameState: gameState, playerScores: serializedPlayers, showGame: true});
        }
    })

    // event when user leaves (refreshes)
    socket.on("disconnect", () => {
        let username = playersMap.get(socket.id);
        gameState.players.delete(username);
        playersMap.delete(socket.id);

        // send updated game board to room
        const serializedPlayers = [...gameState.players.entries()];
        io.in("game").emit("game_state", {gameState: gameState, playerScores: serializedPlayers, showGame: true});
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

    if (match !== null) {
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
            let letters = 0;
            let newLetter = 0;
            let points = 0;
            for (let j = 0; j < numData.length; j++) { // compare the letters
                // need to check that is hasnt been discovered yet
                if (guess.dir === "h") {
                    if (guess.word.charAt(j) === gameState.board.words[start_x][start_y + j]) {
                        // console.log("we have a letter match!");
                        if (!gameState.board.discovered[start_x][start_y + j]) {
                            newLetter++;
                        }
                        points = points + LETTER_POINT; // add points for each correct letter
                        gameState.board.discovered[start_x][start_y + j] = true; // mark as discovered                     
                        letters++; // add to discovered letter count
                    }
                } else if (guess.dir === "v") {
                    if (guess.word.charAt(j) === gameState.board.words[start_x + j][start_y]){
                        // console.log("we have a letter match!");
                        if (!gameState.board.discovered[start_x + j][start_y]) {
                            newLetter++;
                        }
                        points = points + LETTER_POINT; // add points for each correct letter
                        gameState.board.discovered[start_x + j][start_y] = true; // mark as discovered
                        letters++; // add to discovered letter count
                    }
                }        
            }

            // no new letters found
            if (newLetter === 0) {
                points = 0;
            }

            // check if word is complete for the first time
            if (letters === numData.length && newLetter > 0) {
                // whole word discovered
                points = points + newLetter;
                gameState.board.total = gameState.board.total - 1;
            } else {
                points = newLetter; // didn't finish word, only found a few new letters
            }

            // give points to player
            points = points + gameState.players.get(player);
            gameState.players.set(player, points);

            // check if game is over
            if (gameState.board.total == 0) {
                console.log("GAME OVER");
                gameState.status = status.OVER;

                let winner = "";
                let bestScore = 0;
                for (let [player, score] of gameState.players) {
                    if (score > bestScore) {
                        winner = player;
                        bestScore = score;
                    }
                }

                // let users know
                io.in("game").emit("game_over", winner)
            }
        }
    }
}

server.listen(3001, () => {
    console.log("Server is listening on port 3001");
});

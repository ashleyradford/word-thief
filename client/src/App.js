import "./App.css";
import io from "socket.io-client";
import { Fragment, useState } from "react";
import Chat from "./Chat";
import Board from "./Board";

// connecting frontend to backend
const socket = io.connect("http://localhost:3001");

function App() {

  // create a state to represent username
  const [username, setUsername] = useState("")
  const [room, setRoom] = useState("");
  const [showChat, setShowChat] = useState(false);

  const joinRoom = () => {
    if (username !== "" && room !== "") {
      socket.emit("join_room", room);
      setShowChat(true);
    }
  };

  return (
    <div className="App">
      {!showChat ? (
        <div className="join-room">
          <h3>Join a Room</h3>
          <input
            type = "text"
            placeholder = "Sally..."
            onChange = {(event) => {
              setUsername(event.target.value);
            }}
          />
          <input
            type = "text"
            placeholder = "Room ID..."
            onChange = {(event) => {
              setRoom(event.target.value);
            }}
          />
          <button onClick={joinRoom}>Join</button>
        </div>
      ) : (
        <Fragment>
          <Board socket={socket} username={username} room={room}/>
          <Chat socket={socket} username={username} room={room}/>
        </Fragment>
      )}
    </div>
  );
}

export default App;

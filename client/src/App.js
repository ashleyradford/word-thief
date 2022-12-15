import "./App.css";
import io from "socket.io-client";
import { useState } from "react";
import Chat from "./Chat";
import Game from "./Game";
import Scoreboard from "./Scoreboard";

// connecting frontend to backend
const socket = io.connect("http://localhost:3001");

function App() {

	// create a state to represent username
	const [username, setUsername] = useState("")
	const [showChat, setShowChat] = useState(false);

	const joinRoom = () => {
		if (username !== "") {
			socket.emit("join_room", {player: username, room: "game"});
			setShowChat(true);
    	}
  	};

  return (
	<div className="App">
		{!showChat ? (
			<div className="join-room">
				<br></br><h3>Join Game</h3><br></br>
				<input
				type = "text"
				placeholder = "Player name..."
				onChange = {(event) => {
					setUsername(event.target.value);
				}}
			/>
			<button type="button" className="btn btn-primary" onClick={joinRoom}>Join</button>
			</div>
		) : (
			<div className="container text-center">
				<div className="row">
					<div className="col-sm-2">
						<Scoreboard socket={socket} username={username} room={"game"}/>
					</div>
					<div className="col-sm-7">
						<Game socket={socket} username={username} room={"game"}/>
					</div>
					<div className="col-sm-3">
						<Chat socket={socket} username={username} room={"game"}/>
					</div>
				</div>
			</div>
		)}
	</div>
	);
}

export default App;

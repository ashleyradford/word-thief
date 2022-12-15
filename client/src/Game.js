import { useState, useEffect } from "react";

const Game = ({ socket, username, room }) => {
    // create state so we can keep track of game state
    const [gameState, setGameState] = useState({});
    const [showGame, setShowGame] = useState(false);
    const [winner, setWinner] = useState("");
    const [gameOver, setGameOver] = useState(false);
    
    const startGame = () => {
        const gameData = {
            room: room,
            author: username,
            gameState: gameState,
            showGame: showGame
        };

        socket.emit("start_game", gameData);
    }

    // listen to whenever there is any changes in our socket
    useEffect(() => {
        socket.on("game_state", (data) => {
            console.log("----- Setting Game State -----"); 
            setGameState(data.gameState);
            setShowGame(data.showGame);
        })

        // clean up function to prevent duplicate game states - need to close the connection
        return () => socket.off("game_state");

    }, [socket]);

    // listen for when there is a winner
    socket.on("game_over", (winner) => {
        setWinner(winner);
    })

    // checking if game state has been updated
    useEffect(() => {
        console.log("gameState state change: ")
        console.log(gameState);
    }, [gameState]);

    // checking if game state has been updated
    useEffect(() => {
        if (winner !== "") {
            setGameOver(true);
        }
    }, [winner]);

    return (
        <div className="game-window">
            {!showGame ? (
                <div className="start-button">
                    <br></br><button type="button" className="btn btn-primary" onClick={startGame}>Start Game</button>
                </div>
                ) : ( 
                <div className="puzzle">
                    {!gameOver ? (
                        <div className="container"><br></br>
                            {gameState.board.words.map((row, j) => {
                                return ( 
                                    <div className="row" key={j}> 
                                        {row.map((letter, k) => {
                                            if (letter !== null && gameState.board.discovered[j][k]) {
                                                if (gameState.board.starts[j][k] !== null) {
                                                    // add word number with letter start
                                                    return (
                                                        <div className="col-sm letter" key={k}> 
                                                        <p><span className="num">{gameState.board.starts[j][k].number}.</span>&ensp;{letter}</p>
                                                        </div>
                                                    )
                                                } else { // add only the letter (not a start)
                                                    return (
                                                        <div className="col-sm letter" key={k}> 
                                                        <p>{letter}</p>
                                                        </div>
                                                    )
                                                }
                                            } else if (letter !== null) { // valid square but not discovered
                                                if (gameState.board.starts[j][k] !== null) {
                                                    return (
                                                        <div className="col-sm letter" key={k}> 
                                                        <p><span className="num">{gameState.board.starts[j][k].number}.</span>&ensp; </p>
                                                        </div>
                                                    )
                                                } else {
                                                    return (
                                                        <div className="col-sm no-letter" key={k}> 
                                                        <p>~</p>
                                                        </div>
                                                    )
                                                }
                                            } else { // not a valid square
                                                return (
                                                    <div className="col-sm empty" key={k}> 
                                                    <p>{letter}</p>
                                                    </div>
                                                )
                                            }
                                        })}
                                    </div>
                                );
                            })}
                        </div>
                        ) : (
                        <h2><br></br>WINNER: {winner}</h2>
                    )}
                </div>
            )}
        </div>
    );
}

export default Game;

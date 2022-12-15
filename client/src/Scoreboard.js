import { useState, useEffect } from "react";

const Scoreboard = ({ socket, username, room }) => {

    // create state so we can keep track of player scores
    const [playerScoreList, setPlayerScoreList] = useState([]);

    // listen to whenever there is any changes in our socket
    useEffect(() => {
        socket.on("game_state", (data) => {
            setPlayerScoreList(data.playerScores);
        })

        // clean up function to prevent duplicate game states - need to close the connection
        return () => socket.off("game_state");

    }, [socket]);

     // checking if player scores have been updated
     useEffect(() => {
        console.log("playerScoreList state change: ")
        console.log(playerScoreList);
    }, [playerScoreList]);

    return (
        <div className="scoreboard-window">
            <br></br><h4>Scoreboard</h4><hr></hr>
            {playerScoreList.map((player, i) => {
                return ( 
                    <div className="row" key={i}> 
                        {player.map((data, j) => {
                            return (
                                <div className="row" key={j}>
                                <p>{data}</p>
                                </div>
                            )
                        })}
                    </div>
                )
            })}
        </div>
    )
}

export default Scoreboard;

function Game({ socket, username, room }) {


    const grabWord = async () => {
        const response = await fetch("https://api.api-ninjas.com/v1/randomword", {
            method: "GET",
            headers: {"X-Api-Key": "floKlW5uS0lWOz/A0DMjaw==9oevNKSj09n6U9CI"}
        })

        const data = await response.json();
        console.log(data.word.toLowerCase());
    }
    

    return (
        <div className="game-window">
            <p>Hello I am a game!</p>
            <button onClick={grabWord}>Generate a Word</button>
        </div>
    );
}

export default Game;

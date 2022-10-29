import { useEffect, useState } from "react"
import ScrollToBottom from "react-scroll-to-bottom";

function Chat({ socket, username, room }) {

    // create state so we can keep track of guess
    const [currentGuess, setCurrentGuess] = useState("");

    // create a state to represent list of messages coming in
    const [messageList, setMessageList] = useState([]);

    // async bc we want to wait for the message to be sent
    const sendMessage = async () => {
        // dont send empty message
        if (currentGuess !== "") {
            const messageData = {
                room: room,
                author: username,
                message: currentGuess,
                time: new Date(Date.now()).getHours() + ":" + new Date(Date.now()).getMinutes()
            };

            await socket.emit("send_message", messageData);
            // add own message
            // setMessageList((messages) => [...messages, messageData]);
            setCurrentGuess("");
        }
    };

    // listen to whenever there is any changes in our socket (it receives a message)
    useEffect(() => {
        socket.on("receive_message", (data) => {
            console.log("Adding message to list");
            setMessageList((messages) => [...messages, data]);
        })

        // clean up function to prevent duplicate messages - need to close the connection
        return () => socket.off("receive_message");

    }, [socket]);

    return (
        <div className="chat-window">
            <div className="chat-header">
                <p>Guess a word!</p>
            </div>
            <div className="chat-body">
                <ScrollToBottom className="messageContainter">
                    {messageList.map((messageData, i) => {
                        return (
                            <div
                                className="message"
                                key={i} // warning without each sibling having an id
                                id={username === messageData.author ? "you" : "other"}>
                                <div>
                                    <div className="messageContent">
                                        <p><strong>{messageData.message}</strong></p>
                                    </div>
                                    <div className="messageMeta">
                                        {/* <p id="time">{messageData.time}</p> */}
                                        <p id="author">{messageData.author}</p>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </ScrollToBottom>
            </div>
            <div className="chat-footer">
                <input
                    type="text"
                    value={currentGuess} // gives us control when we change state
                    placeholder="Word guess..."
                    onChange = {(event) => {
                        setCurrentGuess(event.target.value);
                    }}
                    onKeyPress={(event) => {
                        event.key === "Enter" && sendMessage();
                    }}
                />
                <button onClick={sendMessage}>Guess</button>
            </div>
        </div>
    );
}

export default Chat;

function Game() {
    const randomWords = require("random-words");

    // not using useState bc value doesn't change...maybe
    // check console for words and puzzle, rendered twice
    const wordList = Array.from({length: 50}, () => {
        let word = randomWords();
        while (word.length < 5 || word.length > 12) {
            word = randomWords();
        }
        return word;
    });
    
    // initialize empty crossword
    const board = Array.from({length: 12}, () => Array.from({length: 12}, () => null));

    /* creates crossword board */
    function createBoard() {
        // place first word
        placeWord(wordList[0], 0,
            [Math.floor(board.length/2 - 1), Math.floor((board.length - wordList[0].length) / 2)], "h");

        words:
        for (let i = 1; i < wordList.length; i++) { // words in wordList
            let word = wordList[i];
            for (let l = 0; l < word.length; l++) {             // letter in word
                for (let x = 0; x < board.length; x++) {        // rows
                    for (let y = 0; y < board.length; y++) {    // coloumns
                        if (board[x][y] !== null && word[l] === board[x][y]) {
                            const dir = getDir([x, y]);
                            const ok = canPlace(word, l, [x, y], dir);
                            if (ok) {
                                placeWord(word, l, [x, y], dir);
                                continue words;
                            }
                        }
                    }    
                }
            }
        }
    }

    /* finds word direction */
    function getDir(cell) {
        if (board[cell[0]][cell[1] - 1] === null && board[cell[0]][cell[1] + 1] === null)
            return "h";
        return "v";
    }

    /* can place if the word does not add to an existing word
     * or no words above/below if horizontal dir
     * or no words left/right if vertical dir */
    function canPlace(word, l, match, direction) {
        let i = match[0];
        let j = match[1];

        // STEP 1: check that there is not another word directly in front
        if (direction === "h") {
            j -= l;             // set start of word
            if (inBounds([i, j-1]) && board[i][j-1] !== null)
                return false;   // end of another word
        } else if (direction === "v") {
            i -= l;             // set start of word
            if (inBounds([i-1, j]) && board[i-1][j] !== null)
                return false;   // end of another word
        }

        // STEP 2: check that each cell that is to be filled is either empty or a match
        for (let k = 0; k < word.length; k++) {
            if (!inBounds([i, j])) {
                return false; // word is outside the board
            }

            if (direction === "h") {
                if (!isHorizontalCellValid([i, j], word[k]))
                    return false;
                j++;
            } else if (direction === "v") {
                if (!isVerticalCellValid([i, j], word[k]))
                    return false;
                i++;
            }   
        }

        // STEP 3: check that there is not another word directly behind
        if (direction === "h") {
            if (inBounds([i, j]) && board[i][j] !== null) { // i and j bc incremented in for loop
                return false; // start of another word
            }
        } else if (direction === "v") {
            if (inBounds([i, j]) && board[i][j] !== null) {
                return false; // start of another word
            }
        }    

        return true;
    }

    /* adds word to crossword board */
    function placeWord(word, l, match, direction) {
        let i = match[0];
        let j = match[1];

        // set start of word
        if (direction === "h")
            j -= l;
        if (direction === "v")
            i -= l;

        // place each letter of word
        for (let k = 0; k < word.length; k++) {
            if (direction === "h")
                board[i][j++] = word[k];
            else if (direction === "v")
                board[i++][j] = word[k];
        }
    }

    /* checks if index[i, j] is in bounds */
    function inBounds(index) {
        if (index[0] < 0 || index[0] >= board.length) {
            return false;
        }
        if (index[1] < 0 || index[1] >= board.length) {
            return false;
        }
        return true;
    }

    /* checks if cell for word going vertical is valid */
    function isVerticalCellValid(index, letter) {
        // first check if letter matches
        if (inBounds([index[0], index[1]]) && board[index[0]][index[1]] === letter)
            return true;

        // check if left cell is empty
        if (inBounds([index[0], index[1] - 1]) && board[index[0]][index[1] - 1] !== null)
            return false;

        // check if right cell is empty
        if (inBounds([index[0], index[1] + 1]) && board[index[0]][index[1] + 1] != null)
            return false;

        return true;
    }

    /* checks if cell for word going horizontal is valid */
    function isHorizontalCellValid(index, letter) {
        // first check if letter matches
        if (inBounds([index[0], index[1]]) && board[index[0]][index[1]] === letter)
            return true;

        // check if below cell is empty
        if (inBounds([index[0] - 1, index[1]]) && board[index[0] - 1][index[1]] != null)
            return false;

        // check if above cell is empty
        if (inBounds([index[0] + 1, index[1]]) && board[index[0] + 1][index[1]] != null)
            return false;

        return true;
    }
   
    // const [wordList, setWordList] = useState([]);
    // const [board, setBoard] = useState(Array.from({length: 12}, () => Array.from({length: 12}, () => null)));
    // useEffect(() => {
    //     const randomWords = require("random-words");
    //     let i = 0;
    //     while (i < 20) {
    //         let word = randomWords();
    //         if (word.length >= 5 && word.length <= 12) {
    //             console.log("adding word??");
    //             setWordList((wordList) => [...wordList, word]);
    //             i++;
    //         }
    //     }
    //     return () => setWordList([]);
    // }, []);

    // useEffect(() => {
    //     // setBoard((board) => [...board, []]);
    //     // board[0] = [];
    //     // board[0][1] = "A";
    //     // console.log(board[0][0]);
    //     // console.log(board[0][1]);
    //     console.log(board);
    // }, []); // empty dependency array causes effect to run only once, when the component mounts

    createBoard();

    return (
        <div className="game-window">
            {board.map((board, j) => {
                return (   
                    <div className="rows" key={j} > 
                            {board.map((row, k) => {
                                return (
                                    <div className="cols" key={k}> 
                                    <p>{row}</p>
                                    </div>
                                )
                            })}
                    </div>
                );
            })}
        </div>
    );
}

export default Game;

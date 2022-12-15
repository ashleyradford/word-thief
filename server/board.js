/* generates word options for puzzle */
function generateWordList() {
    let wordList = Array.from({length: 50}, () => {
        let randomWords = require("random-words");
        let word = randomWords();
        while (word.length < 5 || word.length > 12) {
            word = randomWords();
        }
        return word;
    })

    return wordList;
}

/* creates crossword board */
function createBoard() {
    // initialize empty crossword game
    let board = {
        words: Array.from({length: 12}, () => Array.from({length: 12}, () => null)),
        starts: Array.from({length: 12}, () => Array.from({length: 12}, () => null)),
        numbers: [],
        discovered: Array.from({length: 12}, () => Array.from({length: 12}, () => false)),
        total: 0
    };

    // generate word list
    let wordList = generateWordList();
    let count = 1;

    // place first word
    let temp_x = Math.floor(board.words.length/2 - 1);
    let temp_y = Math.floor((board.words.length - wordList[0].length) / 2);
    board.total = placeWord(wordList[0], 0, [temp_x, temp_y], "h", board.words, board.total);
    count = addWordStart(wordList[0], 0, count, [temp_x, temp_y], "h", board.starts, board.numbers);

    words:
    for (let i = 1; i < wordList.length; i++) { // words in wordList
        let word = wordList[i];
        for (let l = 0; l < word.length; l++) {                 // letter in word
            for (let x = 0; x < board.words.length; x++) {      // rows
                for (let y = 0; y < board.words.length; y++) {  // coloumns
                    if (board.words[x][y] !== null && word[l] === board.words[x][y]) {
                        let dir = getDir([x, y], board.words);
                        let ok = canPlace(word, l, [x, y], dir, board.words);
                        if (ok) {
                            board.total = placeWord(word, l, [x, y], dir, board.words, board.total);
                            count = addWordStart(word, l, count, [x, y], dir, board.starts, board.numbers);
                            continue words;
                        }
                    }
                }    
            }
        }
    }

    return board;
}

/* adds start and length of word */
function addWordStart(word, l, count, [x, y], dir, starts, numbers) {
    // set start of word
    if (dir === "h")
        y -= l;
    if (dir === "v")
        x -= l;
    
    if (starts[x][y] !== null) {
        tmp = starts[x][y].number;
    } else {
        tmp = count++;
    }

    let wordData = {
        number: tmp,
        dir: dir,
        length: word.length,
        index: [x, y]
    }

    console.log(wordData); // for answers
    starts[x][y] = wordData;
    numbers.push(wordData);
    return count;
}

/* finds word direction */
function getDir(cell, board) {
    if (board[cell[0]][cell[1] - 1] === null && board[cell[0]][cell[1] + 1] === null)
        return "h";
    return "v";
}

/* can place if the word does not add to an existing word
    * or no words above/below if horizontal dir
    * or no words left/right if vertical dir */
function canPlace(word, l, match, direction, board) {
    let i = match[0];
    let j = match[1];

    // STEP 1: check that there is not another word directly in front
    if (direction === "h") {
        j -= l;             // set start of word
        if (inBounds([i, j-1], board) && board[i][j-1] !== null)
            return false;   // end of another word
    } else if (direction === "v") {
        i -= l;             // set start of word
        if (inBounds([i-1, j], board) && board[i-1][j] !== null)
            return false;   // end of another word
    }

    // STEP 2: check that each cell that is to be filled is either empty or a match
    for (let k = 0; k < word.length; k++) {
        if (!inBounds([i, j], board)) {
            return false; // word is outside the board
        }

        if (direction === "h") {
            if (!isHorizontalCellValid([i, j], word[k], board))
                return false;
            j++;
        } else if (direction === "v") {
            if (!isVerticalCellValid([i, j], word[k], board))
                return false;
            i++;
        }   
    }

    // STEP 3: check that there is not another word directly behind
    if (direction === "h") {
        if (inBounds([i, j], board) && board[i][j] !== null) { // i and j bc incremented in for loop
            return false; // start of another word
        }
    } else if (direction === "v") {
        if (inBounds([i, j], board) && board[i][j] !== null) {
            return false; // start of another word
        }
    }    

    return true;
}

/* adds word to crossword board */
function placeWord(word, l, match, direction, board, total) {
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

    console.log(word); // for answers
    return total + 1;
}

/* checks if index[i, j] is in bounds */
function inBounds(index, board) {
    if (index[0] < 0 || index[0] >= board.length) {
        return false;
    }
    if (index[1] < 0 || index[1] >= board.length) {
        return false;
    }
    return true;
}

/* checks if cell for word going vertical is valid */
function isVerticalCellValid(index, letter, board) {
    // first check if letter matches
    if (inBounds([index[0], index[1]], board) && board[index[0]][index[1]] === letter)
        return true;

    // check if cell is already occupied by another non matching letter
    if (inBounds([index[0], index[1]], board) && board[index[0]][index[1]] !== null && board[index[0]][index[1]] !== letter)
        return false;

    // check if left cell is empty
    if (inBounds([index[0], index[1] - 1], board) && board[index[0]][index[1] - 1] !== null)
        return false;

    // check if right cell is empty
    if (inBounds([index[0], index[1] + 1], board) && board[index[0]][index[1] + 1] !== null)
        return false;

    return true;
}

/* checks if cell for word going horizontal is valid */
function isHorizontalCellValid(index, letter, board) {
    // first check if letter matches
    if (inBounds([index[0], index[1]], board) && board[index[0]][index[1]] === letter)
        return true;

    // check if cell is already occupied by another non matching letter
    if (inBounds([index[0], index[1]], board) && board[index[0]][index[1]] !== null && board[index[0]][index[1]] !== letter)
        return false;

    // check if below cell is empty
    if (inBounds([index[0] - 1, index[1]], board) && board[index[0] - 1][index[1]] !== null)
        return false;

    // check if above cell is empty
    if (inBounds([index[0] + 1, index[1]], board) && board[index[0] + 1][index[1]] !== null)
        return false;

    return true;
}

module.exports = { createBoard }

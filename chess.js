document.addEventListener('DOMContentLoaded', () => {
    console.log("Chess game loading...");

    // Create the chessboard
    const chessboard = document.getElementById('chessboard');
    chessboard.style.display = 'grid';
    chessboard.style.gridTemplateColumns = 'repeat(8, 60px)';
    chessboard.style.gridTemplateRows = 'repeat(8, 60px)';

    let isWhite = false;

    // Render the chessboard (8x8)
    for (let row = 0; row < 8; row++) {
        for (let col = 0; col < 8; col++) {
            const square = document.createElement('div');
            square.classList.add('square');
            square.dataset.row = row;
            square.dataset.col = col;

            // Alternating colors for squares
            square.classList.add(isWhite ? 'white' : 'black');
            isWhite = !isWhite;

            chessboard.appendChild(square);
        }
        isWhite = !isWhite; // Alternate colors on every row
    }

    // Place pieces on the board
    renderPieces();
});

// Class for chess pieces
class Piece {
    constructor(type, color) {
        this.type = type;
        this.color = color;
        this.hasMoved = false; // Track if the piece has moved (for castling)
    }

    isValidMove(start, end, board) {
        const rowDiff = Math.abs(start.row - end.row);
        const colDiff = Math.abs(start.col - end.col);
        const targetPiece = board[end.row][end.col];

        if (targetPiece && targetPiece.color === this.color) {
            return false; // Cannot move to a square occupied by the same color piece
        }

        switch (this.type) {
            case 'pawn':
                return this.isValidPawnMove(start, end, board);
            case 'rook':
                return this.isValidRookMove(start, end, rowDiff, colDiff, board);
            case 'knight':
                return this.isValidKnightMove(rowDiff, colDiff);
            case 'bishop':
                return this.isValidBishopMove(start, end, board);
            case 'queen':
                return this.isValidQueenMove(start, end, board);
            case 'king':
                if (!this.hasMoved && Math.abs(start.col - end.col) === 2) {
                    return this.isValidCastling(start, end, board); // Castling logic
                }
                return this.isValidKingMove(rowDiff, colDiff);
            default:
                return false;
        }
    }

    isValidPawnMove(start, end, board) {
        const direction = this.color === 'white' ? -1 : 1;
        const rowDiff = end.row - start.row;
        const colDiff = Math.abs(end.col - start.col);
        const targetPiece = board[end.row][end.col];

        if (colDiff === 0 && rowDiff === direction && !targetPiece) {
            return true; // Forward move
        }
        if (colDiff === 1 && rowDiff === direction && targetPiece && targetPiece.color !== this.color) {
            return true; // Diagonal capture
        }
        return false;
    }

    isValidRookMove(start, end, rowDiff, colDiff, board) {
        if (rowDiff === 0 || colDiff === 0) {
            return !this.isPathBlocked(start, end, board);
        }
        return false;
    }

    isValidKnightMove(rowDiff, colDiff) {
        return (rowDiff === 2 && colDiff === 1) || (rowDiff === 1 && colDiff === 2);
    }

    isValidBishopMove(start, end, board) {
        const rowDiff = Math.abs(start.row - end.row);
        const colDiff = Math.abs(start.col - end.col);
        if (rowDiff === colDiff) {
            return !this.isPathBlocked(start, end, board);
        }
        return false;
    }

    isValidQueenMove(start, end, board) {
        const rowDiff = Math.abs(start.row - end.row);
        const colDiff = Math.abs(start.col - end.col);
        // The queen can move like a rook or a bishop
        return this.isValidRookMove(start, end, rowDiff, colDiff, board) || this.isValidBishopMove(start, end, board);
    }

    isValidKingMove(rowDiff, colDiff) {
        return rowDiff <= 1 && colDiff <= 1;
    }

    isValidCastling(start, end, board) {
        const direction = end.col > start.col ? 1 : -1;
        const rookCol = end.col > start.col ? 7 : 0;
        const rook = board[start.row][rookCol];

        if (!rook || rook.type !== 'rook' || rook.hasMoved) {
            return false; // Castling only if rook hasn't moved
        }

        for (let col = start.col + direction; col !== rookCol; col += direction) {
            if (board[start.row][col]) return false; // Path must be clear
        }

        return true;
    }

    // Helper method for blocking
    isPathBlocked(start, end, board) {
        const rowDiff = end.row - start.row;
        const colDiff = end.col - start.col;

        if (rowDiff !== 0 && colDiff === 0) {
            // Vertical movement
            const step = rowDiff > 0 ? 1 : -1;
            for (let row = start.row + step; row !== end.row; row += step) {
                if (board[row][start.col]) return true;
            }
        } else if (colDiff !== 0 && rowDiff === 0) {
            // Horizontal movement
            const step = colDiff > 0 ? 1 : -1;
            for (let col = start.col + step; col !== end.col; col += step) {
                if (board[start.row][col]) return true;
            }
        } else if (Math.abs(rowDiff) === Math.abs(colDiff)) {
            // Diagonal movement
            const rowStep = rowDiff > 0 ? 1 : -1;
            const colStep = colDiff > 0 ? 1 : -1;
            let row = start.row + rowStep;
            let col = start.col + colStep;
            while (row !== end.row && col !== end.col) {
                if (board[row][col]) return true;
                row += rowStep;
                col += colStep;
            }
        }

        return false;
    }
}

// Initialize the board setup with Piece objects
const initialBoardSetup = [
    [new Piece('rook', 'black'), new Piece('knight', 'black'), new Piece('bishop', 'black'), new Piece('queen', 'black'), new Piece('king', 'black'), new Piece('bishop', 'black'), new Piece('knight', 'black'), new Piece('rook', 'black')],
    [new Piece('pawn', 'black'), new Piece('pawn', 'black'), new Piece('pawn', 'black'), new Piece('pawn', 'black'), new Piece('pawn', 'black'), new Piece('pawn', 'black'), new Piece('pawn', 'black'), new Piece('pawn', 'black')],
    [null, null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null, null],
    [new Piece('pawn', 'white'), new Piece('pawn', 'white'), new Piece('pawn', 'white'), new Piece('pawn', 'white'), new Piece('pawn', 'white'), new Piece('pawn', 'white'), new Piece('pawn', 'white'), new Piece('pawn', 'white')],
    [new Piece('rook', 'white'), new Piece('knight', 'white'), new Piece('bishop', 'white'), new Piece('queen', 'white'), new Piece('king', 'white'), new Piece('bishop', 'white'), new Piece('knight', 'white'), new Piece('rook', 'white')]
];

// Render the pieces on the board using the initialBoardSetup
function renderPieces() {
    const pieceSymbols = {
        'pawn': { white: '♙', black: '♟' },
        'rook': { white: '♖', black: '♜' },
        'knight': { white: '♘', black: '♞' },
        'bishop': { white: '♗', black: '♝' },
        'queen': { white: '♕', black: '♛' },
        'king': { white: '♔', black: '♚' }
    };

    const chessboard = document.getElementById('chessboard');

    for (let row = 0; row < 8; row++) {
        for (let col = 0; col < 8; col++) {
            const piece = initialBoardSetup[row][col];
            const square = chessboard.querySelector(`[data-row='${row}'][data-col='${col}']`);

            if (piece) {
                square.textContent = pieceSymbols[piece.type][piece.color];
                square.style.fontSize = '40px';
                square.style.textAlign = 'center';
                square.style.lineHeight = '60px';
            } else {
                square.textContent = '';
            }
        }
    }
}

// Track selected piece and handle moves
let selectedPiece = null;

// Click event to select and move pieces
document.addEventListener('click', (e) => {
    const square = e.target;
    if (!square.classList.contains('square')) return;

    const row = Number(square.dataset.row);
    const col = Number(square.dataset.col);
    
    const piece = initialBoardSetup[row][col];

    if (selectedPiece && piece && piece.color === selectedPiece.piece.color) {
        selectedPiece = { piece, row, col }; // Re-select piece of same color
        clearHighlights(); // Clear previous highlights
    } else if (selectedPiece) {
        const { piece: selectedPieceObj, row: startRow, col: startCol } = selectedPiece;
        if (selectedPieceObj.isValidMove({ row: startRow, col: startCol }, { row, col }, initialBoardSetup)) {
            movePiece(startRow, startCol, row, col);
            selectedPieceObj.hasMoved = true; // Mark piece as moved
            clearHighlights(); // Clear highlights after the move
        }
        selectedPiece = null;
    } else if (piece) {
        selectedPiece = { piece, row, col };
        highlightValidMoves(selectedPiece, initialBoardSetup);
    }
});

// Highlight valid moves for the selected piece
function highlightValidMoves(selectedPiece, board) {
    const { piece, row: startRow, col: startCol } = selectedPiece;
    clearHighlights(); // Clear any previous highlights

    for (let row = 0; row < 8; row++) {
        for (let col = 0; col < 8; col++) {
            const targetSquare = { row, col };
            if (piece.isValidMove({ row: startRow, col: startCol }, targetSquare, board)) {
                const square = document.querySelector(`[data-row='${row}'][data-col='${col}']`);
                square.classList.add('highlight'); // Add a highlight class
            }
        }
    }
}

// Clear highlighted squares
function clearHighlights() {
    const squares = document.querySelectorAll('.square');
    squares.forEach(square => {
        square.classList.remove('highlight');
    });
}

function movePiece(startRow, startCol, endRow, endCol) {
    const piece = initialBoardSetup[startRow][startCol];
    const targetPiece = initialBoardSetup[endRow][endCol];

    if (targetPiece && targetPiece.color !== piece.color) {
        console.log(`Captured ${targetPiece.type} at [${endRow}, ${endCol}]`);
    }

    // Move the piece
    initialBoardSetup[startRow][startCol] = null;
    initialBoardSetup[endRow][endCol] = piece;

    const startSquare = document.querySelector(`[data-row="${startRow}"][data-col="${startCol}"]`);
    const endSquare = document.querySelector(`[data-row="${endRow}"][data-col="${endCol}"]`);
    
    endSquare.textContent = startSquare.textContent;
    endSquare.style.color = startSquare.style.color;
    startSquare.textContent = '';

    // Handle pawn promotion
    if (piece.type === 'pawn' && (endRow === 0 || endRow === 7)) {
        piece.type = 'queen'; // Promote to queen
        console.log('Pawn promoted to Queen!');
    }

    // Check if opponent is in check
    const opponentColor = piece.color === 'white' ? 'black' : 'white';
    if (isCheckmate(initialBoardSetup, opponentColor)) {
        console.log('Checkmate! Game over.');
    } else if (isInCheck(initialBoardSetup, opponentColor)) {
        console.log('Check!');
    }
}

// Check and Checkmate Logic
function isInCheck(board, color) {
    let kingPosition = null;

    // Find the king
    for (let row = 0; row < 8; row++) {
        for (let col = 0; col < 8; col++) {
            const piece = board[row][col];
            if (piece && piece.type === 'king' && piece.color === color) {
                kingPosition = { row, col };
            }
        }
    }

    // Check if opponent can attack the king
    for (let row = 0; row < 8; row++) {
        for (let col = 0; col < 8; col++) {
            const piece = board[row][col];
            if (piece && piece.color !== color) {
                if (piece.isValidMove({ row, col }, kingPosition, board)) {
                    return true; // The king is in check
                }
            }
        }
    }

    return false; // The king is not in check
}

function isCheckmate(board, color) {
    if (!isInCheck(board, color)) return false;

    // Check all possible moves to escape check
    for (let row = 0; row < 8; row++) {
        for (let col = 0; col < 8; col++) {
            const piece = board[row][col];
            if (piece && piece.color === color) {
                for (let destRow = 0; destRow < 8; destRow++) {
                    for (let destCol = 0; destCol < 8; destCol++) {
                        if (piece.isValidMove({ row, col }, { row: destRow, col: destCol }, board)) {
                            const tempBoard = board.map(arr => arr.slice());
                            tempBoard[destRow][destCol] = piece;
                            tempBoard[row][col] = null;
                            if (!isInCheck(tempBoard, color)) {
                                return false; // Found a valid escape
                            }
                        }
                    }
                }
            }
        }
    }

    return true; // No valid move to escape check = checkmate
}

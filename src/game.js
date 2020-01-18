export default class Game {
    static rows = 20;
    static columns = 10;
    static points = {
        '1': 40,
        '2': 100,
        '3': 300,
        '4': 1200
    };

    static createPlayfield () {
        const playfield = [];

        for (let y = 0; y < Game.rows; y++) {
            playfield[y] = [];

            for (let x = 0; x < Game.columns; x++) {
                playfield[y][x] = 0
            }
        }

        return playfield;
    }

    static createPiece () {
        const index = Math.floor( Math.random() * 7 );
        const type = 'IJLOSTZ'[index];
        const piece = {};

        switch (type) {
            case 'I':
                piece.blocks = [
                    [0,0,0,0],
                    [1,1,1,1],
                    [0,0,0,0],
                    [0,0,0,0]
                ];
                break;
            case 'J':
                piece.blocks = [
                    [0,0,0],
                    [2,2,2],
                    [0,0,2],
                ];
                break;
            case 'L':
                piece.blocks = [
                    [0,0,0],
                    [3,3,3],
                    [3,0,0],
                ];
                break;
            case 'O':
                piece.blocks = [
                    [0,0,0,0],
                    [0,4,4,0],
                    [0,4,4,0],
                    [0,0,0,0]
                ];
                break;
            case 'S':
                piece.blocks = [
                    [0,0,0],
                    [0,5,5],
                    [5,5,0],
                ];
                break;
            case 'T':
                piece.blocks = [
                    [0,0,0],
                    [6,6,6],
                    [0,6,0],
                ];
                break;
            case 'Z':
                piece.blocks = [
                    [0,0,0],
                    [7,7,0],
                    [0,7,7],
                ];
                break;
            default:
                throw new Error('unknown type of figure!')
        }

        piece.x = Math.floor( (10 - piece.blocks[0].length) /2 );
        piece.y = -1;

        return piece;
    }

    constructor () {
        this.resetState();
    }

    get level () {
        return Math.floor( this.lines * 0.1 )
    }

    getState() {
        const playfield = Game.createPlayfield();
        const {y: pieceY, x: pieceX, blocks} = this.activePiece;

        // Copy playfield
        for (let y = 0; y < this.playfield.length; y++) {
            for (let x = 0; x < this.playfield[y].length; x++) {
                playfield[y][x] = this.playfield[y][x];
            }
        }

        //Active figure in playfield
        for (let y = 0; y < blocks.length; y++) {
            for (let x = 0; x < blocks[y].length; x++) {
                if (blocks[y][x]) {
                    playfield[pieceY + y][pieceX + x] = blocks[y][x];
                }
            }
        }

        return {
            score: this.score,
            level: this.level,
            lines: this.lines,
            nextPiece: this.nextPiece,
            playfield: playfield,
            isGameOver: this.topOut
        };

    }

    resetState () {
        this.score = 0;
        this.lines = 0;
        this.topOut = false;
        this.playfield = Game.createPlayfield();
        this.activePiece = Game.createPiece();
        this.nextPiece = Game.createPiece();
    }

    movePieceLeft() {
        this.activePiece.x -= 1;

        if (this.hasCollision()) {
            this.activePiece.x += 1;
        }
    }

    movePieceRight() {
        this.activePiece.x += 1;

        if (this.hasCollision()) {
            this.activePiece.x -= 1;
        }
    }

    movePieceDown() {
        if (this.topOut) return;

        this.activePiece.y += 1;

        if (this.hasCollision()) {
            this.activePiece.y -= 1;
            this.lockPiece();
            const clearedLines = this.clearLines();
            this.updateScore(clearedLines);
            this.updatePieces();
        }

        if (this.hasCollision()) {
            this.topOut = true;
        }
    }

    rotatePiece() {
        const blocks = this.activePiece.blocks;
        const length = blocks.length;

        const temp = [];
        for (let i = 0; i < length; i++) {
            temp[i] = new Array(length).fill(0)
        }

        for (let y = 0; y < length; y++) {
            for (let x = 0; x < length; x++) {
                temp[x][y] = blocks[length - 1 - y][x];
            }
        }

        this.activePiece.blocks = temp;

        if (this.hasCollision()) {
            this.activePiece.blocks = blocks;
        }
    }

    hasCollision() {
        const {y: pieceY, x: pieceX, blocks} = this.activePiece;

        for (let y = 0; y < blocks.length; y++) {
            for (let x = 0; x < blocks[y].length; x++) {
                if (
                    blocks[y][x] &&
                    ((this.playfield[pieceY + y] === undefined || this.playfield[pieceY + y][pieceX + x] === undefined) ||
                        this.playfield[pieceY + y][pieceX + x])
                ) {
                    return true;
                }
            }
        }

        return false;
    }

    lockPiece() {
        const {y: pieceY, x: pieceX, blocks} = this.activePiece;

        for (let y = 0; y < blocks.length; y++) {
            for (let x = 0; x < blocks[y].length; x++) {
                if (blocks[y][x]) {
                    this.playfield[pieceY + y][pieceX + x] = blocks[y][x];
                }
            }
        }
    }

    clearLines () {
        let lines = [];

        for (let y = Game.rows - 1; y >= 0; y--) {
            let quantityOfBlocks = 0;

            for (let x = 0; x < Game.columns; x++) {
                if (this.playfield[y][x]) {
                    quantityOfBlocks += 1;
                }
            }

            if (!quantityOfBlocks) {
                break;
            } else if (quantityOfBlocks === Game.columns) {
                lines.unshift(y);
            }
        }

        for (let index of lines) {
            this.playfield.splice(index, 1);
            this.playfield.unshift( new Array(Game.columns).fill(0))
        }

        return lines.length;
    }

    updatePieces() {
        this.activePiece = this.nextPiece;
        this.nextPiece = Game.createPiece();
    }

    updateScore (clearedLines) {
        if (clearedLines > 0) {
            this.score += Game.points[clearedLines] * (this.level + 1);
            this.lines += clearedLines;
        }
    }
}
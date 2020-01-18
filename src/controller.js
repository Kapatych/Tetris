export default class Controller {
    constructor(game, view) {
        this.game = game;
        this.view = view;
        this.isPlaying = false;
        this.intervalId = null;

        this.speed = 1000;

        document.addEventListener("keydown", this.handleKeyDown.bind(this));

        this.view.renderStartScreen();
    }

    update() {
        this.game.movePieceDown();
        this.updateSpeed();
        this.updateView();
    }

    play() {
        this.isPlaying = true;
        this.startTimer();
        this.updateView();
    }

    pause() {
        this.isPlaying = false;
        this.stopTimer();
        this.updateView();
    }

    reset() {
        this.game.resetState();
        this.stopTimer();
        this.play();
    }

    updateSpeed() {
        const state = this.game.getState();

        if (this.speed !== state.speed) {
            this.stopTimer();
            this.speed = state.speed;
            this.startTimer();
        }
    }

    updateView() {
        const state = this.game.getState();
        if (state.isGameOver) {
            this.view.renderEndScreen(state);
        } else if (!this.isPlaying) {
            this.view.renderPauseScreen();
        } else {
            this.view.renderMainScreen(state);
        }
    }

    startTimer() {
        if (!this.intervalId) {
            this.intervalId = setInterval(() => this.update(), this.speed === 0 ? 100 : this.speed);
        }
    }

    stopTimer() {
        if (this.intervalId) {
            clearInterval(this.intervalId);
            this.intervalId = null;
        }
    }

    handleKeyDown(event) {
        const state = this.game.getState();

        switch (event.key) {
            case "Enter":
                if (state.isGameOver) {
                    this.reset();
                } else if (this.isPlaying) {
                    this.pause()
                } else {
                    this.play()
                }
                break;
            case "Down": // IE/Edge specific value
            case "ArrowDown":
                if (this.isPlaying) {
                    this.game.movePieceDown();
                    this.updateView();
                }
                break;
            case "Left": // IE/Edge specific value
            case "ArrowLeft":
                if (this.isPlaying) {
                    this.game.movePieceLeft();
                    this.updateView();
                }
                break;
            case "Right": // IE/Edge specific value
            case "ArrowRight":
                if (this.isPlaying) {
                    this.game.movePieceRight();
                    this.updateView();
                }
                break;
            case "Up": // IE/Edge specific value
            case "ArrowUp":
                if (this.isPlaying) {
                    this.game.rotatePiece();
                    this.updateView();
                }
                break;
        }
    }
};
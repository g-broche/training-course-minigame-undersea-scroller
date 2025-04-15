import { Player } from "./entities/Player.js";
import { Controller } from "./mechanics/Controller.js";
import { InitializationError } from "./mechanics/Errors.js";
import { GameBoard } from "./mechanics/GameBoard.js"

export class App {
    static #instance = null;
    /** @type { GameBoard } */
    gameBoard = null;
    /** @type { Controller } */
    controller = null;
    /** @type { Player } */
    player = null;
    isPaused = false;
    constructor() {
        if (App.#instance) {
            return App.#instance;
        }
        App.#instance = this;
    }
    static getInstance() {
        if (!App.#instance) {
            App.#instance = new App();
        }
        return App.#instance;
    }
    consumeActions() {
        for (const action of this.controller.getActionsToExecute()) {
            this.handleAction(action);
        }
        this.player.ActualizeDisplayLocation();
    }

    handleAction(action) {
        switch (action) {
            case "moveUp":
                this.player.moveUp();
                break;
            case "moveRight":
                this.player.moveRight(this.gameBoard.getBoundaries().right);
                break;
            case "moveDown":
                this.player.moveDown(this.gameBoard.getBoundaries().bottom);
                break;
            case "moveLeft":
                this.player.moveLeft();
                break;
            case "fire":
                console.log("firing");
                break;
            case "pause":
                this.isPaused = !this.isPaused
                console.log(`${this.isPaused ? "game has been paused" : "game has resumed"}`);
                break;

            default:
                break;
        }
    }
    run() {
        console.log("App has started");
        try {
            this.gameBoard = GameBoard.getInstance();
            this.gameBoard.initialize("game-board");
            this.controller = Controller.getInstance();
            this.player = Player.getInstance();
            this.playRound();
        } catch (error) {
            console.log(`Error type ${error.constructor.name} : ${error.message}`, error);
        }
    }
    playRound() {
        console.log("start round")
        if (!this.gameBoard) {
            throw new InitializationError("Gameboard has not been initialized when starting new round");
        }
        if (!this.controller) {
            throw new InitializationError("Controller has not been initialized when starting new round");
        }
        window.addEventListener("keydown", (e) => {
            console.log(e.code)
            this.controller.addInput(e.code)
        })
        window.addEventListener("keyup", (e) => {
            this.controller.removeInput(e.code)
        })
        this.gameBoard.addPlayer()
        this.playFrame()
    }
    playFrame() {
        this.consumeActions()
        if (!this.isPaused) {
            window.requestAnimationFrame(() => { this.playFrame() });
        }
    }
}
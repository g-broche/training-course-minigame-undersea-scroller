import { InitializationError } from "./mechanics/Errors.js";
import { GameBoard } from "./mechanics/GameBoard.js"

export class App {
    static #instance = null;
    /** @type { GameBoard } */
    gameBoard = null;
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
    run() {
        console.log("App has started");
        try {
            this.gameBoard = GameBoard.getInstance();
            this.gameBoard.initialize("game-board");
            this.playRound();
        } catch (error) {
            console.log(`Error type ${error.constructor.name} : ${error.message}`, error)
        }
    }
    playRound() {
        console.log("start round")
        if (!this.gameBoard) {
            throw new InitializationError("Gameboard has not been initialized when starting new round");
        }
        this.gameBoard.addPlayer()
    }
}
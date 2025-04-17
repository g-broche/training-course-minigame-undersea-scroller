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
    delayBetweenSpawns = 5;
    framesUntilNextSpawn = 0;
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
    reloadNextSpawn() {
        console.log(this.framesUntilNextSpawn)
        if (this.framesUntilNextSpawn === 0) {
            return
        }
        if (this.framesUntilNextSpawn > 0) {
            this.framesUntilNextSpawn--
            return;
        }
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
                this.player.fireProjectile(this.gameBoard);
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
            if (e.code === "KeyP") {
                this.isPaused = !this.isPaused;
                if (!this.isPaused) {
                    this.playFrame();
                }
                console.log(`${this.isPaused ? "game has been paused" : "game has resumed"}`);
                return;
            }
            this.controller.addInput(e.code);
        })
        window.addEventListener("keyup", (e) => {
            this.controller.removeInput(e.code);
        })
        this.gameBoard.addPlayer();
        this.playFrame();
    }
    playFrame() {
        this.reloadNextSpawn();
        this.player.reloadNextShot();
        this.consumeActions();
        for (let [projectileId, projectile] of this.player.getShots()) {
            projectile.move();
            projectile.ActualizeDisplayLocation();
            if (this.gameBoard.isOutOfBounds(projectile)) {
                projectile.removeFromDom();
                projectile = null;
                this.player.addShotsToDespawner(projectileId);
            }
        }
        this.player.despawnExpiredShots()
        if (this.framesUntilNextSpawn === 0) {
            this.gameBoard.addEnemyAtRandom();
            this.framesUntilNextSpawn = this.delayBetweenSpawns * 60;
        }

        if (!this.isPaused) {
            window.requestAnimationFrame(() => { this.playFrame() });
        }
    }
}
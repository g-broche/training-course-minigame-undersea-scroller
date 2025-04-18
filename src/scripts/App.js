/*
TO DO :
    handle player death gracefully
    add replay round
    add UI feedback (start game, pause, etc...)
    add visual assets
*/


import { Player } from "./entities/Player.js";
import { Controller } from "./mechanics/Controller.js";
import { InitializationError } from "./mechanics/Errors.js";
import { GameBoard } from "./mechanics/GameBoard.js"
import { ScoreBoard } from "./mechanics/ScoreBoard.js";

export class App {
    static #instance = null;
    /** @type { GameBoard } */
    gameBoard = null;
    /** @type { Controller } */
    controller = null;
    /** @type { ScoreBoard } */
    scoreBoard = null;
    /** @type { Player } */
    player = null;
    isPaused = false;
    #IsPlaying = false;
    #isInitialized = false;
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
    togglePause() {
        this.isPaused = !this.isPaused;
        if (!this.isPaused) {
            console.log("resuming game");
            this.playFrame();
            this.scoreBoard.startClock();
            return;
        }
        this.scoreBoard.stopClock();
        console.log("pausing game");
    }
    initialize() {
        window.addEventListener("keydown", (e) => {
            if (!this.#isInitialized) {
                return
            }
            if (!this.#IsPlaying) {
                this.playRound()
                return
            }
            if (e.code === "KeyP") {
                this.togglePause();
                return;
            }
            this.controller.addInput(e.code);
        })
        window.addEventListener("keyup", (e) => {
            this.controller.removeInput(e.code);
        })
    }
    run() {
        try {
            console.log("App has started");
            this.gameBoard = GameBoard.getInstance();
            this.gameBoard.initialize("game-board");
            this.scoreBoard = ScoreBoard.getInstance();
            this.scoreBoard.initialize("scoreboard");
            this.controller = Controller.getInstance();
            this.player = Player.getInstance();
            this.initialize();
            this.#isInitialized = true;
        } catch (error) {
            console.log(`Error type ${error.constructor.name} : ${error.message}`, error);
        }
    }
    playRound() {
        this.#IsPlaying = true
        this.scoreBoard.startClock()
        console.log("start round")
        if (!this.gameBoard) {
            throw new InitializationError("Gameboard has not been initialized when starting new round");
        }
        if (!this.controller) {
            throw new InitializationError("Controller has not been initialized when starting new round");
        }
        this.gameBoard.addPlayer();
        this.playFrame();
    }
    playFrame() {
        this.reloadNextSpawn();
        this.player.reloadNextShot();
        this.consumeActions();
        this.handlePlayerProjectileActions()
        this.gameBoard.clearDeadEnemies()
        this.player.despawnExpiredShots()
        this.handleEnemyActions()
        this.handleEnemiesProjectileActions()
        if (this.framesUntilNextSpawn === 0) {
            this.gameBoard.addEnemyAtRandom();
            this.framesUntilNextSpawn = this.delayBetweenSpawns * 60;
        }

        if (!this.isPaused) {
            window.requestAnimationFrame(() => { this.playFrame() });
        }
    }
    handlePlayerProjectileActions() {
        for (let [projectileId, projectile] of this.player.getShots()) {
            projectile.move();
            projectile.ActualizeDisplayLocation();
            for (let [enemyId, enemy] of this.gameBoard.enemies) {
                if (projectile.hasCollisionWith(enemy)) {
                    enemy.takeHit(projectile.damage);
                    this.queueProjectileForDeletion({ projectileId: projectileId, projectile: projectile });
                    if (!enemy.isAlive()) {
                        this.scoreBoard.incrementDefeatedEnemyCounter();
                        this.scoreBoard.increaseScore(enemy.getPointValue());
                        this.gameBoard.addEnemyToDespawnList(enemyId);
                    }
                    break;
                }
            }
            if (this.gameBoard.isOutOfBounds(projectile)) {
                this.queueProjectileForDeletion({ projectileId: projectileId, projectile: projectile })
            }
        }
    }
    handleEnemiesProjectileActions() {
        for (const [enemyId, enemy] of this.gameBoard.enemies) {
            for (let [projectileId, projectile] of enemy.getShots()) {
                projectile.move();
                projectile.ActualizeDisplayLocation();
                if (projectile.hasCollisionWith(this.player)) {
                    this.player.takeHit(projectile.damage)
                    this.queueProjectileForDeletion({ projectileId: projectileId, projectile: projectile })
                    if (!this.player.isAlive()) {
                        console.log("player is dead")
                        alert("player Died")
                    }
                }
                if (this.gameBoard.isOutOfBounds(projectile)) {
                    this.queueProjectileForDeletion({ projectileId: projectileId, projectile: projectile })
                }
            }
            enemy.despawnExpiredShots()
        }
    }
    handleEnemyActions() {
        for (const [enemyId, enemy] of this.gameBoard.enemies) {
            enemy.reloadNextShot()
            const rng = Math.floor(Math.random() * 3) + 1;
            rng === 3
                ? enemy.fireAimedProjectile(this.gameBoard, this.player)
                : enemy.fireProjectile(this.gameBoard)
        }
    }
    queueProjectileForDeletion({ projectileId, projectile }) {
        projectile.removeFromDom();
        projectile.owner.addShotsToDespawner(projectileId);
        projectile = null;
    }
}
/*
TO DO :
    handle movable sizing through JS instead of calculting from style
    add visual assets
*/


import { Player } from "./entities/Player.js";
import { Controller } from "./mechanics/Controller.js";
import { InitializationError } from "./mechanics/Errors.js";
import { GameBoard } from "./mechanics/GameBoard.js"
import { Instruction } from "./mechanics/Instruction.js";
import { Modal } from "./mechanics/Modal.js";
import { ScoreBoard } from "./mechanics/ScoreBoard.js";

export class App {
    static #instance = null;
    /** @type { GameBoard } */
    gameBoard = null;
    /** @type { Controller } */
    controller = null;
    /** @type { ScoreBoard } */
    scoreBoard = null;
    /** @type { Instruction } */
    instruction = null;
    /** @type { Modal } */
    modal = null;
    /** @type { Player } */
    player = null;
    #isPaused = false;
    #isPlaying = false;
    #isInitialized = false;
    #isInitialStart = true;
    #isModalOpen = false;
    #maxSimultaneousEnemies = 5;
    delayBetweenSpawns = 5;
    framesUntilNextSpawn = 0;
    constructor() {
        if (App.#instance) {
            return App.#instance;
        }
        App.#instance = this;
    }
    setIsPlaying(bool) {
        this.#isPlaying = bool;
        if (this.#isPlaying) {
            this.instruction.clearInstruction()
        }
    }
    setIsPause(bool) {
        this.#isPaused = bool;
        this.#isPaused ? this.instruction.displayPauseMessage() : this.instruction.clearInstruction()
    }
    static getInstance() {
        if (!App.#instance) {
            App.#instance = new App();
        }
        return App.#instance;
    }
    /**
     * decrements frames until next enemy spawn if necessary
     * 
     */
    reloadNextSpawn() {
        if (this.framesUntilNextSpawn === 0) {
            return
        }
        if (this.framesUntilNextSpawn > 0) {
            this.framesUntilNextSpawn--
            return;
        }
    }
    /**
     * takes inputed keys from Controller to associate the action to execute and actualize the user display
     */
    consumeActions() {
        for (const action of this.controller.getActionsToExecute()) {
            this.handleAction(action);
        }
        this.player.ActualizeDisplayLocation();
    }
    /**
     * for a given action execute the associated behavior
     * @param {*} action 
     */
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
    /**
     * handle pausing and resuming game and associated side effects 
     */
    togglePause() {
        this.setIsPause(!this.#isPaused);
        if (!this.#isPaused) {
            console.log("resuming game");
            this.playFrame();
            this.scoreBoard.startClock();
            return;
        }
        this.scoreBoard.stopClock();
        console.log("pausing game");
    }
    /**
     * Initialize App by adding input listeners
     */
    initialize() {
        window.addEventListener("keydown", (e) => {
            if (!this.#isInitialized || this.#isModalOpen === true) {
                return
            }
            if (!this.#isPlaying) {
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
    /**
     * main wrapper method of the app logic instancing dependencies and initializing input listeners
     */
    run() {
        try {
            console.log("App has started");
            this.gameBoard = GameBoard.getInstance();
            this.gameBoard.initialize("game-board");
            this.scoreBoard = ScoreBoard.getInstance();
            this.scoreBoard.initialize("scoreboard");
            this.controller = Controller.getInstance();
            this.instruction = Instruction.getInstance();
            this.instruction.setDomElement("instruction-message")
            this.modal = Modal.getInstance();
            this.gameBoard.domElements.board.append(...this.modal.createModalStructure())
            this.modal.initialize({
                actionOnClose: () => {
                    this.instruction.displayStandbyMessage()
                    this.#isModalOpen = false;
                }
            })
            this.player = Player.getInstance();
            this.initialize();
            this.#isInitialized = true;
            this.instruction.displayStandbyMessage();
        } catch (error) {
            console.log(`Error type ${error.constructor.name} : ${error.message}`, error);
        }
    }
    /**
     * starts a keeps a round going
     */
    playRound() {
        this.setIsPlaying(true);
        this.scoreBoard.resetScore();
        this.scoreBoard.startClock();
        console.log("start round");
        if (!this.gameBoard) {
            throw new InitializationError("Gameboard has not been initialized when starting new round");
        }
        if (!this.controller) {
            throw new InitializationError("Controller has not been initialized when starting new round");
        }
        if (this.#isInitialStart) {
            this.gameBoard.addPlayer();
            this.#isInitialStart = false;
        } else {
            this.gameBoard.reset();
        }
        this.playFrame();
    }
    /**
     * action to execute for each frame and will call itself when requesting new frame unless game is paused
     */
    playFrame() {
        this.reloadNextSpawn();
        this.player.reloadNextShot();
        this.consumeActions();
        this.handlePlayerProjectileActions()
        this.gameBoard.clearDeadEnemies()
        this.player.despawnExpiredShots()
        this.handleEnemyActions()
        this.handleEnemiesProjectileActions()
        if (this.framesUntilNextSpawn === 0 && this.gameBoard.getLivingEnemyCount() < this.#maxSimultaneousEnemies) {
            this.gameBoard.addEnemyAtRandom();
            this.framesUntilNextSpawn = this.delayBetweenSpawns * 60;
        }
        if (!this.#isPaused && this.#isPlaying) {
            window.requestAnimationFrame(() => { this.playFrame() });
        }
    }
    /**
     * Handles all player related projectile behaviors and checks for a new frame
     */
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
    /**
     * Handles all enemy related projectile behaviors and checks for a new frame
    */
    handleEnemiesProjectileActions() {
        for (const [enemyId, enemy] of this.gameBoard.enemies) {
            for (let [projectileId, projectile] of enemy.getShots()) {
                projectile.move();
                projectile.ActualizeDisplayLocation();
                if (projectile.hasCollisionWith(this.player)) {
                    this.player.takeHit(projectile.damage)
                    this.queueProjectileForDeletion({ projectileId: projectileId, projectile: projectile })
                    if (!this.player.isAlive()) {
                        this.setIsPlaying(false)
                        this.handleGameOver();
                    }
                }
                if (this.gameBoard.isOutOfBounds(projectile)) {
                    this.queueProjectileForDeletion({ projectileId: projectileId, projectile: projectile })
                }
            }
            enemy.despawnExpiredShots()
        }
    }
    /**
     * Handles all enemy actions for a new frame
    */
    handleEnemyActions() {
        for (const [enemyId, enemy] of this.gameBoard.enemies) {
            enemy.reloadNextShot()
            const rng = Math.floor(Math.random() * 3) + 1;
            rng === 3
                ? enemy.fireAimedProjectile(this.gameBoard, this.player)
                : enemy.fireProjectile(this.gameBoard)
        }
    }
    /**
     * Put an obsolete projectile into a disposal queue to prepare it for removal from the game.
     * @param {*} param0 
     */
    queueProjectileForDeletion({ projectileId, projectile }) {
        projectile.removeFromDom();
        projectile.owner.addShotsToDespawner(projectileId);
        projectile = null;
    }
    createGameOverWindowContent() {
        const contentWrapper = document.createElement("div");
        contentWrapper.className = "game-over-content";
        const title = document.createElement("h2");
        title.textContent = "GAME OVER"
        const messageOverElement = document.createElement("p");
        const messageTime = `You survived for ${this.scoreBoard.getSurvivedTimeString()}s`
        const messageEnemyCount = `defeated ${this.scoreBoard.getDefeatedEnemyCount()} enemies`
        const messageScore = `reaching a total score of ${this.scoreBoard.getScore()} points`
        const message = `${messageTime} and ${messageEnemyCount} ${messageScore}.`
        messageOverElement.textContent = message;
        const messageInstructionElement = document.createElement("p");
        messageInstructionElement.textContent = "Close the window and press any button to start a new game"
        contentWrapper.append(title, messageOverElement, messageInstructionElement)
        return contentWrapper;
    }
    handleGameOver() {
        this.setIsPlaying(false);
        this.scoreBoard.stopClock();
        this.#isModalOpen = true;
        this.modal.appendContent(this.createGameOverWindowContent());
        this.modal.show();
    }
}
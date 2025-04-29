/*
TO DO :
    correct visual asset for tank
    tweak difficulty
    add rules and keymaps
*/


import { Player } from "./entities/Player.js";
import { Projectile } from "./entities/Projectile.js";
import { Controller } from "./mechanics/Controller.js";
import { GameBoard } from "./mechanics/GameBoard.js"
import { Instruction } from "./mechanics/Instruction.js";
import { Modal } from "./mechanics/Modal.js";
import { ScoreBoard } from "./mechanics/ScoreBoard.js";
import { throttleWithDebounce } from "./utils/utils.js";

/**
 * Singleton encompassing the whole App logic
 */
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
    #maxSimultaneousEnemies = 10;
    #spawnCount = 0;
    delayBetweenSpawns = 5;
    framesUntilNextSpawn = 60;
    #frameRequestId = null;
    #enemyTypes = [
        "base",
        "sharpshooter",
        "tank"
    ]
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
    /**
     * set if the game is in play or standby mode and handle side effects related to that state
     * @param {boolean} bool 
     */
    setIsPlaying(bool) {
        this.#isPlaying = bool;
        if (this.#isPlaying) {
            this.instruction.clearInstruction()
        } else {
            this.player.pauseAnimation()
        }
    }
    /**
     * set if the game is live or in pause and handle side effects related to that state
     * @param {boolean} bool 
     */
    setIsPause(bool) {
        this.#isPaused = bool;
        if (this.#isPaused) {
            this.instruction.displayPauseMessage()
            this.player.pauseAnimation()
        } else {
            this.instruction.clearInstruction()
            this.player.startAnimation()
        }
    }
    /**
     * Decrements frames until next enemy spawn if necessary
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
     * Takes inputed keys from Controller to associate the action to execute and actualize the user display
     */
    consumeActions() {
        for (const action of this.controller.getActionsToExecute()) {
            this.handleAction(action);
        }
        this.player.ActualizeDisplayLocation();
    }
    /**
     * For a given action execute the associated behavior
     * @param {string} action 
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
     * Handles pausing and resuming game and associated side effects 
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
        this.stopGame()
        console.log("pausing game");
    }

    /**
     * initializethe various Singletons required for the App to run
     */
    InitializeComponents() {
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
    }

    /**
     * Initialize App listeners
     */
    initializeListeners() {
        window.addEventListener("resize", throttleWithDebounce(() => {
            this.#isPlaying = false;
            this.stopGame();
            this.gameBoard.initialize("game-board");
            this.playRound();
        }, 1000, 1200))
        window.addEventListener("keydown", (e) => {
            // disable default browser events on game keys to not conflict with gameplay
            if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", "Enter", "Space"].includes(e.code)) {
                console.log("prevented")
                e.preventDefault();
            }
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
            this.InitializeComponents()
            this.initializeListeners();
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
        console.log("start round");
        this.ResetGame()
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
        this.handleEnemySpawn()
        if (this.#isPlaying && !this.#isPaused) {
            this.#frameRequestId = window.requestAnimationFrame(() => { this.playFrame() });
        }
    }
    /**
     * Spawns new enemy if the timing is right and put spawning on cooldown for required duration
     */
    handleEnemySpawn() {
        if (this.framesUntilNextSpawn === 0 && this.gameBoard.getLivingEnemyCount() < this.#maxSimultaneousEnemies) {
            this.gameBoard.addEnemyAtRandomPlace(this.pickEnemyTypeToSpawn());
            this.framesUntilNextSpawn = this.delayBetweenSpawns * 60;
            this.#spawnCount++
        }
    }
    /**
     * Pick an enemy type to spawn based on current spawn count
     * @returns {string} string of enemy type
     */
    pickEnemyTypeToSpawn() {
        if (this.#spawnCount !== 0 && this.#spawnCount % 5 === 0) {
            return this.#enemyTypes[2]
        }
        if (this.#spawnCount !== 0 && this.#spawnCount % 3 === 0) {
            return this.#enemyTypes[1]
        }
        return this.#enemyTypes[0]
    }

    /**
     * Handles all player related projectile behaviors and checks for a new frame
     * 
     * 
     */
    handlePlayerProjectileActions() {
        // for each shot, moves projectile
        for (let [projectileId, projectile] of this.player.getShots()) {
            projectile.move();
            projectile.ActualizeDisplayLocation();
            // checks if enemy is hit and handles such case
            for (let [enemyId, enemy] of this.gameBoard.enemies) {
                if (!enemy.isAlive()) {
                    break;
                }
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
            // queue projectile for despawn if out of board
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
            if (this.gameBoard.isPlayerLeftFromEnemy(enemy)) {
                enemy.setFacedDirection(false)
            } else {
                enemy.setFacedDirection(true)
            }
            enemy.fire(this.gameBoard, this.player)
            enemy.move()
            enemy.ActualizeDisplayLocation()
            if (this.gameBoard.isOutOfBounds(enemy)) {
                this.setIsPlaying(false)
                this.handleGameOver();
            }
        }
    }
    /**
     * Put an obsolete projectile into a disposal queue to prepare it for removal from the game.
     * @param {{ projectileId: number, projectile: Projectile }} param0 
     */
    queueProjectileForDeletion({ projectileId, projectile }) {
        projectile.removeFromDom();
        projectile.owner.addShotsToDespawner(projectileId);
        projectile = null;
    }
    /**
     * creates dom content intended to be displayed in the modal on defeat
     * @returns {HTMLDivElement}
     */
    createGameOverWindowContent() {
        const contentWrapper = document.createElement("div");
        contentWrapper.className = "game-over-content";
        const title = document.createElement("h2");
        title.textContent = "GAME OVER"
        const messageOverElement = document.createElement("p");
        const messageTime = `You survived for ${this.scoreBoard.getSurvivedTimeString()}`
        const messageEnemyCount = `defeated ${this.scoreBoard.getDefeatedEnemyCount()} enemies`
        const messageScore = `reaching a total score of ${this.scoreBoard.getScore()} points`
        const message = `${messageTime} and ${messageEnemyCount} ${messageScore}.`
        messageOverElement.textContent = message;
        const messageInstructionElement = document.createElement("p");
        messageInstructionElement.textContent = "Close the window and press any button to start a new game"
        contentWrapper.append(title, messageOverElement, messageInstructionElement)
        return contentWrapper;
    }

    /**
     * Handle methods call related to game over logic
     */
    handleGameOver() {
        this.stopGame()
        this.setIsPlaying(false);
        this.scoreBoard.stopClock();
        this.#isModalOpen = true;
        this.modal.appendContent(this.createGameOverWindowContent());
        this.modal.show();
    }

    /**
     * reset board to a clean state, respawn player to base position and reset properties to start values
     */
    ResetGame() {
        this.stopGame()
        this.scoreBoard.stopClock();
        this.setIsPlaying(true);
        this.scoreBoard.resetScore();
        this.scoreBoard.startClock();
        this.framesUntilNextSpawn = 60;
        this.#spawnCount = 0;
        if (this.#isInitialStart) {
            this.gameBoard.addPlayer();
            this.#isInitialStart = false;
        } else {
            this.gameBoard.reset();
        }
        Projectile.resetProjectileIdIncrementor()
        this.player.resetAnimation()
    }

    /**
     * stop the game at a given frame in case of pause or game over
     */
    stopGame() {
        if (this.#frameRequestId !== null) {
            cancelAnimationFrame(this.#frameRequestId);
            this.#frameRequestId = null;
        }
    }
}
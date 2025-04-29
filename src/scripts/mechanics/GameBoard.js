import { Charger } from "../entities/Charger.js";
import { Enemy } from "../entities/Enemy.js";
import { Movable } from "../entities/Movable.js";
import { Player } from "../entities/Player.js";
import { Projectile } from "../entities/Projectile.js";
import { Sharpshooter } from "../entities/Sharpshooter.js";
import { Tank } from "../entities/Tank.js";

/**
 * Gameboard singleton represent the area in play during the game
 */
export class GameBoard {
    static #instance = null
    /** @type {{ board: HTMLDivElement }} */
    domElements = {
        board: null
    };
    /** @type { Player } */
    player = null
    enemies = new Map();
    sizes = {
        height: null,
        width: null,
    }
    spawnArea = {
        enemy: {
            xMin: null,
            xMax: null,
            yMin: null,
            yMax: null
        }
    }
    moveSpeedBase = null;
    MaxSpawnRetry = 5;
    #enemiesToDespawn = new Set();
    #cleanedEnemiesId = new Set();
    constructor() {
        if (GameBoard.#instance) {
            return GameBoard.#instance;
        }
        GameBoard.#instance = this;
    }
    static getInstance() {
        if (!GameBoard.#instance) {
            GameBoard.#instance = new GameBoard();
        }
        return GameBoard.#instance;
    }
    /**
     * initialize class properties based on size 
     * @param {*} boardId 
     */
    initialize(boardId) {
        this.domElements.board = document.getElementById(boardId);
        this.sizes.height = this.domElements.board.offsetHeight;
        this.sizes.width = this.domElements.board.offsetWidth;
        this.setAllowedEnemySpawnArea()
        this.moveSpeedBase = this.sizes.width / 300;
        Projectile.setBaseProjectileVelocity(this.moveSpeedBase * 1.25)
        Movable.setBaseMoveSpeed(this.moveSpeedBase);
    }
    /**
     * given a ratio will return the amount of pixel equal to ratio% of board's width
     * @param {number} ratio 
     * @returns {number} pixel amount
     */
    calculateRatioPixelFromBoardWidth(ratio) {
        return this.sizes.width / 100 * ratio
    }
    /**
     * given a ratio will return the amount of pixel equal to ratio% of board's height
     * @param {number} ratio 
     * @returns {number} pixel amount
     */
    calculateRatioPixelFromBoardHeight(ratio) {
        return this.sizes.height / 100 * ratio
    }

    /**
     * Reset board to initial start of round state
     */
    reset() {
        for (let [enemyId, enemy] of this.enemies) {
            enemy.clearAllProjectiles();
            enemy.removeFromDom();
            enemy = null;
        }
        this.enemies.clear();
        this.player.resetToInitialState()
        this.respawnPlayer();
    }
    /**
     * get the number of alive enemies. Important for handling max spawn logic since enemies
     * are not remove instantly on death to avoid null pointer reference while their projectiles
     * are still in play
     * @returns {number}
     */
    getLivingEnemyCount() {
        return Array.from(this.enemies.values()).filter((enemy) => enemy.isAlive()).length;
    }
    /**
     * 
     * @returns {right: number, bottom: number} right and bottom boundaries of the gameboard
     * corresponding to its width and height values.
     */
    getBoundaries() {
        return {
            right: this.domElements.board.offsetWidth,
            bottom: this.domElements.board.offsetHeight,
        }
    }
    /**
     * Add player to the board both in the board property and in the dom
     */
    addPlayer() {
        this.player = Player.getInstance();
        this.player.setSpeed({
            moveSpeedX: this.moveSpeedBase,
            moveSpeedY: this.moveSpeedBase / 2
        })
        const playerElement = this.player.createElement();
        this.player.toggleVisibility(false)
        this.player.setSize(this)
        this.domElements.board.append(playerElement);
        this.respawnPlayer()

    }
    /**
     * respawn player to initial start position and restart animation
     */
    respawnPlayer() {
        this.player.setPosition({ posX: this.player.sizes.halfWidth, posY: this.sizes.height / 2 });
        this.player.ActualizeDisplayLocation();
        this.player.toggleVisibility(true)
        this.player.startAnimation()
    }
    /**
     * define spawn allowed areas on the right side for spawning enemies
     */
    setAllowedEnemySpawnArea() {
        this.spawnArea.enemy.xMin = this.sizes.width * 0.80;
        this.spawnArea.enemy.xMax = this.sizes.width * 0.95;
        this.spawnArea.enemy.yMax = this.sizes.height * 0.90;
        this.spawnArea.enemy.yMin = this.sizes.height * 0.10;
    }

    /**
     * Pick a coordinate inside the allowed enemy spawn area
     * @returns {posX: number, posY: number} spawn location set at random inside the allowed spawn area
     */
    setRandomSpawnLocation() {
        return {
            posX: Math.random() * (this.spawnArea.enemy.xMax - this.spawnArea.enemy.xMin) + this.spawnArea.enemy.xMin,
            posY: Math.random() * (this.spawnArea.enemy.yMax - this.spawnArea.enemy.yMin) + this.spawnArea.enemy.yMin
        }
    }
    /**
     * creates a new enemy instance
     * @param {string} enemyType keyname of enemy type "tank" or "sharpshooter", default to "charger"
     * @returns 
     */
    createEnemyUnit(enemyType) {
        if (enemyType === "tank") {
            return Tank.create();
        }
        if (enemyType === "sharpshooter") {
            return Sharpshooter.create();
        }
        return Charger.create();
    }
    /**
     * Adds new enemy to the board while actively prevent spawn collision
     * @param {string} enemyType used for special enemies ("sharpshooter" and "tank")
     * @returns 
     */
    addEnemyAtRandomPlace(enemyType = null) {
        try {
            // creates new enemy based on type
            const newEnemy = this.createEnemyUnit(enemyType)
            newEnemy.enemy.setSpeed({
                moveSpeedX: -this.moveSpeedBase,
                moveSpeedY: 0
            })
            // creates dom element of new enemy adds it to the dom
            const newEnemyElement = newEnemy.enemy.createElement()
            newEnemy.enemy.toggleVisibility(false)
            newEnemy.enemy.setSize(this)
            this.domElements.board.append(newEnemyElement);
            const randomCoords = this.setRandomSpawnLocation()
            newEnemy.enemy.setPosition(randomCoords);
            let spawnRetry = 0;
            // console.log(`>>> NEW UNIT SPAWN STARTS`);
            let isCollidingWithExistingEntities = this.isCollidingWithExistingActorsOnSpawn(newEnemy.enemy)
            // console.log(`>>>>>> Initial collision triggered : `, isCollidingWithExistingEntities);
            while (isCollidingWithExistingEntities && spawnRetry < this.MaxSpawnRetry) {
                spawnRetry++
                // console.log(`>>>>>> Attempting spawn at new location ${spawnRetry}`);
                const newRandomCoords = this.setRandomSpawnLocation()
                newEnemy.enemy.setPosition(newRandomCoords);
                isCollidingWithExistingEntities = this.isCollidingWithExistingActorsOnSpawn(newEnemy.enemy)
            }
            if (spawnRetry >= this.MaxSpawnRetry && isCollidingWithExistingEntities) {
                // console.log(`!!!!!!!!! ABORTING SPAWN AFTER TOO MANY RELOCATION ATTEMPTS`);
                newEnemyElement.remove();
                newEnemy.enemy = null;
                return;
            }
            this.enemies.set(newEnemy.id, newEnemy.enemy)
            newEnemy.enemy.ActualizeDisplayLocation();
            if (this.isPlayerLeftFromEnemy(newEnemy.enemy)) {
                newEnemy.enemy.setFacedDirection(false)
            } else {
                newEnemy.enemy.setFacedDirection(true)
            }
            newEnemy.enemy.toggleVisibility(true)
            // console.log(`********* New enemy was added `);

        } catch (error) {
            console.log(error)
        }
    }
    /**
     * Checks if a movable is colliding with any actor
     * @param {Movable} movable 
     * @return {boolean} true if collision, false otherwise
     */
    isCollidingWithExistingActorsOnSpawn(movable) {
        if (movable.hasCollisionWith(this.player)) {
            return true
        }
        const enemyArray = Array.from(this.enemies.values())
        return enemyArray.some((enemy) => {
            const result = movable.hasCollisionWith(enemy);
            return result;
        })
    }

    /**
     * Queues enemy for despawn
     * @param {number} enemyId 
     */
    addEnemyToDespawnList(enemyId) {
        this.#enemiesToDespawn.add(enemyId)
    }
    /**
     * despawn enemies in despawn queue if they don't have any live shot in play to
     * prevent null pointers
     */
    clearDeadEnemies() {
        for (const enemyId of this.#enemiesToDespawn) {
            let enemyToDelete = this.enemies.get(enemyId);
            if (enemyToDelete) {
                enemyToDelete.removeFromDom();
                if (!enemyToDelete.hasLiveShots()) {
                    enemyToDelete = null
                    // adding despawned enemy id to set to then remove this enemyId from despawn queue
                    this.#cleanedEnemiesId.add(enemyId)
                    this.enemies.delete(enemyId)
                }
            }
        }
        for (const cleanedEnemyId of this.#cleanedEnemiesId) {
            this.#enemiesToDespawn.delete(cleanedEnemyId)
        }
        this.#cleanedEnemiesId.clear()
    }
    /**
     * Checks if a Movable instance is out of the gameboard
     * @param {*} movable 
     * @returns true if out of bounds, false otherwise
     */
    isOutOfBounds(movable) {
        return movable.positions.boundaries.top > this.sizes.height
            || movable.positions.boundaries.left > this.sizes.width
            || movable.positions.boundaries.bottom < 0
            || movable.positions.boundaries.right < 0
    }
    /**
     * evaluates horizontal position of the player relative to an enemy
     * @param {Enemy} enemy
     * @returns {boolean} true if player is left of given entity, false otherwise
     */
    isPlayerLeftFromEnemy(enemy) {
        return enemy.positions.boundaries.left > this.player.positions.boundaries.right
    }
}

import { BaseEnemy } from "../entities/BaseEnemy.js";
import { Movable } from "../entities/Movable.js";
import { Player } from "../entities/Player.js";
import { Projectile } from "../entities/Projectile.js";

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
    initialize(boardId) {
        console.log("initialize board")
        this.domElements.board = document.getElementById(boardId);
        console.log(this.domElements.board.offsetWidth)
        this.sizes.height = this.domElements.board.offsetHeight;
        this.sizes.width = this.domElements.board.offsetWidth;
        this.setAllowedEnemySpawnArea()
        this.moveSpeedBase = this.sizes.width / 300;
        Projectile.setBaseProjectileVelocity(this.moveSpeedBase * 1.25)
        Movable.setBaseMoveSpeed(this.moveSpeedBase);
    }
    calculateRatioPixelFromBoardWidth(ratio) {
        return this.sizes.width / 100 * ratio
    }
    calculateRatioPixelFromBoardHeight(ratio) {
        return this.sizes.height / 100 * ratio
    }
    reset() {
        this.player.restoreToFullHealth();
        this.respawnPlayer();
        for (let [enemyId, enemy] of this.enemies) {
            enemy.clearAllProjectiles();
            enemy.removeFromDom();
            enemy = null
        }
        this.enemies.clear()
    }
    getLivingEnemyCount() {
        return Array.from(this.enemies.values()).filter((enemy) => enemy.isAlive()).length;
    }
    getBoundaries() {
        return {
            right: this.domElements.board.offsetWidth,
            bottom: this.domElements.board.offsetHeight,
        }
    }
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
    respawnPlayer() {
        this.player.setPosition({ posX: this.player.sizes.halfWidth, posY: this.sizes.height / 2 });
        this.player.ActualizeDisplayLocation();
        this.player.toggleVisibility(true)
    }
    setAllowedEnemySpawnArea() {
        this.spawnArea.enemy.xMin = this.sizes.width * 0.6;
        this.spawnArea.enemy.xMax = this.sizes.width * 0.95;
        this.spawnArea.enemy.yMax = this.sizes.height * 0.90;
        this.spawnArea.enemy.yMin = this.sizes.height * 0.10;
    }
    setRandomSpawnLocation() {
        return {
            posX: Math.random() * (this.spawnArea.enemy.xMax - this.spawnArea.enemy.xMin) + this.spawnArea.enemy.xMin,
            posY: Math.random() * (this.spawnArea.enemy.yMax - this.spawnArea.enemy.yMin) + this.spawnArea.enemy.yMin
        }
    }
    addEnemyAtRandom() {
        try {
            const newEnemy = BaseEnemy.createBaseEnemy()
            newEnemy.enemy.setSpeed({
                moveSpeedX: this.moveSpeedBase,
                moveSpeedY: this.moveSpeedBase / 2
            })
            const newEnemyElement = newEnemy.enemy.createElement()
            newEnemy.enemy.toggleVisibility(false)
            this.domElements.board.append(newEnemyElement);
            newEnemy.enemy.setSize(this)
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
            newEnemy.enemy.toggleVisibility(true)
            // console.log(`********* New enemy was added `);

        } catch (error) {
            console.log(error)
        }
    }
    /**
     * 
     * @param {Movable} movable 
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

    addEnemyToDespawnList(enemyId) {
        this.#enemiesToDespawn.add(enemyId)
    }
    clearDeadEnemies() {
        for (const enemyId of this.#enemiesToDespawn) {
            let enemyToDelete = this.enemies.get(enemyId);
            if (enemyToDelete) {
                enemyToDelete.removeFromDom();
                if (!enemyToDelete.hasLiveShots()) {
                    enemyToDelete = null
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
    isOutOfBounds(movable) {
        return movable.positions.boundaries.top > this.sizes.height
            || movable.positions.boundaries.left > this.sizes.width
            || movable.positions.boundaries.bottom < 0
            || movable.positions.boundaries.right < 0
    }
}

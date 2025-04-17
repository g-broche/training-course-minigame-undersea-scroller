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
    moveSpeedBase = null
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
        this.domElements.board = document.getElementById(boardId);
        this.sizes.height = this.domElements.board.offsetHeight;
        this.sizes.width = this.domElements.board.offsetWidth;
        this.setAllowedEnemySpawnArea()
        this.moveSpeedBase = this.sizes.width / 300;
        Projectile.setBaseProjectileVelocity(this.moveSpeedBase * 1.25)
        Movable.setBaseMoveSpeed(this.moveSpeedBase);
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
        this.domElements.board.append(playerElement);
        this.player.setSize()
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
            this.enemies.set(newEnemy.id, newEnemy.enemy)
            newEnemy.enemy.setSpeed({
                moveSpeedX: this.moveSpeedBase,
                moveSpeedY: this.moveSpeedBase / 2
            })
            const newEnemyElement = newEnemy.enemy.createElement()
            newEnemy.enemy.toggleVisibility(false)
            this.domElements.board.append(newEnemyElement);
            newEnemy.enemy.setSize()
            const randomCoords = this.setRandomSpawnLocation()
            console.log(randomCoords)
            newEnemy.enemy.setPosition(randomCoords);
            newEnemy.enemy.ActualizeDisplayLocation();
            newEnemy.enemy.toggleVisibility(true)

        } catch (error) {
            console.log(error)
        }
    }

    isOutOfBounds(movable) {
        return movable.positions.boundaries.top > this.sizes.height
            || movable.positions.boundaries.left > this.sizes.width
            || movable.positions.boundaries.bottom < 0
            || movable.positions.boundaries.right < 0
    }
}

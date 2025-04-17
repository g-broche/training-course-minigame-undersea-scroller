import { GameBoard } from "../mechanics/GameBoard.js";
import { Movable } from "./Movable.js";

export class Projectile extends Movable {
    damage;
    /** @type {Movable} */
    owner = null;
    isFromPlayer = false
    /** @type {GameBoard} */
    gameBoard = null
    constructor({ baseClass, owner, damage = 10, speedX, speedY }, gameBoard = GameBoard.getInstance()) {
        super(`projectile ${baseClass}`);
        this.owner = owner;
        this.isFromPlayer = owner.constructor.name === "Player";
        this.damage = damage > 0 ? damage : 10;
        this.setSpeed({
            moveSpeedX: speedX,
            moveSpeedY: speedY
        });
        this.gameBoard = gameBoard;
    }
    /**
     * 
     * @param {Number} shotVelocityFactor 
     * @param {{deltaX: Number, deltaY: Number}} deltaCoordsToTarget 
     */
    static calculateShotSpeedFromVelocityFactor(shotVelocityFactor, deltaCoordsToTarget = null, gameBoard = GameBoard.getInstance()) {
        if (!deltaCoordsToTarget) {
            const moveSpeedX = shotVelocityFactor * gameBoard.moveSpeedBase
            const moveSpeedY = 0
            return {
                moveSpeedX: moveSpeedX,
                moveSpeedY: moveSpeedY
            }
        }
    }

    placeAtOrigin() {
        this.createElement();
        this.toggleVisibility(false)
        this.gameBoard.domElements.board.appendChild(this.domElement.hitbox)
        this.setSize()
        const originX = this.isFromPlayer
            ? this.owner.positions.boundaries.right + this.sizes.halfWidth
            : this.owner.positions.boundaries.left - this.sizes.halfWidth;
        const originY = this.owner.positions.posY;
        this.setPosition({
            posX: originX,
            posY: originY
        })
        this.ActualizeDisplayLocation()
        this.toggleVisibility(true)
    }

    move() {
        this.positions.posX += this.moveSpeed.x;
        this.positions.posY += this.moveSpeed.y;
        this.setBoundaries()
    }
}
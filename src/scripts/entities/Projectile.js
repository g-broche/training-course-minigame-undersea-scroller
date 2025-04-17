import { Movable } from "./Movable.js";

export class Projectile extends Movable {
    static baseProjectileVelocity;
    static projectileIncrementor = 1;
    damage;
    /** @type {Movable} */
    owner = null;
    isFromPlayer = false
    constructor({ baseClass, owner, damage = 10, speedX, speedY }) {
        super(`projectile ${baseClass}`);
        this.owner = owner;
        this.isFromPlayer = owner.constructor.name === "Player";
        this.damage = damage > 0 ? damage : 10;
        this.setSpeed({
            moveSpeedX: speedX,
            moveSpeedY: speedY
        });
    }
    static setBaseProjectileVelocity(newVelocity) {
        Projectile.baseProjectileVelocity = newVelocity
    }
    /**
     * 
     * @param {Number} shotVelocityFactor 
     * @param {{deltaX: Number, deltaY: Number}} deltaCoordsToTarget 
     */
    static calculateShotSpeedFromVelocityFactor(shotVelocityFactor, deltaCoordsToTarget = null) {
        if (!deltaCoordsToTarget) {
            const moveSpeedX = shotVelocityFactor * Projectile.baseProjectileVelocity
            const moveSpeedY = 0
            return {
                moveSpeedX: moveSpeedX,
                moveSpeedY: moveSpeedY
            }
        }
    }

    static createProjectile({ projectileClass, shooter, projectileDamage, projectileSpeedX, projectileSpeedY }) {
        const projectile = {
            id: Projectile.projectileIncrementor,
            projectile: new Projectile(
                {
                    baseClass: projectileClass,
                    owner: shooter,
                    damage: projectileDamage,
                    speedX: projectileSpeedX,
                    speedY: projectileSpeedY
                }
            )
        };
        Projectile.projectileIncrementor++;
        return projectile;
    }

    /**
     * 
     * @param {*} gameBoard 
     */
    placeAtOrigin(gameBoard) {
        this.createElement();
        this.toggleVisibility(false)
        gameBoard.domElements.board.appendChild(this.domElement.hitbox)
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
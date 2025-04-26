import { Movable } from "./Movable.js";

export class Projectile extends Movable {
    static projectileIncrementor = 1;
    static baseProjectileVelocity;
    static #speedFactor = 1
    screenWidthtoEntityWidthRatio = 1.5;
    screenWidthtoEntityHeightRatio = 1.5;
    damage;
    /** @type {Movable} */
    owner = null;
    /** @type {boolean} */
    isFromPlayer = false;
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
    static calculateShotMovement(isFromPlayer = false, shotVelocityFactor, deltaCoordsToTarget = null) {
        if (!deltaCoordsToTarget) {
            const moveSpeedX = isFromPlayer
                ? shotVelocityFactor * Projectile.baseProjectileVelocity
                : shotVelocityFactor * Projectile.baseProjectileVelocity * -1
            const moveSpeedY = 0
            return {
                moveSpeedX: moveSpeedX,
                moveSpeedY: moveSpeedY
            }
        }
        const distanceToTarget = Math.sqrt(
            deltaCoordsToTarget.deltaX * deltaCoordsToTarget.deltaX + deltaCoordsToTarget.deltaY * deltaCoordsToTarget.deltaY
        );
        const unitX = deltaCoordsToTarget.deltaX / distanceToTarget;
        const unitY = deltaCoordsToTarget.deltaY / distanceToTarget;
        const moveSpeedX = unitX * shotVelocityFactor * Projectile.baseProjectileVelocity
        const moveSpeedY = unitY * shotVelocityFactor * Projectile.baseProjectileVelocity
        return {
            moveSpeedX: moveSpeedX,
            moveSpeedY: moveSpeedY
        }
    }

    getSpeedFactor() {
        return Projectile.#speedFactor;
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
        this.setSize(gameBoard)
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
}
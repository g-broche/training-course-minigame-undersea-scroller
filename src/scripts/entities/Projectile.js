import { Movable } from "./Movable.js";
/**
 * class hrepresenting a projectile type of movable
 */
export class Projectile extends Movable {
    static projectileIncrementor = 1;
    static baseProjectileVelocity;
    static #speedFactor = 1
    screenWidthtoEntityWidthRatio = null;
    screenWidthtoEntityHeightRatio = null;
    damage;
    static #framesPlayerProjectile = [
        './src/assets/img/projectiles/heart-blue.png',
    ]
    static #animationDelay = null
    get animationConfig() {
        return this.owner.isPlayer
            ? {
                animationFrames: Projectile.#framesPlayerProjectile,
                animationIntervalDelay: Projectile.#animationDelay,
            }
            : null;
    }
    /** @type {Movable} */
    owner = null;
    /** @type {boolean} */
    constructor({ baseClass, owner, damage = 10, speedX, speedY }) {
        super(`projectile ${baseClass}`);
        this.owner = owner;
        this.isFromPlayer = owner.isPlayer;
        this.damage = damage > 0 ? damage : 10;
        this.screenWidthtoEntityHeightRatio = owner.getProjectileSizeRatio.height
        this.screenWidthtoEntityWidthRatio = owner.getProjectileSizeRatio.width
        this.setSpeed({
            moveSpeedX: speedX,
            moveSpeedY: speedY
        });
    }
    /**
     * Sets base projectile value for all projectiles
     * @param {number} newVelocity 
     */
    static setBaseProjectileVelocity(newVelocity) {
        Projectile.baseProjectileVelocity = newVelocity
    }
    /**
     * calculate the move speed in both axis to give to a projectile, if given a 
     * delta representing the difference with a target position calculation will
     * take into account that difference in both axis to provide a speed that implies
     * the direction to the target while sharing the base velocity of the projectile
     * between both axis of movement
     * @param {Number} shotVelocityFactor 
     * @param {{deltaX: Number, deltaY: Number}} deltaCoordsToTarget 
     */
    static calculateShotMovement(shotVelocityFactor, deltaCoordsToTarget = null) {
        // if no delta coordinates simply return the base velocity multiplied by the velocity factor 
        if (!deltaCoordsToTarget) {
            const moveSpeedX = shotVelocityFactor * Projectile.baseProjectileVelocity
            const moveSpeedY = 0
            return {
                moveSpeedX: moveSpeedX,
                moveSpeedY: moveSpeedY
            }
        }
        // if delta coords are given calculate the distance to target through Pythagorean formula
        const distanceToTarget = Math.sqrt(
            deltaCoordsToTarget.deltaX * deltaCoordsToTarget.deltaX + deltaCoordsToTarget.deltaY * deltaCoordsToTarget.deltaY
        );
        // spread the distance between both axis while taking into account velocity factor
        // and projectile speed
        const unitX = deltaCoordsToTarget.deltaX / distanceToTarget;
        const unitY = deltaCoordsToTarget.deltaY / distanceToTarget;
        const moveSpeedX = unitX * shotVelocityFactor * Projectile.baseProjectileVelocity
        const moveSpeedY = unitY * shotVelocityFactor * Projectile.baseProjectileVelocity
        return {
            moveSpeedX: moveSpeedX,
            moveSpeedY: moveSpeedY
        }
    }
    /**
     * 
     * @returns speed factor of class projectile
     */
    getSpeedFactor() {
        return Projectile.#speedFactor;
    }

    /**
     * provides static method to create a new projectile and associate an id to it
     * @param {*} param0 
     * @returns 
     */
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
     * reset id incrementor to 1
     */
    static resetProjectileIdIncrementor() {
        Projectile.projectileIncrementor = 1
    }

    /**
     * place new projectile at the origine point in front of the projectile's owner
     * @param {*} gameBoard 
     */
    placeAtOrigin(gameBoard) {
        this.createElement();
        this.toggleVisibility(false)
        gameBoard.domElements.board.appendChild(this.domElement.hitbox)
        this.setSize(gameBoard)
        //set origin to be based on owner orientation
        const originX = this.owner.isFacingRight
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
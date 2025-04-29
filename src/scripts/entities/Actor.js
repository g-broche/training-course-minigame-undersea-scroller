import { Movable } from "./Movable.js";
import { Player } from "./Player.js";
import { Projectile } from "./Projectile.js";

/**
 * Parent class of player and enemies
 */
export class Actor extends Movable {
    #maxHealth;
    #health;
    #atkDamage;
    #projectileClass;
    #shotVelocityFactor;
    #isAlive = true;
    hasHealthBar = true;
    isAbleToFire = true;
    rateOfFire;
    framesUntilNextShot = 0;
    #shots = new Map();
    #shotsToDespawn = new Set();
    get isPlayer() { throw new Error("children classes must implement isFromPlayer getter") }
    get getProjectileSizeRatio() { throw new Error("children classes must implement projectileSizeRatio getter") }

    constructor({ baseClass, health, atkDamage, shotVelocityFactor, projectileClass, rateOfFire }) {
        super(baseClass);
        this.#maxHealth = health;
        this.#health = health;
        this.#atkDamage = atkDamage;
        this.rateOfFire = rateOfFire;
        this.#projectileClass = projectileClass;
        this.#shotVelocityFactor = shotVelocityFactor;
    }
    /**
     * 
     * @returns dom classname of the projectile
     */
    getAimedProjectileClass() {
        return this.aimedProjectileClass ? this.aimedProjectileClass : this.#projectileClass
    }
    /**
     * Sets health of entity and will refresh health display
     * @param {*} value new health
     */
    setHealth(value) {
        this.#health = value;
        this.#isAlive = this.#health > 0;
        this.changeDisplayedHealth();
    }
    /**
     * Sets entity health to its maxHP value
     */
    restoreToFullHealth() {
        this.setHealth(this.#maxHealth);
    }
    /**
     * Fire a projectile based on currently faced direction
     * @param {*} gameBoard GameBoard Singleton instance
     *
     */
    fireProjectile(gameBoard) {
        if (!this.isAbleToFire || !this.#isAlive) {
            return;
        }
        // calculate the movement to apply to the projectile on each frame cycle
        const projectileVector = Projectile.calculateShotMovement(
            this.#shotVelocityFactor,
            null
        )
        // create a new projectile with the needed information for instanciation
        const projectileData = Projectile.createProjectile({
            projectileClass: this.#projectileClass,
            shooter: this,
            projectileDamage: this.#atkDamage,
            projectileSpeedX: this.isFacingRight ? projectileVector.moveSpeedX : -projectileVector.moveSpeedX,
            projectileSpeedY: projectileVector.moveSpeedY,
        });
        // adding created projectile to the active shot listing
        this.#shots.set(projectileData.id, projectileData.projectile);
        // place projectile origin point in front of unit
        projectileData.projectile.placeAtOrigin(gameBoard);
        // set cooldown before next shot is allowed
        this.isAbleToFire = false;
        this.framesUntilNextShot = (60 / this.rateOfFire) * 60
    }
    /**
     * Fire a projectile based on a target position
     * @param {*} gameBoard GameBoard Singleton instance
     * @param {*} target Movable target of the shot
     *
     */
    fireAimedProjectile(gameBoard, target) {
        if (!this.isAbleToFire || !this.#isAlive) {
            return;
        }
        // calculate the movement to apply to the projectile using position of this related to target
        const deltaToTargetX = target.positions.posX - this.positions.posX
        const deltaToTargetY = target.positions.posY - this.positions.posY
        const deltaCoordsToTarget = { deltaX: deltaToTargetX, deltaY: deltaToTargetY }
        const projectileVector = Projectile.calculateShotMovement(this.#shotVelocityFactor, deltaCoordsToTarget)
        // create a new projectile with the needed information for instanciation
        const projectileData = Projectile.createProjectile({
            projectileClass: this.getAimedProjectileClass(),
            shooter: this,
            projectileDamage: this.#atkDamage,
            projectileSpeedX: projectileVector.moveSpeedX,
            projectileSpeedY: projectileVector.moveSpeedY,
        });
        // adding created projectile to the active shot listing
        this.#shots.set(projectileData.id, projectileData.projectile);
        // place projectile origin point in front of unit
        projectileData.projectile.placeAtOrigin(gameBoard);
        // set cooldown before next shot is allowed
        this.isAbleToFire = false;
        this.framesUntilNextShot = (60 / this.rateOfFire) * 60 * 1.5
    }
    /**
     * handles decrementing of actor fire action cooldown and ability to fire
     * 
     */
    reloadNextShot() {
        if (this.isAbleToFire) {
            return
        }
        if (this.framesUntilNextShot <= 0) {
            this.isAbleToFire = true
            return
        }
        if (this.framesUntilNextShot > 0) {
            this.framesUntilNextShot--
            return;
        }
    }
    /**
     * 
     * @returns map of shots this entity has fired and are still actively in play
     */
    getShots() {
        return this.#shots;
    }
    /**
     * 
     * @returns true if this unit still has some shots actively in play, false otherwise
     */
    hasLiveShots() {
        return this.#shots.size > 0;
    }
    /**
     * Adds a shot id to the queue for despawing
     * @param {number} shotId id of shots to add to despawn list
     */
    addShotsToDespawner(shotId) {
        this.#shotsToDespawn.add(shotId);
    }
    /**
     * Removes from play all shots which have been queued for despawn
     */
    despawnExpiredShots() {
        for (const id of this.#shotsToDespawn) {
            this.#shots.delete(id)
        }
    }
    /**
     * Removes all projectiles in play belonging to this unit
     */
    clearAllProjectiles() {
        for (let [projectileId, projectile] of this.#shots) {
            projectile.removeElement();
            projectile = null;
        }
        this.#shots.clear()
        this.#shotsToDespawn.clear()
    }
    /**
     * Changes healthbar display to reflect current HP to Max HP ratio
     */
    changeDisplayedHealth() {
        const percentage = this.#health > 0 ? this.#health / this.#maxHealth * 100 : 0;
        this.domElement.healthBarHealth.style.width = `${percentage}%`
    }
    /**
     * Reduce unit health by damage received
     * @param {number} damageReceived 
     */
    takeHit(damageReceived) {
        this.setHealth(this.#health -= damageReceived);
    }
    /**
     * 
     * @returns bool reflecting the unit alive status
     */
    isAlive() {
        return this.#isAlive;
    }

}
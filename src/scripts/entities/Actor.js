import { Movable } from "./Movable.js";
import { Player } from "./Player.js";
import { Projectile } from "./Projectile.js";

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
    constructor({ baseClass, health, atkDamage, shotVelocityFactor, projectileClass, rateOfFire }) {
        super(baseClass);
        this.#maxHealth = health;
        this.#health = health;
        this.#atkDamage = atkDamage;
        this.rateOfFire = rateOfFire;
        this.#projectileClass = projectileClass;
        this.#shotVelocityFactor = shotVelocityFactor;
    }
    getAimedProjectileClass() {
        return this.aimedProjectileClass ? this.aimedProjectileClass : this.#projectileClass
    }
    setHealth(value) {
        this.#health = value;
        this.#isAlive = this.#health > 0;
        this.changeDisplayedHealth();
    }
    restoreToFullHealth() {
        this.setHealth(this.#maxHealth);
    }
    /**
     * 
     */
    fireProjectile(gameBoard) {
        if (!this.isAbleToFire || !this.#isAlive) {
            return;
        }
        const projectileVector = Projectile.calculateShotMovement(
            this.isFromPlayer,
            this.#shotVelocityFactor,
            null
        )
        const projectileData = Projectile.createProjectile({
            projectileClass: this.#projectileClass,
            shooter: this,
            projectileDamage: this.#atkDamage,
            projectileSpeedX: projectileVector.moveSpeedX,
            projectileSpeedY: projectileVector.moveSpeedY,
        });
        this.#shots.set(projectileData.id, projectileData.projectile);
        projectileData.projectile.placeAtOrigin(gameBoard);
        this.isAbleToFire = false;
        this.framesUntilNextShot = (60 / this.rateOfFire) * 60
    }
    /**
     * 
     */
    fireAimedProjectile(gameBoard, target) {
        if (!this.isAbleToFire || !this.#isAlive) {
            return;
        }
        const deltaToTargetX = target.positions.posX - this.positions.posX
        const deltaToTargetY = target.positions.posY - this.positions.posY
        const deltaCoordsToTarget = { deltaX: deltaToTargetX, deltaY: deltaToTargetY }
        const projectileVector = Projectile.calculateShotMovement(this.isFromPlayer, this.#shotVelocityFactor, deltaCoordsToTarget)
        const projectileData = Projectile.createProjectile({
            projectileClass: this.getAimedProjectileClass(),
            shooter: this,
            projectileDamage: this.#atkDamage,
            projectileSpeedX: projectileVector.moveSpeedX,
            projectileSpeedY: projectileVector.moveSpeedY,
        });
        this.#shots.set(projectileData.id, projectileData.projectile);
        projectileData.projectile.placeAtOrigin(gameBoard);
        this.isAbleToFire = false;
        this.framesUntilNextShot = (60 / this.rateOfFire) * 60 * 1.5
    }
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
    getShots() {
        return this.#shots;
    }
    hasLiveShots() {
        return this.#shots.size > 0;
    }
    addShotsToDespawner(shotId) {
        this.#shotsToDespawn.add(shotId);
    }
    despawnExpiredShots() {
        for (const id of this.#shotsToDespawn) {
            this.#shots.delete(id)
        }
    }
    clearAllProjectiles() {
        for (let [projectileId, projectile] of this.#shots) {
            projectile.removeElement();
            projectile = null;
        }
        this.#shots.clear()
        this.#shotsToDespawn.clear()
    }
    changeDisplayedHealth() {
        const percentage = this.#health > 0 ? this.#health / this.#maxHealth * 100 : 0;
        this.domElement.healthBarHealth.style.width = `${percentage}%`
    }
    takeHit(damageReceived) {
        this.setHealth(this.#health -= damageReceived);
    }
    isAlive() {
        return this.#isAlive;
    }

}
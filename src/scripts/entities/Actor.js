import { Movable } from "./Movable.js";
import { Projectile } from "./Projectile.js";

export class Actor extends Movable {
    #health;
    #atkDamage;
    #projectileClass;
    #shotVelocityFactor;
    isAbleToFire = true;
    rateOfFire = 40;
    framesUntilNextShot = 0;
    #shots = new Map();
    #shotsToDespawn = new Set();
    constructor({ baseClass, health, atkDamage, shotVelocityFactor, projectileClass }) {
        super(baseClass);
        this.#health = health;
        this.#atkDamage = atkDamage;
        this.#projectileClass = projectileClass;
        this.#shotVelocityFactor = shotVelocityFactor;
        this.domElement.healthBar = null;
    }
    /**
     * 
     * @param {{deltaX: Number, deltaY: Number}} deltaCoordsToTarget 
     */
    fireProjectile(gameBoard, deltaCoordsToTarget = null) {
        if (!this.isAbleToFire) {
            return;
        }
        const projectileVector = Projectile.calculateShotSpeedFromVelocityFactor(
            this.#shotVelocityFactor,
            deltaCoordsToTarget
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
        this.framesUntilNextShot = this.rateOfFire
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
    addShotsToDespawner(shotId) {
        this.#shotsToDespawn.add(shotId);
    }
    despawnExpiredShots() {
        for (const id of this.#shotsToDespawn) {
            this.#shots.delete(id)
        }
    }

}
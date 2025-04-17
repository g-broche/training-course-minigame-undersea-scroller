import { ProjectileFactory } from "../factories/ProjectileFactory.js";
import { GameBoard } from "../mechanics/GameBoard.js";
import { Movable } from "./Movable.js";
import { Projectile } from "./Projectile.js";

export class Actor extends Movable {
    #health;
    #atkDamage;
    #projectileClass;
    #shotVelocityFactor;
    isAbleToFire = true;
    rateOfFire = 40;
    #shots = new Map();
    #shotsToDespawn = new Set();
    /** @type {ProjectileFactory|null} */
    projectileFactory = null;
    constructor({ baseClass, health, atkDamage, shotVelocityFactor, projectileClass }, projectileFactory = ProjectileFactory.getInstance()) {
        super(baseClass);
        this.projectileFactory = projectileFactory;
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
    fireProjectile(deltaCoordsToTarget = null) {
        if (!this.isAbleToFire) {
            return;
        }
        const projectileVector = Projectile.calculateShotSpeedFromVelocityFactor(
            this.#shotVelocityFactor,
            deltaCoordsToTarget
        )
        const projectileData = this.projectileFactory.createProjectile({
            projectileClass: this.#projectileClass,
            shooter: this,
            projectileDamage: this.#atkDamage,
            projectileSpeedX: projectileVector.moveSpeedX,
            projectileSpeedY: projectileVector.moveSpeedY,
        });
        this.#shots.set(projectileData.id, projectileData.projectile);
        projectileData.projectile.placeAtOrigin();
        this.isAbleToFire = false;
        setTimeout(() => {
            this.isAbleToFire = true;
        }, this.getDelayBetweenShots())
    }
    getDelayBetweenShots() {
        return this.rateOfFire / 60 * 1000
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
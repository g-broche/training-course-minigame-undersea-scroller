import { Actor } from "./Actor.js";
/**
 * Parent class of all enemy types
 */
export class Enemy extends Actor {
    static enemyIncrementor = 1;
    #pointValue;
    #damageOnContact = 25;
    get isPlayer() { return false }
    get getProjectileSizeRatio() { throw new Error("children classes must implement projectileSizeRatio getter") }
    constructor({
        baseClass,
        health,
        atkDamage,
        shotVelocityFactor,
        projectileClass,
        rateOfFire,
        pointValue

    }) {
        super({
            baseClass: baseClass,
            health: health,
            atkDamage: atkDamage,
            shotVelocityFactor: shotVelocityFactor,
            projectileClass: projectileClass,
            rateOfFire: rateOfFire
        });
        this.#pointValue = pointValue;
        this.isFacingRight = false;
    }

    static create() {
        throw new Error("Method 'create' must be implemented by children classes")
    }

    getEnemyTypeSheet() {
        throw new Error("Method 'getEnemyTypeSheet' must be implemented by children classes")
    }

    getSpeedFactor() {
        throw new Error("Method 'getSpeedFactor' must be implemented by children classes")
    }

    getDamageOnContact() {
        return this.#damageOnContact;
    }

    /**
     * 
     * @returns point value of this unit
     */
    getPointValue() {
        return this.#pointValue;
    }

    fire() {
        throw new Error("Method 'Fire' must be implemented by children classes")
    }
}
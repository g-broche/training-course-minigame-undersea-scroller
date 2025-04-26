import { Actor } from "./Actor.js";

export class Enemy extends Actor {
    static enemyIncrementor = 1;
    #pointValue;
    get isFromPlayer() {
        return false;
    }
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

    getPointValue() {
        return this.#pointValue;
    }

    fire() {
        throw new Error("Method 'Fire' must be implemented by children classes")
    }
}
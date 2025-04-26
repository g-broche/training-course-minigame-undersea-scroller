import { Actor } from "./Actor.js";

const ENEMY_CLASS = "enemy";
const BASE_HEALTH = 100;
const ATK_DAMAGE = 30;
const RATE_OF_FIRE = 20;
const POINT_VALUE = 50;
const SHOT_VELOCITY_FACTOR = 1.2;
const PROJECTILE_CLASS = "enemy-attack";
const AIMED_PROJECTILE_CLASS = "enemy-attack aimed-attack";

export class BaseEnemy extends Actor {
    static enemyIncrementor = 1;
    static #speedFactor = .1;
    screenWidthtoEntityWidthRatio = 4;
    screenWidthtoEntityHeightRatio = 4;
    #pointValue;
    aimedProjectileClass;
    get isFromPlayer() {
        return false;
    }
    constructor() {
        super({
            baseClass: ENEMY_CLASS,
            health: BASE_HEALTH,
            atkDamage: ATK_DAMAGE,
            shotVelocityFactor: SHOT_VELOCITY_FACTOR,
            projectileClass: PROJECTILE_CLASS,
            rateOfFire: RATE_OF_FIRE
        });
        this.#pointValue = POINT_VALUE;
        this.aimedProjectileClass = AIMED_PROJECTILE_CLASS;
    }

    static createBaseEnemy() {
        const newEnemy = new BaseEnemy();
        const enemy = {
            id: BaseEnemy.enemyIncrementor,
            enemy: newEnemy
        };
        BaseEnemy.enemyIncrementor++;
        return enemy
    }

    getSpeedFactor() {
        return BaseEnemy.#speedFactor;
    }

    getPointValue() {
        return this.#pointValue;
    }
}
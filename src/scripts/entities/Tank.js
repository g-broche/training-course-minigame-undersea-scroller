import { Enemy } from "./Enemy.js";

export class Tank extends Enemy {
    static #maxHealth = 300;
    static #aktDamage = 40;
    static #rateOfFire = 15;
    static #shotVelocityFactor = .6
    static #entityClass = "enemy tank";
    static #projectileClass = "enemy-attack large-attack";
    static #speedFactor = .1;
    static #pointValue = 200;
    screenWidthtoEntityWidthRatio = 10;
    screenWidthtoEntityHeightRatio = 6;
    get getProjectileSizeRatio() { return { width: 3, height: 3 } }
    constructor() {
        super(Tank.getEnemyTypeSheet());
    }
    static getEnemyTypeSheet() {
        return {
            baseClass: Tank.#entityClass,
            health: Tank.#maxHealth,
            atkDamage: Tank.#aktDamage,
            shotVelocityFactor: Tank.#shotVelocityFactor,
            projectileClass: Tank.#projectileClass,
            rateOfFire: Tank.#rateOfFire,
            pointValue: Tank.#pointValue
        }
    }
    static create() {
        const newEnemy = new Tank();
        const enemy = {
            id: Enemy.enemyIncrementor,
            enemy: newEnemy
        };
        Enemy.enemyIncrementor++;
        return enemy
    }

    getSpeedFactor() {
        return Tank.#speedFactor;
    }

    fire(gameBoard, player) {
        this.fireProjectile(gameBoard)
    }
}
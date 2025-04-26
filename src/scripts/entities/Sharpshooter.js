import { Enemy } from "./Enemy.js";

export class Sharpshooter extends Enemy {
    static #maxHealth = 50;
    static #aktDamage = 30;
    static #rateOfFire = 60;
    static #shotVelocityFactor = 1.5
    static #entityClass = "enemy sharpshooter";
    static #projectileClass = "enemy-attack sharpshooter-attack";
    static #speedFactor = 0;
    static #pointValue = 100;
    screenWidthtoEntityWidthRatio = 3;
    screenWidthtoEntityHeightRatio = 2;
    get getProjectileSizeRatio() { return { width: 2, height: 1 } }
    constructor() {
        super(Sharpshooter.getEnemyTypeSheet());
    }

    static getEnemyTypeSheet() {
        return {
            baseClass: Sharpshooter.#entityClass,
            health: Sharpshooter.#maxHealth,
            atkDamage: Sharpshooter.#aktDamage,
            shotVelocityFactor: Sharpshooter.#shotVelocityFactor,
            projectileClass: Sharpshooter.#projectileClass,
            rateOfFire: Sharpshooter.#rateOfFire,
            pointValue: Sharpshooter.#pointValue
        }
    }

    static create() {
        const newEnemy = new Sharpshooter();
        const enemy = {
            id: Enemy.enemyIncrementor,
            enemy: newEnemy
        };
        Enemy.enemyIncrementor++;
        return enemy
    }

    getSpeedFactor() {
        return Sharpshooter.#speedFactor;
    }

    fire(gameBoard, player) {
        this.fireAimedProjectile(gameBoard, player)
    }
}
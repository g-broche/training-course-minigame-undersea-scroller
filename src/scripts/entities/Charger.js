import { Enemy } from "./Enemy.js";

export class Charger extends Enemy {
    static #maxHealth = 100;
    static #aktDamage = 20;
    static #rateOfFire = 20;
    static #shotVelocityFactor = 1.2
    static #entityClass = "enemy charger";
    static #projectileClass = "enemy-attack base";
    static #speedFactor = .1;
    static #pointValue = 50;
    screenWidthtoEntityWidthRatio = 4;
    screenWidthtoEntityHeightRatio = 4;
    get getProjectileSizeRatio() { return { width: 1.5, height: 1.5 } }
    constructor() {
        super(Charger.getEnemyTypeSheet());
    }
    static getEnemyTypeSheet() {
        return {
            baseClass: Charger.#entityClass,
            health: Charger.#maxHealth,
            atkDamage: Charger.#aktDamage,
            shotVelocityFactor: Charger.#shotVelocityFactor,
            projectileClass: Charger.#projectileClass,
            rateOfFire: Charger.#rateOfFire,
            pointValue: Charger.#pointValue
        }
    }
    static create() {
        const newEnemy = new Charger();
        const enemy = {
            id: Enemy.enemyIncrementor,
            enemy: newEnemy
        };
        Enemy.enemyIncrementor++;
        return enemy
    }

    getSpeedFactor() {
        return Charger.#speedFactor;
    }

    fire(gameBoard, player) {
        this.fireProjectile(gameBoard)
    }
}
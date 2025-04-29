import { Enemy } from "./Enemy.js";
/**
 * Charger enemy, base enemy moving to left side
 */
export class Charger extends Enemy {
    static #maxHealth = 100;
    static #aktDamage = 20;
    static #rateOfFire = 25;
    static #shotVelocityFactor = 1.0
    static #entityClass = "enemy charger";
    static #projectileClass = "enemy-attack base-attack";
    static #frames = [
        './src/assets/img/enemies/charger.webp',
    ]
    static #animationDelay = null
    static #speedFactor = .15;
    static #pointValue = 50;
    screenWidthtoEntityWidthRatio = 4;
    screenWidthtoEntityHeightRatio = 4;
    get animationConfig() {
        return {
            animationFrames: Charger.#frames,
            animationIntervalDelay: Charger.#animationDelay,
        }
    }
    get getProjectileSizeRatio() { return { width: 1.5, height: 1.5 } }
    constructor() {
        super(Charger.getEnemyTypeSheet());
    }
    /**
     * 
     * @returns data related to this specific eney type
     */
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
    /**
     * creates new charger enemy and increment enemy counter
     * @returns new Charger instance
     */
    static create() {
        const newEnemy = new Charger();
        const enemy = {
            id: Enemy.enemyIncrementor,
            enemy: newEnemy
        };
        Enemy.enemyIncrementor++;
        return enemy
    }
    /**
     * 
     * @returns Charger speed factor multiplier
     */
    getSpeedFactor() {
        return Charger.#speedFactor;
    }
    /**
     * Fires projectile from front of unit
     * @param {*} gameBoard 
     * @param {*} player 
     */
    fire(gameBoard, player) {
        this.fireProjectile(gameBoard)
    }
}
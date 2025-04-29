import { Enemy } from "./Enemy.js";

export class Sharpshooter extends Enemy {
    static #maxHealth = 50;
    static #aktDamage = 30;
    static #rateOfFire = 60;
    static #shotVelocityFactor = 1.5
    static #entityClass = "enemy sharpshooter";
    static #projectileClass = "enemy-attack sharpshooter-attack";
    static #frames = [
        './src/assets/img/enemies/sharpshooter.webp',
    ]
    static #animationDelay = null
    static #speedFactor = 0;
    static #pointValue = 100;
    screenWidthtoEntityWidthRatio = 4;
    screenWidthtoEntityHeightRatio = 2.5;
    get animationConfig() {
        return {
            animationFrames: Sharpshooter.#frames,
            animationIntervalDelay: Sharpshooter.#animationDelay,
        }
    }
    get getProjectileSizeRatio() { return { width: 2, height: 1 } }
    constructor() {
        super(Sharpshooter.getEnemyTypeSheet());
    }
    /**
     * 
     * @returns data related to this specific eney type
     */
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
    /**
     * creates new sharpshooter enemy and increment enemy counter
     * @returns new Sharpshooter instance
     */
    static create() {
        const newEnemy = new Sharpshooter();
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
        return Sharpshooter.#speedFactor;
    }
    /**
     * Fires projectile from front of unit and aiming toward the player
     * @param {*} gameBoard 
     * @param {*} player 
     */
    fire(gameBoard, player) {
        this.fireAimedProjectile(gameBoard, player)
    }
}
import { Enemy } from "./Enemy.js";

export class Tank extends Enemy {
    static #maxHealth = 300;
    static #aktDamage = 40;
    static #rateOfFire = 15;
    static #shotVelocityFactor = .6
    static #entityClass = "enemy tank";
    static #projectileClass = "enemy-attack large-attack";
    static #frames = [
        './src/assets/img/enemies/tank.webp',
    ]
    static #animationDelay = null
    static #speedFactor = .1;
    static #pointValue = 200;
    screenWidthtoEntityWidthRatio = 10;
    screenWidthtoEntityHeightRatio = 8;
    get animationConfig() {
        return {
            animationFrames: Tank.#frames,
            animationIntervalDelay: Tank.#animationDelay,
        }
    }
    get getProjectileSizeRatio() { return { width: 3, height: 3 } }
    constructor() {
        super(Tank.getEnemyTypeSheet());
    }
    /**
     * 
     * @returns data related to this specific eney type
     */
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
    /**
     * creates new tank enemy and increment enemy counter
     * @returns new Tank instance
     */
    static create() {
        const newEnemy = new Tank();
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
        return Tank.#speedFactor;
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
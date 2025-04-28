import { Actor } from "./Actor.js";

const PLAYER_CLASS = "player";
const BASE_HEALTH = 100;
const ATK_DAMAGE = 30;
const RATE_OF_FIRE = 90;
const SHOT_VELOCITY_FACTOR = 1.2;
const PROJECTILE_CLASS = "shigu-attack"

export class Player extends Actor {
    static #instance = null;
    static #frames = [
        './src/assets/img/set-shigu/frame-01.png',
        './src/assets/img/set-shigu/frame-02.png',
        './src/assets/img/set-shigu/frame-03.png',
        './src/assets/img/set-shigu/frame-04.png',
        './src/assets/img/set-shigu/frame-05.png',
        './src/assets/img/set-shigu/frame-06.png'
    ]
    static #animationDelay = 200
    #speedFactor = 1.25;
    get animationConfig() {
        return {
            animationFrames: Player.#frames,
            animationIntervalDelay: Player.#animationDelay,
        }
    }
    screenWidthtoEntityWidthRatio = 6;
    screenWidthtoEntityHeightRatio = 3;
    get isPlayer() { return true }
    get getProjectileSizeRatio() { return { width: 1.5, height: 1.5 } }
    constructor() {
        if (Player.#instance) {
            return Player.#instance;
        }
        super({
            baseClass: PLAYER_CLASS,
            health: BASE_HEALTH,
            atkDamage: ATK_DAMAGE,
            shotVelocityFactor: SHOT_VELOCITY_FACTOR,
            projectileClass: PROJECTILE_CLASS,
            rateOfFire: RATE_OF_FIRE,
        });
        Player.#instance = this;
        this.isFacingRight = true;
    }
    static getInstance() {
        if (!Player.#instance) {
            Player.#instance = new Player();
        }
        return Player.#instance;
    }
    getSpeedFactor() {
        return this.#speedFactor;
    }
    moveUp() {
        const speedFactor = this.getSpeedFactor()
        if ((this.positions.boundaries.top - (this.moveSpeed.y * speedFactor)) < 0) {
            return;
        }
        this.positions.posY -= this.moveSpeed.y * speedFactor;
        this.setBoundaries()
    }
    moveRight(boardLimitRight) {
        const speedFactor = this.getSpeedFactor()
        if ((this.positions.boundaries.right + (this.moveSpeed.x * speedFactor)) > boardLimitRight) {
            return;
        }
        this.positions.posX += this.moveSpeed.x * speedFactor;
        this.setBoundaries();
        this.setFacedDirection(true);
    }
    moveDown(boardLimitBottom) {
        const speedFactor = this.getSpeedFactor()
        if ((this.positions.boundaries.bottom + (this.moveSpeed.y * speedFactor)) > boardLimitBottom) {
            return;
        }
        this.positions.posY += this.moveSpeed.y * speedFactor;
        this.setBoundaries();
    }
    moveLeft() {
        const speedFactor = this.getSpeedFactor()
        if ((this.positions.boundaries.left - (this.moveSpeed.x * speedFactor)) < 0) {
            return;
        }
        this.positions.posX -= this.moveSpeed.x * speedFactor;
        this.setBoundaries();
        this.setFacedDirection(false);
    }
}
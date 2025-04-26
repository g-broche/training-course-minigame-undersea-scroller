import { Actor } from "./Actor.js";

const PLAYER_CLASS = "player";
const BASE_HEALTH = 100;
const ATK_DAMAGE = 30;
const RATE_OF_FIRE = 90;
const SHOT_VELOCITY_FACTOR = 1.2;
const PROJECTILE_CLASS = "shigu-attack"

export class Player extends Actor {
    static #instance = null;
    #speedFactor = 1.25;
    screenWidthtoEntityWidthRatio = 4;
    screenWidthtoEntityHeightRatio = 2;
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
            rateOfFire: RATE_OF_FIRE
        });
        Player.#instance = this;
    }
    getSpeedFactor() {
        return this.#speedFactor;
    }
    static getInstance() {
        if (!Player.#instance) {
            Player.#instance = new Player();
        }
        return Player.#instance;
    }
}
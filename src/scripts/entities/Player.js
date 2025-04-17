import { Actor } from "./Actor.js";

const PLAYER_CLASS = "player";
const BASE_HEALTH = 100;
const ATK_DAMAGE = 30;
const SHOT_VELOCITY_FACTOR = 1.2;
const PROJECTILE_CLASS = "shigu-attack"

export class Player extends Actor {
    static #instance = null;
    constructor() {
        if (Player.#instance) {
            return Player.#instance;
        }
        super({
            baseClass: PLAYER_CLASS,
            health: BASE_HEALTH,
            atkDamage: ATK_DAMAGE,
            shotVelocityFactor: SHOT_VELOCITY_FACTOR,
            projectileClass: PROJECTILE_CLASS
        });
        Player.#instance = this;
    }
    static getInstance() {
        if (!Player.#instance) {
            Player.#instance = new Player();
        }
        return Player.#instance;
    }


}
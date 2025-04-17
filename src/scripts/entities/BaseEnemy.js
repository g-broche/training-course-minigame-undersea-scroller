import { Actor } from "./Actor.js";

const ENEMY_CLASS = "enemy";
const BASE_HEALTH = 100;
const ATK_DAMAGE = 30;
const SHOT_VELOCITY_FACTOR = 1.2;
const PROJECTILE_CLASS = "enemy-attack";

export class BaseEnemy extends Actor {
    static enemyIncrementor = 1;
    constructor() {
        super({
            baseClass: ENEMY_CLASS,
            health: BASE_HEALTH,
            atkDamage: ATK_DAMAGE,
            shotVelocityFactor: SHOT_VELOCITY_FACTOR,
            projectileClass: PROJECTILE_CLASS
        });
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
}
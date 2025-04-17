import { Projectile } from "../entities/Projectile.js";

export class ProjectileFactory {
    projectileIncrementor = 1;
    static #instanceId = null;
    constructor() {
        if (ProjectileFactory.#instanceId) {
            return ProjectileFactory.#instanceId;
        }
        ProjectileFactory.#instanceId = this
    }
    static getInstance() {
        if (!ProjectileFactory.#instanceId) {
            ProjectileFactory.#instanceId = new ProjectileFactory();
        }
        return ProjectileFactory.#instanceId;
    }
    createProjectile({ projectileClass, shooter, projectileDamage, projectileSpeedX, projectileSpeedY }) {
        const projectile = {
            id: this.projectileIncrementor,
            projectile: new Projectile(
                {
                    baseClass: projectileClass,
                    owner: shooter,
                    damage: projectileDamage,
                    speedX: projectileSpeedX,
                    speedY: projectileSpeedY
                }
            )
        };
        this.projectileIncrementor++;
        return projectile;
    }
}
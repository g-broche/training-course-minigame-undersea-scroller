import { Actor } from "./Actor.js";

const PLAYER_CLASS = "player";
const BASE_HEALTH = 100;
const ATK_DAMAGE = 30;
const RATE_OF_FIRE = 90;
const SHOT_VELOCITY_FACTOR = 1.1;
const PROJECTILE_CLASS = "shigu-attack"

/**
 * Player class used as a singleton
 */
export class Player extends Actor {
    static #instance = null;
    static #invincibilityFramesAfterHit = 120;
    static #frames = [
        './src/assets/img/set-shigu/frame-01.png',
        './src/assets/img/set-shigu/frame-02.png',
        './src/assets/img/set-shigu/frame-03.png',
        './src/assets/img/set-shigu/frame-04.png',
        './src/assets/img/set-shigu/frame-05.png',
        './src/assets/img/set-shigu/frame-06.png'
    ]
    static #animationDelay = 200
    #speedFactor = 1.1;
    #framesOfInvincibilityLeft = 0
    #isInvicible = false;
    /**
     * return animation config data
     */
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
    setIsInvicible(mustBecomeInvicible) {
        this.#isInvicible = mustBecomeInvicible
        if (this.#isInvicible) { this.#framesOfInvincibilityLeft = Player.#invincibilityFramesAfterHit }
        this.toggleInvincibilityFrameAnimation()
    }
    /**
     * decrement invincibility frame counter and cancels invincibility status if appropriate
     * 
     */
    decrementInvincibilityFrameCount() {
        if (this.#framesOfInvincibilityLeft <= 0 && !this.#isInvicible) {
            return;
        }
        if (this.#framesOfInvincibilityLeft <= 0) {
            this.#framesOfInvincibilityLeft = 0;
            this.setIsInvicible(false);
            return;
        }
        this.#framesOfInvincibilityLeft --;
    }
    /**
     * 
     * @returns speed factor of the player
     */
    getSpeedFactor() {
        return this.#speedFactor;
    }
    /**
     * Move player position up
     */
    moveUp() {
        const speedFactor = this.getSpeedFactor()
        if ((this.positions.boundaries.top - (this.moveSpeed.y * speedFactor)) < 0) {
            return;
        }
        this.positions.posY -= this.moveSpeed.y * speedFactor;
        this.setBoundaries()
    }
    /**
    * Move player position right and adjust faced direction
    */
    moveRight(boardLimitRight) {
        const speedFactor = this.getSpeedFactor()
        if ((this.positions.boundaries.right + (this.moveSpeed.x * speedFactor)) > boardLimitRight) {
            return;
        }
        this.positions.posX += this.moveSpeed.x * speedFactor;
        this.setBoundaries();
        this.setFacedDirection(true);
    }
    /**
    * Move player position down
    */
    moveDown(boardLimitBottom) {
        const speedFactor = this.getSpeedFactor()
        if ((this.positions.boundaries.bottom + (this.moveSpeed.y * speedFactor)) > boardLimitBottom) {
            return;
        }
        this.positions.posY += this.moveSpeed.y * speedFactor;
        this.setBoundaries();
    }
    /**
    * Move player position right and adjust faced direction
    */
    moveLeft() {
        const speedFactor = this.getSpeedFactor()
        if ((this.positions.boundaries.left - (this.moveSpeed.x * speedFactor)) < 0) {
            return;
        }
        this.positions.posX -= this.moveSpeed.x * speedFactor;
        this.setBoundaries();
        this.setFacedDirection(false);
    }
    toggleInvincibilityFrameAnimation() {
        this.#isInvicible ?
            this.domElement.sprite.classList.add("invincible")
            : this.domElement.sprite.classList.remove("invincible")
    }
    takeHit(damageReceived) {
        if (!this.#isInvicible) {
            this.setHealth(this.getHealth() - damageReceived);
            if (this.isAlive()) {
                this.setIsInvicible(true)
            }
        }
    }
    resetToInitialState() {
        this.clearAllProjectiles();
        this.#framesOfInvincibilityLeft = 0;
        this.setIsInvicible(false);
        this.setFacedDirection(true)
        this.restoreToFullHealth();
    }
}
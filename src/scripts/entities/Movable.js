
/**
 * Parent class of all game entities
 */
export class Movable {
    static baseMoveSpeed;
    static #speedFactor = 1;
    /** @type {{ hitbox: HTMLDivElement|null, sprite: HTMLImageElement|null}} */
    domElement = {
        hitbox: null,
        sprite: null
    };
    sizes = {
        width: null,
        halfWidth: null,
        height: null,
        halfHeight: null,
    }
    moveSpeed = {
        x: null,
        y: null
    };
    #baseClass = null;
    #animationFrames = null;
    #currentAnimationFrameIndex = null;
    #animationIntervalId = null;
    #animationIntervalDelay = null;
    #hasAnimation = false;
    positions = {
        posX: null,
        posY: null,
        boundaries: {
            top: null,
            right: null,
            bottom: null,
            left: null,
        }
    }
    isFacingRight = null;
    hasHealthBar = false;
    screenWidthtoEntityWidthRatio = 1;
    screenWidthtoEntityHeightRatio = 1;
    get animationConfig() {
        return null
    }
    constructor(baseClass) {
        this.#baseClass = baseClass;
    }
    /**
     * set the base movespeed value of all Movable instance
     * @param {*} newMoveSpeed 
     */
    static setBaseMoveSpeed(newMoveSpeed) {
        Movable.baseMoveSpeed = newMoveSpeed
    }
    /**
     * set speed of unit in box axis of movement
     * @param {{ moveSpeedX: number, moveSpeedY: number }} param0 
     */
    setSpeed({ moveSpeedX, moveSpeedY }) {
        this.moveSpeed.x = moveSpeedX;
        this.moveSpeed.y = moveSpeedY;
    }
    /**
     * Creates the dom element representing the movable entity based on instance properties
     * @returns hitbox dom element of this entity
     */
    createElement() {
        this.domElement.hitbox = document.createElement("div");
        this.domElement.hitbox.className = `hitbox ${this.#baseClass}`;
        if (this.hasHealthBar) {
            this.domElement.healthBarContainer = document.createElement("div");
            this.domElement.healthBarContainer.className = "healthbar";
            this.domElement.healthBarHealth = document.createElement("div");
            this.domElement.healthBarHealth.className = "hp";
            this.domElement.healthBarContainer.appendChild(this.domElement.healthBarHealth)
            this.domElement.hitbox.appendChild(this.domElement.healthBarContainer)
        }
        this.setAnimationConfig();
        return this.domElement.hitbox;
    }
    /**
     * remove dom node representing this element from the dom
     */
    removeElement() {
        this.domElement.hitbox.remove();
    }
    /**
     * Appends classes to the hitbox element
     * @param {string[]} classNames 
     */
    addClasses(classNames = []) {
        this.domElement.hitbox.classList.add(...classNames);
    }
    /**
     * Removes classes to the hitbox element
     * @param {string[]} classNames 
     */
    removeClasses(classNames = []) {
        this.domElement.hitbox.classList.remove(...classNames);
    }
    /**
     * calculates and sets this entity's sizes and related style based on board sizes and ratio
     * @param {*} gameBoard 
     */
    setSize(gameBoard) {
        if (!this.screenWidthtoEntityHeightRatio || !this.screenWidthtoEntityWidthRatio) {
            throw new Error("Missing screen ratio properties on element when defining sizes", this)
        }
        const height = gameBoard.calculateRatioPixelFromBoardWidth(this.screenWidthtoEntityHeightRatio);
        const width = gameBoard.calculateRatioPixelFromBoardWidth(this.screenWidthtoEntityWidthRatio);
        this.sizes.height = height
        this.sizes.halfHeight = height / 2;
        this.sizes.width = width;
        this.sizes.halfWidth = width / 2;
        this.domElement.hitbox.style.height = `${height}px`;
        this.domElement.hitbox.style.width = `${width}px`;
    }
    /**
     * Sets new position and calculate new entity borders
     * @param {*} param0 
     */
    setPosition({ posX, posY }) {
        this.positions.posX = posX;
        this.positions.posY = posY;
        this.setBoundaries()
    }
    /**
     * Calculates the boundaries of the hitbox of the entity relative to top left corner
     */
    setBoundaries() {
        this.positions.boundaries.top = this.positions.posY - this.sizes.halfHeight;
        this.positions.boundaries.right = this.positions.posX + this.sizes.halfWidth;
        this.positions.boundaries.bottom = this.positions.posY + this.sizes.halfHeight;
        this.positions.boundaries.left = this.positions.posX - this.sizes.halfWidth;
    }
    /**
     * Sync hitbox absolute position with entity known location
     */
    ActualizeDisplayLocation() {
        this.domElement.hitbox.style.top = `${this.positions.boundaries.top}px`;
        this.domElement.hitbox.style.left = `${this.positions.boundaries.left}px`;
    }
    /**
     * 
     * @returns Boundaries top, right, bottom and left of this entity
     */
    getBoundaries() {
        return this.positions.boundaries
    }
    /**
     * 
     * @returns Movable speedfactor
     */
    getSpeedFactor() {
        return Movable.#speedFactor;
    }
    /**
     * Moves entity based on its defined moveSpeed on both axis
     */
    move() {
        const speedFactor = this.getSpeedFactor()
        this.positions.posX += this.moveSpeed.x * speedFactor;
        this.positions.posY += this.moveSpeed.y * speedFactor;
        this.setBoundaries()
    }
    /**
     * toggle class to display or hide entity
     * @param {boolean} mustBeVisible 
     * 
     */
    toggleVisibility(mustBeVisible) {
        if (mustBeVisible) {
            this.domElement.hitbox.classList.remove("hidden");
            return;
        }
        this.domElement.hitbox.classList.add("hidden")
    }
    /**
     * Removes this entity's hitbox from the dom
     */
    removeFromDom() {
        this.domElement.hitbox.remove()
    }

    /**
     * Compares position with an other given Movable to check if both partially overlaps
     * @param {Movable} movable 
     * @returns true if overlapping, false otherwise
     */
    hasCollisionWith(movable) {
        const isMatchingX = this.positions.boundaries.right > movable.positions.boundaries.left && this.positions.boundaries.left < movable.positions.boundaries.right;
        const isMatchingY = this.positions.boundaries.bottom > movable.positions.boundaries.top && this.positions.boundaries.top < movable.positions.boundaries.bottom;
        // console.log(`is matching on X ${isMatchingX}, is matching on Y ${isMatchingY}`)
        const isColliding = isMatchingX && isMatchingY;
        return isColliding;
    }
    /**
     * 
     * @returns bool based on if this instance has a related animation defined
     */
    hasAnimation() {
        return this.#hasAnimation;
    }
    /**
     * sets animation properties if this entity has a animation defined for it
     */
    setAnimationConfig() {
        if (
            this.animationConfig
            && this.animationConfig.animationFrames
            && this.animationConfig.animationFrames.length > 0
        ) {
            this.#animationFrames = this.animationConfig.animationFrames;
            this.#currentAnimationFrameIndex = 0;
            this.domElement.sprite = document.createElement("img");
            this.domElement.sprite.className = "sprite";
            this.domElement.sprite.setAttribute("alt", this.constructor.name);
            this.changeSprite(this.#animationFrames[this.#currentAnimationFrameIndex]);
            this.domElement.hitbox.appendChild(this.domElement.sprite);
            this.#hasAnimation = this.#animationFrames.length >= 2
        } else {
            this.#hasAnimation = false;
        }

        if (this.animationConfig && this.animationConfig.animationIntervalDelay) {
            this.#animationIntervalDelay = this.animationConfig.animationIntervalDelay;
            this.#hasAnimation = true;
        } else {
            this.#hasAnimation = false;
        }
    }
    /**
     * Starts animation through interval, delay and list of images
     */
    startAnimation() {
        if (this.#hasAnimation && this.#animationIntervalId === null) {
            this.#animationIntervalId = setInterval(() => {
                const nextFramePath = this.selectNextFrame()
                this.changeSprite(nextFramePath)
            }, this.#animationIntervalDelay)
        }
    }
    /**
     * Handles the frame index list of available frame to return the path to next frame
     * @returns {string} The next frame path
     */
    selectNextFrame() {
        this.#currentAnimationFrameIndex =
            this.#currentAnimationFrameIndex >= this.#animationFrames.length - 1
                ? 0
                : this.#currentAnimationFrameIndex + 1
        return this.#animationFrames[this.#currentAnimationFrameIndex]
    }
    /**
     * Changes src of sprite image
     * @param {string} imagePath 
     */
    changeSprite(imagePath) {
        this.domElement.sprite.src = imagePath;
    }
    /**
     * Cancel active animation interval
     */
    pauseAnimation() {
        if (this.#animationIntervalId !== null) {
            clearInterval(this.#animationIntervalId)
            this.#animationIntervalId = null;
        }
    }
    /**
     * Reset animation related properties to their initial values
     */
    resetAnimation() {
        this.toggleDirectionFlip(false);
        this.#currentAnimationFrameIndex = 0;
        this.changeSprite(this.#animationFrames[0])
        this.startAnimation()
    }
    /**
     * change direction of sprite 
     * @returns 
     */
    toggleDirectionFlip() {
        if (!this.domElement.sprite) {
            return
        }
        if (!this.isFacingRight) {
            this.domElement.sprite.classList.add("reverse")
        } else {
            this.domElement.sprite.classList.remove("reverse")
        }
    }
    /**
     * sets direction faced by entity (true = facing right)
     * @param {boolean} mustFaceRight 
     */
    setFacedDirection(mustFaceRight) {
        this.isFacingRight = mustFaceRight
        this.toggleDirectionFlip(!mustFaceRight)
    }
}
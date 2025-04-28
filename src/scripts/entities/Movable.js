export class Movable {
    static baseMoveSpeed;
    static #speedFactor = 1;
    /** @type {{ hitbox: HTMLDivElement|null, sprite: HTMLImageElement|null, damageOverlay: HTMLDivElement|null}} */
    domElement = {
        hitbox: null,
        sprite: null,
        damageOverlay: null,
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
    static setBaseMoveSpeed(newMoveSpeed) {
        Movable.baseMoveSpeed = newMoveSpeed
    }
    setSpeed({ moveSpeedX, moveSpeedY }) {
        this.moveSpeed.x = moveSpeedX;
        this.moveSpeed.y = moveSpeedY;
    }
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
    removeElement() {
        this.domElement.hitbox.remove();
    }
    addClasses(classNames = []) {
        this.domElement.hitbox.classList.add(...classNames);
    }
    removeClasses(classNames = []) {
        this.domElement.hitbox.classList.remove(...classNames);
    }
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
    setPosition({ posX, posY }) {
        this.positions.posX = posX;
        this.positions.posY = posY;
        this.setBoundaries()
    }
    setBoundaries() {
        this.positions.boundaries.top = this.positions.posY - this.sizes.halfHeight;
        this.positions.boundaries.right = this.positions.posX + this.sizes.halfWidth;
        this.positions.boundaries.bottom = this.positions.posY + this.sizes.halfHeight;
        this.positions.boundaries.left = this.positions.posX - this.sizes.halfWidth;
    }
    ActualizeDisplayLocation() {
        this.domElement.hitbox.style.top = `${this.positions.boundaries.top}px`;
        this.domElement.hitbox.style.left = `${this.positions.boundaries.left}px`;
    }
    getBoundaries() {
        return this.positions.boundaries
    }
    getSpeedFactor() {
        return Movable.#speedFactor;
    }
    move() {
        const speedFactor = this.getSpeedFactor()
        this.positions.posX += this.moveSpeed.x * speedFactor;
        this.positions.posY += this.moveSpeed.y * speedFactor;
        this.setBoundaries()
    }

    toggleVisibility(mustBeVisible) {
        if (mustBeVisible) {
            this.domElement.hitbox.classList.remove("hidden");
            return;
        }
        this.domElement.hitbox.classList.add("hidden")
    }

    removeFromDom() {
        this.domElement.hitbox.remove()
    }

    /**
     * 
     * @param {Movable} movable 
     */
    hasCollisionWith(movable) {
        const isMatchingX = this.positions.boundaries.right > movable.positions.boundaries.left && this.positions.boundaries.left < movable.positions.boundaries.right;
        const isMatchingY = this.positions.boundaries.bottom > movable.positions.boundaries.top && this.positions.boundaries.top < movable.positions.boundaries.bottom;
        // console.log(`is matching on X ${isMatchingX}, is matching on Y ${isMatchingY}`)
        const isColliding = isMatchingX && isMatchingY;
        return isColliding;
    }
    hasAnimation() {
        return this.#hasAnimation;
    }
    setAnimationConfig() {
        if (this.animationConfig) {
            this.#animationFrames = this.animationConfig.animationFrames;
            this.#animationIntervalDelay = this.animationConfig.animationIntervalDelay;
            this.#hasAnimation = true;
            this.#currentAnimationFrameIndex = 0;
            this.domElement.sprite = document.createElement("img");
            this.domElement.sprite.className = "sprite";
            this.domElement.sprite.setAttribute("alt", this.constructor.name);
            this.changeSprite(this.#animationFrames[this.#currentAnimationFrameIndex]);
            this.domElement.damageOverlay = document.createElement("div");
            this.domElement.damageOverlay.className = "damage-overlay"
            this.domElement.hitbox.append(this.domElement.sprite, this.domElement.damageOverlay);
        } else {
            this.#hasAnimation = false;
        }
    }
    startAnimation() {
        if (this.#hasAnimation && this.#animationIntervalId === null) {
            this.#animationIntervalId = setInterval(() => {
                const nextFramePath = this.selectNextFrame()
                this.changeSprite(nextFramePath)
            }, this.#animationIntervalDelay)
        }
    }
    selectNextFrame() {
        this.#currentAnimationFrameIndex =
            this.#currentAnimationFrameIndex >= this.#animationFrames.length - 1
                ? 0
                : this.#currentAnimationFrameIndex + 1
        return this.#animationFrames[this.#currentAnimationFrameIndex]
    }

    changeSprite(imagePath) {
        this.domElement.sprite.src = imagePath;
    }

    pauseAnimation() {
        console.log(this.#animationIntervalId)
        if (this.#animationIntervalId !== null) {
            clearInterval(this.#animationIntervalId)
            this.#animationIntervalId = null;
        }
    }

    resetAnimation() {
        this.toggleDirectionFlip(false);
        this.#currentAnimationFrameIndex = 0;
        this.changeSprite(this.#animationFrames[0])
        this.startAnimation()
    }

    toggleDirectionFlip(isNormalDirectionReversed) {
        if (!this.domElement.sprite) {
            return
        }
        if (isNormalDirectionReversed) {
            this.domElement.sprite.classList.add("reverse")
        } else {
            this.domElement.sprite.classList.remove("reverse")
        }
    }
    setFacedDirection(mustFaceRight) {
        this.isFacingRight = mustFaceRight
        this.toggleDirectionFlip(!mustFaceRight)
    }
}
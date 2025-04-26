export class Movable {
    static baseMoveSpeed;
    static #speedFactor = 1;
    /** @type {{ hitbox: HTMLDivElement|null, sprite: HTMLImageElement|null}} */
    domElement = {
        hitbox: null,
        sprite: null,
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
    #baseClass = null
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
    hasHealthBar = false;
    screenWidthtoEntityWidthRatio = 1;
    screenWidthtoEntityHeightRatio = 1;
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
        this.domElement.hitbox.className = this.#baseClass;
        if (this.hasHealthBar) {
            this.domElement.healthBarContainer = document.createElement("div");
            this.domElement.healthBarContainer.className = "healthbar";
            this.domElement.healthBarHealth = document.createElement("div");
            this.domElement.healthBarHealth.className = "hp";
            this.domElement.healthBarContainer.appendChild(this.domElement.healthBarHealth)
            this.domElement.hitbox.appendChild(this.domElement.healthBarContainer)
        }
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
        this.setBoundaries()
    }
    moveDown(boardLimitBottom) {
        const speedFactor = this.getSpeedFactor()
        if ((this.positions.boundaries.bottom + (this.moveSpeed.y * speedFactor)) > boardLimitBottom) {
            return;
        }
        this.positions.posY += this.moveSpeed.y * speedFactor;
        this.setBoundaries()
    }
    moveLeft() {
        const speedFactor = this.getSpeedFactor()
        if ((this.positions.boundaries.left - (this.moveSpeed.x * speedFactor)) < 0) {
            return;
        }
        this.positions.posX -= this.moveSpeed.x * speedFactor;
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
}
export class Movable {
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
    setSpeed({ moveSpeedX, moveSpeedY }) {
        this.moveSpeed.x = moveSpeedX;
        this.moveSpeed.y = moveSpeedY;
    }
    createElement(className = "") {
        this.domElement.hitbox = document.createElement("div");
        this.domElement.hitbox.className = className;
        return this.domElement.hitbox;
    }
    removeElement() {
        this.domElement.hitbox.remove();
    }
    setSize() {
        const rect = this.domElement.hitbox.getBoundingClientRect();
        this.sizes.height = rect.height;
        this.sizes.halfHeight = rect.height / 2;
        this.sizes.width = rect.width;
        this.sizes.halfWidth = rect.width / 2;
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
    moveUp() {
        if (this.positions.boundaries.top - this.moveSpeed.y < 0) {
            return;
        }
        this.positions.posY -= this.moveSpeed.y;
        this.setBoundaries()
    }
    moveRight(boardLimitRight) {
        if (this.positions.boundaries.right + this.moveSpeed.x > boardLimitRight) {
            return;
        }
        this.positions.posX += this.moveSpeed.x;
        this.setBoundaries()
    }
    moveDown(boardLimitBottom) {
        if (this.positions.boundaries.bottom + this.moveSpeed.y > boardLimitBottom) {
            return;
        }
        this.positions.posY += this.moveSpeed.y;
        this.setBoundaries()
    }
    moveLeft() {
        if (this.positions.boundaries.left - this.moveSpeed.x < 0) {
            return;
        }
        this.positions.posX -= this.moveSpeed.x;
        this.setBoundaries()
    }
    toggleVisibility(mustBeVisible) {
        if (mustBeVisible) {
            this.domElement.hitbox.classList.remove("hidden");
            return;
        }
        this.domElement.hitbox.classList.add("hidden")
    }
    /**
     * 
     * @param {Movable} movable 
     */
    hasCollisionWith(movable) {

    }
}
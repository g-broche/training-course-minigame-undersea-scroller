export class Player {
    /** @type {{ hitbox: HTMLDivElement|null, sprite: HTMLImageElement|null, healthBar: HTMLDivElement|null}} */
    domElement = {
        hitbox: null,
        sprite: null,
        healthBar: null,
    };
    sizes = {
        width: null,
        halfWidth: null,
        height: null,
        halfHeight: null,
    }
    health;
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
    };
    posY;
    constructor({ moveSpeedX, moveSpeedY }) {
        this.moveSpeed.x = moveSpeedX;
        this.moveSpeed.y = moveSpeedY;
        console.log(this.positions)
    }
    createPlayerElement() {
        this.domElement.hitbox = document.createElement("div");
        this.domElement.hitbox.className = "player";
        return this.domElement.hitbox;
    }
    togglePlayerVisibility(mustBeVisible) {
        if (mustBeVisible) {
            this.domElement.hitbox.classList.remove("hidden");
            return;
        }
        this.domElement.hitbox.classList.add("hidden")
    }
    removePlayerElement() {
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
        console.log(this.positions)
        this.setBoundaries()
    }
    setBoundaries() {
        console.log(`$posY = ${this.positions.posY}, halfHeight = ${this.sizes.halfHeight}, top = ${this.positions.posY - this.sizes.halfHeight}`)
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
    move(moveX = 0, moveY = 0) {
        this.posX += moveX;
        this.posY -= moveY;
    }
}
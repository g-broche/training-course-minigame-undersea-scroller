import { Movable } from "./Movable.js";

export class Actor extends Movable {
    #health;
    #shots = [];
    constructor(health) {
        super();
        this.#health = health;
        this.domElement.healthBar = null;
    }
}
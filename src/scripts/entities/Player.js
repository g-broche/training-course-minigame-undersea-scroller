import { Actor } from "./Actor.js";

export class Player extends Actor {
    static #instance = null;
    constructor() {
        if (Player.#instance) {
            return Player.#instance;
        }
        super();
        Player.#instance = this;
    }
    static getInstance() {
        if (!Player.#instance) {
            Player.#instance = new Player();
        }
        return Player.#instance;
    }


}
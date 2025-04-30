/**
 * Singleton managing user input logic and related actions
 */
export class Controller {
    static #instance = null
    KeyMapping = [
        { action: "moveUp", keys: new Set(["KeyW", "ArrowUp"]) },
        { action: "moveDown", keys: new Set(["KeyS", "ArrowDown"]) },
        { action: "moveLeft", keys: new Set(["KeyA", "ArrowLeft"]) },
        { action: "moveRight", keys: new Set(["KeyD", "ArrowRight"]) },
        { action: "fire", keys: new Set(["Space", "Enter"]) },
    ]
    #inputedKeyCodes = new Set();
    constructor() {
        if (Controller.#instance) {
            return Controller.#instance;
        }
        Controller.#instance = this;
    }
    static getInstance() {
        if (!Controller.#instance) {
            Controller.#instance = new Controller()
        }
        return Controller.#instance
    }
    /**
     * adds code of key pressed into the active input key set
     * @param {*} keyCode 
     */
    addInput(keyCode) {
        this.#inputedKeyCodes.add(keyCode)
    }
    /**
     * removes code of key from the active input key set
     * @param {*} keyCode 
     */
    removeInput(keyCode) {
        this.#inputedKeyCodes.delete(keyCode)
    }
    /**
     * get all actions to execute depending on currently active keys
     * @returns {string[]} action to executes
     */
    getActionsToExecute() {
        return this.KeyMapping
            .filter(({ keys }) => [...keys].some(k => this.#inputedKeyCodes.has(k)))
            .map(({ action }) => action);
    }
}
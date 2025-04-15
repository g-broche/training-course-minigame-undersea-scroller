export class Controller {
    static #instance = null
    KeyMapping = [
        { action: "moveUp", keys: new Set(["KeyZ", "ArrowUp"]) },
        { action: "moveDown", keys: new Set(["KeyS", "ArrowDown"]) },
        { action: "moveLeft", keys: new Set(["KeyQ", "ArrowLeft"]) },
        { action: "moveRight", keys: new Set(["KeyD", "ArrowRight"]) },
        { action: "fire", keys: new Set(["Space", "Enter"]) },
        { action: "pause", keys: new Set(["KeyP"]) },
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
    addInput(keyCode) {
        this.#inputedKeyCodes.add(keyCode)
    }
    removeInput(keyCode) {
        this.#inputedKeyCodes.delete(keyCode)
    }
    getActionsToExecute() {
        return this.KeyMapping
            .filter(({ keys }) => [...keys].some(k => this.#inputedKeyCodes.has(k)))
            .map(({ action }) => action);
    }
}
export class Instruction {
    static #instance = null;
    domElement
    constructor(elementId) {
        if (Instruction.#instance) {
            return Instruction.#instance;
        }
        Instruction.#instance = this;
    }
    static getInstance() {
        if (!Instruction.#instance) {
            Instruction.#instance = new Instruction();
        }
        return Instruction.#instance;
    }
    setDomElement(elementId) {
        this.domElement = document.getElementById(elementId)
    }
    clearInstruction() {
        this.domElement.innerText = "";
    }
    displayInstruction(message) {
        this.domElement.innerText = message;
    }
    displayStandbyMessage() {
        this.displayInstruction(`Press any key to start the game`);
    }
    displayPauseMessage() {
        this.displayInstruction(`Game is paused, press "P" to resume`);
    }
}

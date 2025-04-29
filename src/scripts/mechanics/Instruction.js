/**
 * Singleton for user ingame feedback
 */
export class Instruction {
    static #instance = null;
    domElement
    constructor() {
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
    /**
     * provide instruction's domElement with an id to get the corresponding dom node
     * @param {string} elementId 
     */
    setDomElement(elementId) {
        this.domElement = document.getElementById(elementId)
    }
    /**
     * clear and remove the instruction message from the dom
     */
    clearInstruction() {
        this.domElement.classList.add("display-none")
        this.domElement.innerText = "";
    }
    /**
     * adds a message to the instruction node and display it
     * @param {string} message 
     */
    displayInstruction(message) {
        this.domElement.innerText = message;
        this.domElement.classList.remove("display-none")
    }
    /**
     * display message when awaiting for new round start
     */
    displayStandbyMessage() {
        this.displayInstruction(`Press any key to start the game`);
    }
    /**
     * display warning for game paused
     */
    displayPauseMessage() {
        this.displayInstruction(`Game is paused, press "P" to resume`);
    }
}

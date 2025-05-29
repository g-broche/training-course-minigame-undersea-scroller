/**
 * Service used to manage the modal window
 */
export class Modal {
    static #instance = null;
    domElements = {
        window: null,
        buttonClose: null,
        contentWrapper: null,
        content: null,
        wrapper: null,
    }
    constructor() {
        if (Modal.#instance) {
            return Modal.#instance;
        }
        Modal.#instance = this
    }
    static getInstance() {
        if (!Modal.#instance) {
            Modal.#instance = new Modal();
        }
        return Modal.#instance;
    }
    /**
     * adds listeners to close the modal
     */
    initialize({ actionOnClose = null }) {
        this.domElements.buttonClose.addEventListener("click", () => {
            if (actionOnClose) {
                actionOnClose();
            }
            this.close();
        });
        this.domElements.wrapper.addEventListener("click", () => {
            if (actionOnClose) {
                actionOnClose();
            }
            this.close();
        });
    }
    /**
     * creates the whole modal structure
     * @returns {HTMLElement[]}array with the dom references of the modal background and the modal window
     */
    createModalStructure() {
        this.domElements.wrapper = document.createElement("div");
        this.domElements.wrapper.id = "modal-background";
        this.domElements.wrapper.className = "display-none";
        this.domElements.window = document.createElement("section");
        this.domElements.window.id = "modal-window";
        this.domElements.window.className = "display-none";
        this.domElements.buttonClose = document.createElement("button");
        this.domElements.buttonClose.id = "modal-close";
        this.domElements.buttonClose.innerText = "Close";
        this.domElements.contentWrapper = document.createElement("div");
        this.domElements.contentWrapper.id = "modal-content";
        this.domElements.window.append(this.domElements.contentWrapper, this.domElements.buttonClose);
        return [this.domElements.wrapper, this.domElements.window];
    }
    /**
     * displays the modal
     */
    show() {
        this.domElements.window.classList.remove("display-none");
        this.domElements.wrapper.classList.remove("display-none");
        document.body.classList.add("no-scroll");
    }
    /**
     * hides the modal
     */
    hide() {
        this.domElements.window.classList.add("display-none");
        this.domElements.wrapper.classList.add("display-none");
        document.body.classList.remove("no-scroll");
    }
    /**
     * closes and purge the modal of all recipe info
     *  
     */
    close() {
        this.hide();
        if (!this.domElements.content) {
            return;
        }
        this.removeContent();
        this.domElements.content = null;
    }
    /**
     * append a child node to the modal content node
     * @param {HTMLElement} domContent 
     */
    appendContent(domContent) {
        this.domElements.content = domContent;
        this.domElements.contentWrapper.appendChild(domContent);
    }
    /**
     * removes the appended content of the modal
     */
    removeContent() {
        this.domElements.content.remove();
        this.domElements.content.innerHTML = "";
    }

    /**
     * creates dom content intended to be displayed in the modal on defeat
     */
    createGameOverWindowContent({ score, defeatedEnemies, timeString }) {
        const gameOverComponent = document.createElement("div");
        gameOverComponent.className = "game-over-window";
        const title = document.createElement("h2");
        title.textContent = "GAME OVER";
        const messageOverElement = document.createElement("p");
        const messageTime = `You survived for ${timeString}`
        const messageEnemyCount = `defeated ${defeatedEnemies} enemies`
        const messageScore = `reaching a total score of ${score} points`
        const message = `${messageTime} and ${messageEnemyCount} ${messageScore}.`
        messageOverElement.textContent = message;
        const messageInstructionElement = document.createElement("p");
        messageInstructionElement.textContent = "Close the window and press any button to start a new game"
        gameOverComponent.append(title, messageOverElement, messageInstructionElement);
        this.appendContent(gameOverComponent);
    }
}
import { Player } from "../entities/Player.js";

export class GameBoard {
    static #instance = null
    /** @type {{ board: HTMLDivElement }} */
    domElements = {
        board: null
    };
    /** @type {{ player: Player|null, enemies: any[] }} */
    entities = {
        player: null,
        enemies: []
    }
    sizes = {
        height: null,
        width: null,
    }
    moveSpeedBase = null
    constructor() {
        if (GameBoard.#instance) {
            return GameBoard.#instance;
        }
        GameBoard.#instance = this;
    }
    static getInstance() {
        if (!GameBoard.#instance) {
            GameBoard.#instance = new GameBoard();
        }
        return GameBoard.#instance;
    }
    initialize(boardId) {
        this.domElements.board = document.getElementById(boardId);
        this.sizes.height = this.domElements.board.offsetHeight;
        this.sizes.width = this.domElements.board.offsetWidth;
        this.moveSpeedBase = this.sizes.width / 300;
    }
    getBoundaries() {
        return {
            right: this.domElements.board.offsetWidth,
            bottom: this.domElements.board.offsetHeight,
        }
    }
    addPlayer() {
        this.entities.player = Player.getInstance();
        this.entities.player.setSpeed({
            moveSpeedX: this.moveSpeedBase,
            moveSpeedY: this.moveSpeedBase / 2
        })
        const playerElement = this.entities.player.createElement();
        this.entities.player.toggleVisibility(false)
        this.domElements.board.append(playerElement);
        this.entities.player.setSize()
        this.entities.player.setPosition({ posX: this.entities.player.sizes.halfWidth, posY: this.sizes.height / 2 });
        this.entities.player.ActualizeDisplayLocation();
        this.entities.player.toggleVisibility(true)
    }
}

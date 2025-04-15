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
    moveSpeedBase = {
        x: null,
        y: null,
    }
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
        this.sizes.width = this.domElements.board.offsetHeight;
        this.moveSpeedBase.x = this.sizes.height / 100;
        this.moveSpeedBase.y = this.sizes.height / 200;
    }
    addPlayer() {
        this.entities.player = new Player({
            moveSpeedX: this.moveSpeedBase.x,
            moveSpeedY: this.moveSpeedBase.y
        });
        const playerElement = this.entities.player.createPlayerElement();
        this.entities.player.togglePlayerVisibility(false)
        this.domElements.board.append(playerElement);
        this.entities.player.setSize()
        this.entities.player.setPosition({ posX: this.entities.player.sizes.halfWidth, posY: this.sizes.height / 2 });
        this.entities.player.ActualizeDisplayLocation();
        this.entities.player.togglePlayerVisibility(true)
    }
}

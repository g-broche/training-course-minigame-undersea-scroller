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
        this.moveSpeedBase.x = this.sizes.height / 75;
        this.moveSpeedBase.y = this.sizes.height / 150;
    }
    getBoundaries() {
        return {
            right: this.domElements.board.offsetWidth,
            bottom: this.domElements.board.offsetHeight,
        }
    }
    addPlayer() {
        this.entities.player = Player.getInstance();
        console.log(`get instance`, this.entities.player)
        this.entities.player.setSpeed({
            moveSpeedX: this.moveSpeedBase.x,
            moveSpeedY: this.moveSpeedBase.y
        })
        console.log(`set speed`, this.entities.player)
        const playerElement = this.entities.player.createPlayerElement();
        this.entities.player.togglePlayerVisibility(false)
        this.domElements.board.append(playerElement);
        this.entities.player.setSize()
        console.log(`set size`, this.entities.player)
        this.entities.player.setPosition({ posX: this.entities.player.sizes.halfWidth, posY: this.sizes.height / 2 });
        console.log(`set position`, this.entities.player)
        this.entities.player.ActualizeDisplayLocation();
        console.log(`actualize display`, this.entities.player)
        this.entities.player.togglePlayerVisibility(true)
    }
}

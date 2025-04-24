import { InitializationError } from "./Errors.js";

export class ScoreBoard {
    static #instance = null;
    #clockIntervalId = null;
    #score = 0;
    #defeatedEnemies = 0;
    #timeSurvived = 0;
    domElements = {
        container: null,
        scoreDisplay: null,
        enemiesDefeatedDisplay: null,
        timeDisplay: null,
        instructionWrapper: null,
        instructionMessage: null
    }
    constructor() {
        if (ScoreBoard.#instance) {
            return ScoreBoard.#instance;
        }
        ScoreBoard.#instance = this;
    }
    static getInstance() {
        if (!ScoreBoard.#instance) {
            ScoreBoard.#instance = new ScoreBoard();
        }
        return ScoreBoard.#instance;
    }
    initialize(scoreBoardContainerId) {
        try {
            this.domElements.container = document.getElementById(scoreBoardContainerId)
            this.domElements.scoreDisplay = document.getElementById("score-value")
            this.domElements.enemiesDefeatedDisplay = document.getElementById("enemies-value")
            this.domElements.timeDisplay = document.getElementById("time-value")
            if (
                !this.domElements.container
                || !this.domElements.scoreDisplay
                || !this.domElements.enemiesDefeatedDisplay
                || !this.domElements.timeDisplay
            ) {
                throw new InitializationError("A required element of the scoreboard was not retrieved from the page")
            }
            this.resetScore();
        } catch (error) {
            console.log(error)
            throw new InitializationError("Failed to initialize Scoreboard");
        }
    }
    getScore() {
        return this.#score;
    }
    increaseScore(pointsToAdd) {
        this.#score += pointsToAdd;
        this.refreshScoreDisplay()
    }
    refreshScoreDisplay() {
        this.domElements.scoreDisplay.innerText = this.#score;
    }
    getDefeatedEnemyCount() {
        return this.#defeatedEnemies;
    }
    incrementDefeatedEnemyCounter() {
        this.#defeatedEnemies++;
        this.refreshDefeatedEnemyCounter();
    }
    refreshDefeatedEnemyCounter() {
        this.domElements.enemiesDefeatedDisplay.innerText = this.#defeatedEnemies;
    }
    incrementTimeCounter() {
        this.#timeSurvived++;
        this.refreshSurvivedTime();
    }
    getSurvivedTimeString() {
        const minutes = Math.floor(this.#timeSurvived / 60).toString()
        const seconds = (this.#timeSurvived % 60).toString()
        return `${minutes.length > 1 ? minutes : `0${minutes}`}:${seconds.length > 1 ? seconds : `0${seconds}`}`
    }
    refreshSurvivedTime() {
        this.domElements.timeDisplay.innerText = this.getSurvivedTimeString()
    }
    startClock() {
        this.#clockIntervalId = setInterval(() => {
            this.incrementTimeCounter();
        }, 1000)
    }
    stopClock() {
        clearInterval(this.#clockIntervalId)
        this.#clockIntervalId = null
    }
    resetScore() {
        this.#score = 0;
        this.#defeatedEnemies = 0;
        this.#timeSurvived = 0;
        this.refreshScoreDisplay();
        this.refreshDefeatedEnemyCounter();
        this.refreshSurvivedTime();
    }
}
import { InitializationError } from "./Errors.js";
/**
 * Singleton managing scoreboard data
 */
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
    /**
     * Gets the dom elements required for the class to display data
     * @param {string} scoreBoardContainerId 
     */
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
    /**
     * increase score and refresh display
     * @param {number} pointsToAdd 
     */
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
    /**
     * increment the counter of defeated enemies by one and refresh the related display
     */
    incrementDefeatedEnemyCounter() {
        this.#defeatedEnemies++;
        this.refreshDefeatedEnemyCounter();
    }
    refreshDefeatedEnemyCounter() {
        this.domElements.enemiesDefeatedDisplay.innerText = this.#defeatedEnemies;
    }
    /**
     * increment time survived counter and refresh the related display
     */
    incrementTimeCounter() {
        this.#timeSurvived++;
        this.refreshSurvivedTime();
    }
    /**
     * 
     * @returns {string} time survived in a more user friendly format than second elapsed
     */
    getSurvivedTimeString() {
        const minutes = Math.floor(this.#timeSurvived / 60).toString()
        const seconds = (this.#timeSurvived % 60).toString()
        return `${minutes.length > 1 ? minutes : `0${minutes}`}:${seconds.length > 1 ? seconds : `0${seconds}`}`
    }
    refreshSurvivedTime() {
        this.domElements.timeDisplay.innerText = this.getSurvivedTimeString()
    }
    /**
     * start clock interval to count survived seconds
     */
    startClock() {
        this.#clockIntervalId = setInterval(() => {
            this.incrementTimeCounter();
        }, 1000)
    }

    /**
     * cancel clock ticking interval
     */
    stopClock() {
        clearInterval(this.#clockIntervalId)
        this.#clockIntervalId = null
    }
    /**
     * set all score values to 0 for new round start
     */
    resetScore() {
        this.#score = 0;
        this.#defeatedEnemies = 0;
        this.#timeSurvived = 0;
        this.refreshScoreDisplay();
        this.refreshDefeatedEnemyCounter();
        this.refreshSurvivedTime();
    }
}
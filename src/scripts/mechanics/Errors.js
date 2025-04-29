/**
 * class for error related to failed initialization of singletons and components
 */
export class InitializationError extends Error {
    constructor(message) {
        super(message);
    }
}
/**
 * Throttle function to reduce triggered actions on events with many calls (in this case resize event)
 * will also triggered a last time to account for last interval not capturing the latest state by using
 * a final timeout
 * @param {*} callback 
 * @param {number} throttleDelay 
 * @param {number} debounceDelay 
 * @returns 
 */
export function throttleWithDebounce(callback, throttleDelay = 200, debounceDelay = 500) {
    let lastExec = 0;
    let debounceTimer = null;

    return function (...args) {
        const now = Date.now();

        if (now - lastExec >= throttleDelay) {
            callback.apply(this, args);
            lastExec = now;
        }

        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => {
            callback.apply(this, args);
            lastExec = Date.now();
        }, debounceDelay);
    };
}
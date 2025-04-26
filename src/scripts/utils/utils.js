export const throttle = (callback, delay) => {
    let shouldWait = false;
    return function () {
        if (!shouldWait) {
            callback();
            shouldWait = true;
            setTimeout(() => {
                shouldWait = false;
            }, delay);
        }
    };
}

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
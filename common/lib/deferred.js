const Promise = require('bluebird');

/**
 * Generates a deferred object. It has a method {@code resolve()} to fulfill the wrapped
 * promise, as well as a method {@code reject()} to error it. The member {@code promise}
 * is the wrapped promise.
 * @returns the deferred object
 */
function defer() {
    let resolve, reject;
    let promise = new Promise(function() {
        resolve = arguments[0];
        reject = arguments[1];
    });
    return {
        resolve: resolve,
        reject: reject,
        promise: promise
    };
}

module.exports = defer;
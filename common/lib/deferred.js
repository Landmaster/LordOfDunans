const Promise = require('bluebird');

/**
 * Generates a deferred object. It has a method {@code resolve()} to fulfill the wrapped
 * promise, as well as a method {@code reject()} to error it. The member {@code promise}
 * is the wrapped promise.
 * @constructor
 */
function defer() {
	this.promise = new Promise((resolve, reject) => {
        this.resolve = resolve;
        this.reject = reject;
    });
}

module.exports = defer;
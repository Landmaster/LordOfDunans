/**
 * Constructor for client register/login errors.
 * @param locParams the parameters for localization. {@code locParams[0]} will be assigned to its localized
 * variant on the client, and {@code sprintf.apply(null, locParams)} will be called to get the
 * full localized string.
 * @constructor
 */
function AccountError(...locParams) {
	this.name = this.constructor.name;
	this.message = this.locParams = locParams;
	if (Error.captureStackTrace) {
		Error.captureStackTrace(this, this.constructor);
	} else {
		let stack = new Error().stack;
		if (typeof stack === "string") {
			stack = stack.split("\n");
			stack.shift();
			this.stack = stack.join("\n");
		}
	}
}
AccountError.prototype = Object.create(Error.prototype, {
	constructor: {
		value: AccountError,
		writable: true,
		configurable: true
	}
});

module.exports = AccountError;
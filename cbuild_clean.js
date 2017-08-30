/**
 * @author Landmaster
 */
const Promise = require('bluebird');
const del = Promise.promisify(require('delete'));

Promise.all([
	del('output.js'), del('output.js.map')
]).then(() => console.log('Cleaned'));
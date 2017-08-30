global.Promise = require('bluebird');

const Dunans = require('client/dunans');

// setup vex dialogs
const vex = require('vex-js');
vex.registerPlugin(require('vex-dialog'));
vex.defaultOptions.className = 'vex-theme-os';

// start client
module.exports = new Dunans();
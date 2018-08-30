require('app-module-path').addPath(__dirname);

// setup the doohickeys
const express = require('express');
const app = express();
const Server = require('server/server');
const commandLineArgs = require('command-line-args');
const options = commandLineArgs([
	{name: 'dbformat', type: String, defaultValue: ''}
]);

// start
module.exports = new Server(app, process.env.PORT || 8000, __dirname, options.dbformat);
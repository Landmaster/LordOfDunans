require('app-module-path').addPath(__dirname);

// setup the doohickeys
const express = require('express');
const app = express();
const Server = require('server/server');

// start
module.exports = new Server(app, 8000, __dirname);
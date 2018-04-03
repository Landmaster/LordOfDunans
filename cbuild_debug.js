/**
 * @author Landmaster
 */
const walk = require('walk');
const fs = require('fs');
const browserify = require('browserify');
const exorcist = require('exorcist');

const bfInst = browserify('./client_main.js', {
	paths: ['./'],
	debug: true
});
bfInst.exclude('winston');

const walker = walk.walk('./server/', { followLinks: false });

walker.on('file', function(root, stat, next) {
	bfInst.ignore(root+'/'+stat.name);
	next();
});

walker.on('end', () => {
	console.log('Browserifying file');
	
	const browserify_stream = fs.createWriteStream('output.js');
	
	bfInst.bundle()
		.pipe(exorcist('output.js.map'))
		.pipe(browserify_stream);
	
	browserify_stream.on('close', () => console.log('Browserifying complete'));
});
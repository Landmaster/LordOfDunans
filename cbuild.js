const walk = require('walk');
const browserify = require('browserify');
const fs = require('fs');
const UglifyJS = require("uglify-es");

const bfInst = new browserify('./client_main.js', {
	paths: './'
});

const walker = walk.walk('./server/', { followLinks: false });

walker.on('file', function(root, stat, next) {
	bfInst.ignore(root+'/'+stat.name);
	next();
});

walker.on('end', () => {
	console.log('Browserifying file');
	bfInst.bundle((err, buf) => {
		if (err) throw err;
		console.log('Browserifying complete');
		let pass = buf.toString();
		console.log('Uglify-ing');
		pass = UglifyJS.minify(pass).code;
		console.log('Uglify-ed');
		fs.writeFile('output.js', pass, undefined, (err) => {
			if (err) throw err;
			console.log('Written to file');
		});
	});
});
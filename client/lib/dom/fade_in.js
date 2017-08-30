/**
 * @author Landmaster
 */

'use strict';

module.exports = function fadeIn(elem, dur) {
	elem.style.opacity = 0;
	dur = dur || 400;
	
	let last = +new Date();
	
	(function tick() {
		elem.style.opacity = +elem.style.opacity + (new Date() - last) / dur;
		last = +new Date();
		
		if (+elem.style.opacity < 1) {
			(window.requestAnimationFrame && requestAnimationFrame(tick)) || setTimeout(tick, 16);
		}
	})();
	
	return elem;
};
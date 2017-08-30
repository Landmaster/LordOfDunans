/**
 * @author Landmaster
 */


require('client/lib/l10n');
const sp = require('sprintf-js');

/**
 * Process a DOM element for l10n. The element shall have an attribute “data-l10n” as the l10n key.
 * @param {Element} elem
 * @param {Array} args the format arguments
 * @return {Element} the passed-in element
 */
module.exports = function p_l10n(elem, ...args) {
	if (elem.dataset.l10n) {
		elem.innerHTML = sp.vsprintf(elem.dataset.l10n.toLocaleString(), args);
	}
	for (let i=0; i<elem.children.length; ++i) {
		// recursively process children
		p_l10n(elem.children[i], ...args);
	}
	return elem;
};
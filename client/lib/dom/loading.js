/**
 * @author Landmaster
 */
const Loading = {};
const p_l10n = require('./l10n_process');
Loading.load = element => {
	const dom = element.constructor === Array ? element[0] : element;
	((element.constructor === Array && element[1]) || Loading.default_html_load)(dom);
};
Loading.unload = element => {
	const dom = element.constructor === Array ? element[0] : element;
	((element.constructor === Array && element[2]) || Loading.default_html_unload)(dom);
};
Loading.default_html_load = element => {
	if (element instanceof Element) {
		p_l10n(element).style.display = '';
	} else {
		element.load();
	}
};
Loading.default_html_unload = element => {
	if (element instanceof Element) {
		element.style.display = 'none';
	} else {
		element.unload();
	}
};
module.exports = Loading;
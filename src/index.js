import dlv from 'dlv';
import tmpl from 'templite';

export default function (obj) {
	var locale='', tree = obj || {};

	return {
		set: function (lang, table) {
			tree[lang] = Object.assign(tree[lang] || {}, table);
		},

		locale: function (lang) {
			locale = lang;
		},

		t: function (key, params, lang) {
			var val = dlv(tree[lang || locale], key, '');
			if (typeof val === 'function') return val(params);
			if (typeof val === 'string') return tmpl(val, params);
			return val;
		}
	};
}

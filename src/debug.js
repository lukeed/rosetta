import dlv from 'dlv';
import tmpl from 'templite';

export default function (obj) {
	var locale='', tree = obj || {};

	return {
		set(lang, table) {
			tree[lang] = Object.assign(tree[lang] || {}, table);
		},

		locale(lang) {
			return (locale = lang || locale);
		},

		table(lang) {
			return tree[lang];
		},

		t(key, params, lang) {
			var val = dlv(tree[lang || locale], key);
			if (val == null) {
				return console.error(`[rosetta] Missing the "${[].concat(key).join('.')}" key within the "${lang || locale}" dictionary`);
			}
			if (typeof val === 'function') return val(params);
			if (typeof val === 'string') return tmpl(val, params);
			return val;
		}
	};
}

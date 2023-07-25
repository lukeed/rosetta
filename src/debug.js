import dlv from 'dlv';
import tmpl from 'templite';

export default function (obj) {
	let locale='', tree = obj || {};

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
			let val = dlv(tree[lang || locale], key);

			if (val == null) {
				return console.error(`[rosetta] Missing the "${[].concat(key).join('.')}" key within the "${lang || locale}" dictionary`);
			}

			if (typeof val === 'function') {
				return val(params);
			}

			if (typeof val === 'string') {
				return tmpl(val, params);
			}

			if (typeof val === 'object' && key.endsWith('_count') && params.hasOwnProperty('count')) {
				const count = params.count;
				let pluralRuleToUse = '';

				if (count === 0 && val.hasOwnProperty('zero')) {
					pluralRuleToUse = 'zero';
				} else if (count === 1 && val.hasOwnProperty('one')) {
					pluralRuleToUse = 'one';
				} else {
					pluralRuleToUse = pluralRulesFormatters[lang || locale].select(count);
				}

				if (!val.hasOwnProperty(pluralRuleToUse)) {
					return console.error(`[rosetta] Missing the plural rule "${pluralRuleToUse}" for "${[].concat(key).join('.')}" key within the "${lang || locale}" dictionary`);
				}

				return tmpl(val[pluralRuleToUse], params);
			}

			return val;
		}
	};
}
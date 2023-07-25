import dlv from 'dlv';
import tmpl from 'templite';

export default function (obj) {
	let locale='', tree = obj || {}, pluralRulesFormatters = {};

	return {
		set(lang, table) {
			tree[lang] = Object.assign(tree[lang] || {}, table);
		},

		locale(lang) {
			if (lang) {
				pluralRulesFormatters[lang] = pluralRulesFormatters[lang] || new Intl.PluralRules('en');
			}

			return (locale = lang || locale);
		},

		table(lang) {
			return tree[lang];
		},

		t(key, params, lang) {
			let val = dlv(tree[lang || locale], key, '');

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

				if (val.hasOwnProperty(pluralRuleToUse)) {
					return tmpl(val[pluralRuleToUse], params);
				}
			}

			return val;
		}
	};
}

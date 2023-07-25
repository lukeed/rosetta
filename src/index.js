import dlv from 'dlv';
import tmpl from 'templite';

export default function (obj) {
	let locale='', tree = obj || {}, pluralRulesFormatters = {};

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

		pluralRulesFormatter(lang) {
			return pluralRulesFormatters[lang] = pluralRulesFormatters[lang] || new Intl.PluralRules('en');
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
				let count = params.count,
					pluralRuleToUse = '';

				if (count === 0 && val.hasOwnProperty('zero')) {
					pluralRuleToUse = 'zero';
				} else if (count === 1 && val.hasOwnProperty('one')) {
					pluralRuleToUse = 'one';
				} else {
					pluralRuleToUse = this.pluralRulesFormatter([lang || locale]).select(count);
				}

				if (val.hasOwnProperty(pluralRuleToUse)) {
					return tmpl(val[pluralRuleToUse], params);
				}
			}

			return val;
		}
	};
}

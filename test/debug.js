import { test } from 'uvu';
import * as assert from 'uvu/assert';
import rosetta from '../src/debug';

test('(debug) exports', () => {
	assert.type(rosetta, 'function', 'exports a function');

	let out = rosetta();
	assert.type(out, 'object', 'returns an object');
	assert.type(out.t, 'function', '~> has "t" function');
	assert.type(out.set, 'function', '~> has "set" function');
	assert.type(out.locale, 'function', '~> has "locale" function');
});


test('(debug) usage', () => {
	let _message = '';
	let _error = console.error;
	console.error = str => {
		_message = str;
	}

	let ctx = rosetta({
		en: { hello: 'Hello, {{name}}!' },
		es: { hello: 'Hola {{name}}!' },
		pt: { foo: 'foo {{name}}~!' },
	});

	let foo = ctx.t('hello');
	assert.is(foo, undefined, '~> undefined w/o locale');
	assert.is(_message, `[rosetta] Missing the "hello" key within the "" dictionary`, '~> prints error message');

	assert.is(
		ctx.locale('en'), undefined,
		'>>> ctx.locale()'
	);

	let bar = ctx.t('hello');
	assert.is.not(bar, undefined, '(en) found "hello" key');
	assert.is(bar, 'Hello, !', '~> interpolations empty if missing param');

	let baz = ctx.t('hello', { name: 'world' });
	assert.is(baz, 'Hello, world!', '~> interpolations successful');

	let bat = ctx.t('hello', { name: 'world' }, 'es');
	assert.is.not(bat, undefined, '(es) found "hello" key');
	assert.is(bat, 'Hola world!', '~> success');

	assert.is(
		ctx.t('hello', { name: 'world' }, 'pt'), undefined,
		'(pt) did NOT find "hello" key'
	);

	assert.is(
		_message,
		`[rosetta] Missing the "hello" key within the "pt" dictionary`,
		'~> prints error message'
	);


	assert.is(
		ctx.set('pt', { hello: 'Oí {{name}}!' }), undefined,
		'>>> ctx.set()'
	);

	let quz = ctx.t('hello', { name: 'world' }, 'pt');
	assert.is.not(quz, undefined, '(pt) found "hello" key');
	assert.is(quz, 'Oí world!', '~> success');

	let qut = ctx.t('foo', { name: 'bar' }, 'pt');
	assert.is.not(qut, undefined, '(pt) found "foo" key');
	assert.is(qut, 'foo bar~!', '~> success');

	assert.is(
		ctx.locale('es'), undefined,
		'>>> ctx.locale()'
	);

	let qux = ctx.t('hello', { name: 'default' });
	assert.is.not(qux, undefined, '(es) found "hello" key');
	assert.is(qux, 'Hola default!', '~> success');

	assert.is(
		ctx.t('hello', { name: 'world' }, 'de'), undefined,
		'(de) did NOT find "hello" key'
	);

	assert.is(
		_message,
		`[rosetta] Missing the "hello" key within the "de" dictionary`,
		'~> prints error message'
	);

	assert.is(
		ctx.set('de', { hello: 'Hallo {{name}}!' }), undefined,
		'>>> ctx.set(de)'
	);

	let qar = ctx.t('hello', { name: 'world' }, 'de');
	assert.is.not(qar, undefined, '(de) found "hello" key');
	assert.is(qar, 'Hallo world!', '~> success');

	// restore
	console.error = _error;
});


test('(debug) functional', () => {
	let ctx = rosetta({
		en: {
			hello(value) {
				return `hello ${value || 'stranger'}~!`;
			}
		}
	});

	ctx.locale('en');

	let foo = ctx.t('hello');
	assert.is(foo, 'hello stranger~!', '~> called function w/o param');

	let bar = ctx.t('hello', 'world');
	assert.is(bar, 'hello world~!', '~> called function w/ param (string)');

	let baz = ctx.t('hello', [1,2,3]);
	assert.is(baz, 'hello 1,2,3~!', '~> called function w/ param (array)');
});


test('(debug) nested', () => {
	let _message = '';
	let _error = console.error;
	console.error = str => {
		_message = str;
	}

	let ctx = rosetta({
		en: {
			fruits: {
				apple: 'apple',
				orange: 'orange',
				grape: 'grape',
			}
		},
		es: {
			fruits: {
				apple: 'manzana',
				orange: 'naranja',
				grape: 'uva',
			}
		}
	});

	ctx.locale('en');
	assert.is(ctx.t('fruits.apple'), 'apple', '(en) fruits.apple');
	assert.is(ctx.t('fruits.orange'), 'orange', '(en) fruits.orange');
	assert.is(ctx.t(['fruits', 'grape']), 'grape', '(en) ["fruits","grape"]');

	assert.is(ctx.t('fruits.404'), undefined, '(en) fruits.404 ~> undefined');
	assert.is(_message, `[rosetta] Missing the "fruits.404" key within the "en" dictionary`, '~> prints error message');

	assert.is(ctx.t('error.404'), undefined, '(en) error.404 ~> undefined');
	assert.is(_message, `[rosetta] Missing the "error.404" key within the "en" dictionary`, '~> prints error message');

	assert.is(ctx.t(['fruits', 'mango']), undefined, '(en) error.404 ~> undefined');
	assert.is(_message, `[rosetta] Missing the "fruits.mango" key within the "en" dictionary`, '~> prints error message');

	// ---

	ctx.locale('es');
	assert.is(ctx.t('fruits.apple'), 'manzana', '(es) fruits.apple');
	assert.is(ctx.t('fruits.orange'), 'naranja', '(es) fruits.orange');
	assert.is(ctx.t(['fruits', 'grape']), 'uva', '(es) ["fruits","grape"]');

	assert.is(ctx.t('fruits.404'), undefined, '(es) fruits.404 ~> undefined');
	assert.is(_message, `[rosetta] Missing the "fruits.404" key within the "es" dictionary`, '~> prints error message');

	assert.is(ctx.t('error.404'), undefined, '(es) error.404 ~> undefined');
	assert.is(_message, `[rosetta] Missing the "error.404" key within the "es" dictionary`, '~> prints error message');

	assert.is(ctx.t(['fruits', 'mango']), undefined, '(es) error.404 ~> undefined');
	assert.is(_message, `[rosetta] Missing the "fruits.mango" key within the "es" dictionary`, '~> prints error message');

	// restore
	console.error = _error;
});


test('(debug) arrays', () => {
	let ctx = rosetta({
		en: {
			foo: '{{0}} + {{1}} = {{2}}',
			bar: [{
				baz: 'roses are {{colors.0}}, violets are {{colors.1}}'
			}]
		}
	});

	ctx.locale('en');

	assert.is(
		ctx.t('foo', [1, 2, 3]),
		'1 + 2 = 3',
		'~> foo'
	);

	assert.is(
		ctx.t('bar.0.baz', { colors: ['red', 'blue'] }),
		'roses are red, violets are blue',
		'~> bar.0.baz'
	);
});


test('invalid value', () => {
	let ctx = rosetta({
		en: {
			foo: ['bar'],
		}
	});

	assert.equal(
		ctx.t('foo', null, 'en'),
		['bar']
	);
});


test.run();

import { test } from 'uvu';
import * as assert from 'uvu/assert';
import rosetta from '../src';

test('exports', () => {
	assert.is(typeof rosetta, 'function', 'exports a function');

	let out = rosetta();
	assert.is(typeof out, 'object', 'returns an object');
	assert.is(typeof out.t, 'function', '~> has "t" function');
	assert.is(typeof out.set, 'function', '~> has "set" function');
	assert.is(typeof out.locale, 'function', '~> has "locale" function');
});


test('usage', () => {
	let ctx = rosetta({
		en: { hello: 'Hello, {{name}}!' },
		es: { hello: 'Hola {{name}}!' },
		pt: { foo: 'foo {{name}}~!' },
	});

	assert.equal(
		ctx.table('en'),
		{ hello: 'Hello, {{name}}!' }
	);

	assert.is(
		ctx.table('foobar'),
		undefined
	);

	let foo = ctx.t('hello');
	assert.is(foo, "", '~> "" w/o locale');

	assert.is(
		ctx.locale('en'), 'en',
		'>>> ctx.locale()'
	);

	assert.is(ctx.locale(), 'en');

	let bar = ctx.t('hello');
	assert.is.not(bar, "", '(en) found "hello" key');
	assert.is(bar, 'Hello, !', '~> interpolations empty if missing param');

	let baz = ctx.t('hello', { name: 'world' });
	assert.is(baz, 'Hello, world!', '~> interpolations successful');

	let bat = ctx.t('hello', { name: 'world' }, 'es');
	assert.is.not(bat, "", '(es) found "hello" key');
	assert.is(bat, 'Hola world!', '~> success');

	assert.is(
		ctx.t('hello', { name: 'world' }, 'pt'), "",
		'(pt) did NOT find "hello" key'
	);

	assert.is(
		ctx.set('pt', { hello: 'Oí {{name}}!' }), undefined,
		'>>> ctx.set()'
	);

	let quz = ctx.t('hello', { name: 'world' }, 'pt');
	assert.is.not(quz, '', '(pt) found "hello" key');
	assert.is(quz, 'Oí world!', '~> success');

	let qut = ctx.t('foo', { name: 'bar' }, 'pt');
	assert.is.not(qut, '', '(pt) found "foo" key');
	assert.is(qut, 'foo bar~!', '~> success');

	assert.is(
		ctx.locale('es'), 'es',
		'>>> ctx.locale()'
	);

	assert.is(ctx.locale(), 'es');
	assert.is(ctx.locale(''), 'es');
	assert.is(ctx.locale(false), 'es');
	assert.is(ctx.locale(null), 'es');
	assert.is(ctx.locale(0), 'es');

	let qux = ctx.t('hello', { name: 'default' });
	assert.is.not(qux, '', '(es) found "hello" key');
	assert.is(qux, 'Hola default!', '~> success');

	assert.is(
		ctx.t('hello', { name: 'world' }, 'de'), '',
		'(de) did NOT find "hello" key'
	);

	assert.is(
		ctx.set('de', { hello: 'Hallo {{name}}!' }), undefined,
		'>>> ctx.set(de)'
	);

	let qar = ctx.t('hello', { name: 'world' }, 'de');
	assert.is.not(qar, '', '(de) found "hello" key');
	assert.is(qar, 'Hallo world!', '~> success');
});


test('functional', () => {
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


test('nested', () => {
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
	assert.is(ctx.t('fruits.404'), "", '(en) fruits.404 ~> ""');
	assert.is(ctx.t('error.404'), "", '(en) error.404 ~> ""');

	ctx.locale('es');
	assert.is(ctx.t('fruits.apple'), 'manzana', '(es) fruits.apple');
	assert.is(ctx.t('fruits.orange'), 'naranja', '(es) fruits.orange');
	assert.is(ctx.t(['fruits', 'grape']), 'uva', '(es) ["fruits","grape"]');
	assert.is(ctx.t('fruits.404'), "", '(es) fruits.404 ~> ""');
	assert.is(ctx.t('error.404'), "", '(es) error.404 ~> ""');
});


test('arrays', () => {
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

import test from 'tape';
import rosetta from '../src/debug';

test('(debug) exports', t => {
	t.is(typeof rosetta, 'function', 'exports a function');

	let out = rosetta();
	t.is(typeof out, 'object', 'returns an object');
	t.is(typeof out.t, 'function', '~> has "t" function');
	t.is(typeof out.set, 'function', '~> has "set" function');
	t.is(typeof out.locale, 'function', '~> has "locale" function');

	t.end();
});


test('(debug) usage', t => {
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
	t.is(foo, undefined, '~> undefined w/o locale');
	t.is(_message, `[rosetta] Missing the "hello" key within the "" dictionary`, '~> prints error message');

	t.is(
		ctx.locale('en'), undefined,
		'>>> ctx.locale()'
	);

	let bar = ctx.t('hello');
	t.not(bar, undefined, '(en) found "hello" key');
	t.is(bar, 'Hello, !', '~> interpolations empty if missing param');

	let baz = ctx.t('hello', { name: 'world' });
	t.is(baz, 'Hello, world!', '~> interpolations successful');

	let bat = ctx.t('hello', { name: 'world' }, 'es');
	t.not(bat, undefined, '(es) found "hello" key');
	t.is(bat, 'Hola world!', '~> success');

	t.is(
		ctx.t('hello', { name: 'world' }, 'pt'), undefined,
		'(pt) did NOT find "hello" key'
	);

	t.is(
		_message,
		`[rosetta] Missing the "hello" key within the "pt" dictionary`,
		'~> prints error message'
	);


	t.is(
		ctx.set('pt', { hello: 'Oí {{name}}!' }), undefined,
		'>>> ctx.set()'
	);

	let quz = ctx.t('hello', { name: 'world' }, 'pt');
	t.not(quz, undefined, '(pt) found "hello" key');
	t.is(quz, 'Oí world!', '~> success');

	let qut = ctx.t('foo', { name: 'bar' }, 'pt');
	t.not(qut, undefined, '(pt) found "foo" key');
	t.is(qut, 'foo bar~!', '~> success');

	t.is(
		ctx.locale('es'), undefined,
		'>>> ctx.locale()'
	);

	let qux = ctx.t('hello', { name: 'default' });
	t.not(qux, undefined, '(es) found "hello" key');
	t.is(qux, 'Hola default!', '~> success');

	t.is(
		ctx.t('hello', { name: 'world' }, 'de'), undefined,
		'(de) did NOT find "hello" key'
	);

	t.is(
		_message,
		`[rosetta] Missing the "hello" key within the "de" dictionary`,
		'~> prints error message'
	);


	t.is(
		ctx.set('de', { hello: 'Hallo {{name}}!' }), undefined,
		'>>> ctx.set(de)'
	);

	let qar = ctx.t('hello', { name: 'world' }, 'de');
	t.not(qar, undefined, '(de) found "hello" key');
	t.is(qar, 'Hallo world!', '~> success');

	// restore
	console.error = _error;

	t.end();
});


test('(debug) functional', t => {
	let ctx = rosetta({
		en: {
			hello(value) {
				return `hello ${value || 'stranger'}~!`;
			}
		}
	});

	ctx.locale('en');

	let foo = ctx.t('hello');
	t.is(foo, 'hello stranger~!', '~> called function w/o param');

	let bar = ctx.t('hello', 'world');
	t.is(bar, 'hello world~!', '~> called function w/ param (string)');

	let baz = ctx.t('hello', [1,2,3]);
	t.is(baz, 'hello 1,2,3~!', '~> called function w/ param (array)');

	t.end();
});


test('(debug) nested', t => {
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
	t.is(ctx.t('fruits.apple'), 'apple', '(en) fruits.apple');
	t.is(ctx.t('fruits.orange'), 'orange', '(en) fruits.orange');
	t.is(ctx.t(['fruits', 'grape']), 'grape', '(en) ["fruits","grape"]');

	t.is(ctx.t('fruits.404'), undefined, '(en) fruits.404 ~> undefined');
	t.is(_message, `[rosetta] Missing the "fruits.404" key within the "en" dictionary`, '~> prints error message');

	t.is(ctx.t('error.404'), undefined, '(en) error.404 ~> undefined');
	t.is(_message, `[rosetta] Missing the "error.404" key within the "en" dictionary`, '~> prints error message');

	t.is(ctx.t(['fruits', 'mango']), undefined, '(en) error.404 ~> undefined');
	t.is(_message, `[rosetta] Missing the "fruits.mango" key within the "en" dictionary`, '~> prints error message');

	// ---

	ctx.locale('es');
	t.is(ctx.t('fruits.apple'), 'manzana', '(es) fruits.apple');
	t.is(ctx.t('fruits.orange'), 'naranja', '(es) fruits.orange');
	t.is(ctx.t(['fruits', 'grape']), 'uva', '(es) ["fruits","grape"]');

	t.is(ctx.t('fruits.404'), undefined, '(es) fruits.404 ~> undefined');
	t.is(_message, `[rosetta] Missing the "fruits.404" key within the "es" dictionary`, '~> prints error message');

	t.is(ctx.t('error.404'), undefined, '(es) error.404 ~> undefined');
	t.is(_message, `[rosetta] Missing the "error.404" key within the "es" dictionary`, '~> prints error message');

	t.is(ctx.t(['fruits', 'mango']), undefined, '(es) error.404 ~> undefined');
	t.is(_message, `[rosetta] Missing the "fruits.mango" key within the "es" dictionary`, '~> prints error message');

	// restore
	console.error = _error;

	t.end();
});


test('(debug) arrays', t => {
	let ctx = rosetta({
		en: {
			foo: '{{0}} + {{1}} = {{2}}',
			bar: [{
				baz: 'roses are {{colors.0}}, violets are {{colors.1}}'
			}]
		}
	});

	ctx.locale('en');

	t.is(
		ctx.t('foo', [1, 2, 3]),
		'1 + 2 = 3',
		'~> foo'
	);

	t.is(
		ctx.t('bar.0.baz', { colors: ['red', 'blue'] }),
		'roses are red, violets are blue',
		'~> bar.0.baz'
	);

	t.end();
});


test('invalid value', t => {
	let ctx = rosetta({
		en: {
			foo: ['bar'],
		}
	});

	t.same(
		ctx.t('foo', null, 'en'),
		['bar']
	);

	t.end();
});

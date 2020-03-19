import test from 'tape';
import rosetta from '../src';

test('exports', t => {
	t.is(typeof rosetta, 'function', 'exports a function');

	let out = rosetta();
	t.is(typeof out, 'object', 'returns an object');
	t.is(typeof out.t, 'function', '~> has "t" function');
	t.is(typeof out.set, 'function', '~> has "set" function');
	t.is(typeof out.locale, 'function', '~> has "locale" function');

	t.end();
});


test('usage', t => {
	let ctx = rosetta({
		en: { hello: 'Hello, {{name}}!' },
		es: { hello: 'Hola {{name}}!' },
		pt: { foo: 'foo {{name}}~!' },
	});

	let foo = ctx.t('hello');
	t.is(foo, undefined, '~> undefined w/o locale');

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
		ctx.set('de', { hello: 'Hallo {{name}}!' }), undefined,
		'>>> ctx.set(de)'
	);

	let qar = ctx.t('hello', { name: 'world' }, 'de');
	t.not(qar, undefined, '(de) found "hello" key');
	t.is(qar, 'Hallo world!', '~> success');

	t.end();
});

<div align="center">
  <img src="logo.jpg" alt="rosetta" height="130" />
</div>

<div align="center">
  <a href="https://npmjs.org/package/rosetta123">
    <img src="https://badgen.now.sh/npm/v/rosetta123" alt="version" />
  </a>
  <a href="https://github.com/lukeed/rosetta/actions">
    <img src="https://badgen.net/github/status/lukeed/rosetta" alt="status" />
  </a>
  <a href="https://codecov.io/gh/lukeed/rosetta">
    <img src="https://badgen.net/codecov/c/github/lukeed/rosetta" alt="codecov" />
  </a>
</div>

<div align="center">A general purpose internationalization library in 289 bytes!</div>

## Features

* Simple and Familiar API
* Unobstrusive and Unopinionated
* Less than 300 bytes – including dependencies!


## Install

```
$ npm install --save rosetta
```


## Usage

```js
import rosetta from 'rosetta';

const i18n = rosetta({
	en: {
		intro: {
			welcome: 'Welcome, {{username}}!',
			text: 'I hope you find this useful.',
		},
		support(obj) {
			let hour = Math.floor(Math.random() * 3) + 9;
			let str = `For questions, I'm available on ${obj.date.toLocaleDateString()}`;
			str += `, any time after ${hour}:00.`
			return str;
		}
	}
});

// set default language
i18n.locale('en');

// add new language
i18n.set('pt', {
	intro: {
		welcome: obj => `Benvind${obj.feminine ? 'a' : 'o'}, ${obj.username}!`,
		text: 'Espero que você ache isso útil.'
	}
});

// append extra key(s) to existing language
i18n.set('pt', {
	support(obj) {
		let hour = Math.floor(Math.random() * 3) + 9;
		let str = `Se tiver perguntas, estou disponível em ${obj.date.toLocaleDateString()}`;
		str += `, qualquer hora depois às ${hour}:00.`
		return str;
	}
});

const data = {
	feminine: false,
	username: 'lukeed',
	date: new Date()
};

// Retrieve translations
// NOTE: Relies on "en" default
i18n.t('intro.welcome', data); //=> 'Welcome, lukeed!'
i18n.t('intro.text', data); //=> 'I hope you find this useful.'
i18n.t('support', data); //=> 'For questions, I'm available on 4/8/2020, any time after 11:00.'

// Retrieve translations w/ lang override
i18n.t('intro.welcome', data, 'pt'); //=> 'Benvindo, lukeed!'

// Change default language key
i18n.locale('pt');

// Retrieve translations w/ new defaults
i18n.t('intro.text', data); //=> 'Espero que você ache isso útil.'
i18n.t('intro.text', data, 'en'); //=> 'I hope you find this useful.'
```


## API

### rosetta(dict?)
Returns: `Rosetta`

Initializes a new `Rosetta` instance.<br>You may optionally provide an initial translation object.

### rosetta.locale(lang)

Sets the language code for the `Rosetta` instance.<br>This will cause all [`rossetta.t()`](#rosettatkey-params-lang) lookups to assume this `lang` code.

#### lang
Type: `String`

The language code to choose.


### rosetta.set(lang, table)

Merge (or override) translation keys into the `lang` collection.

#### lang
Type: `String`

The language code to target.

#### table
Type: `Object`

A new record of key-values to merge into the `lang`'s dictionary.


### rosetta.t(key, params?, lang?)
Returns: `String` or `undefined`

Retrieve the value for a given `key`.

#### key
Type: `String` or `Array<String|Number>`

The identifier to retrieve.

A `key` can access nested properties via:

* a string that with dot notation &mdash; `'foo.bar[1].baz'`
* an array of individual key segments &mdash; `['foo', 'bar', 1, 'baz']`

> **Important:** You are expected to know & traverse your own dictionary structure correctly.

```js
const ctx = rosetta({
	en: {
		fruits: {
			apple: 'apple',
		}
	}
});

ctx.locale('en');

ctx.t('fruits.apple'); //=> 'apple'
ctx.t(['fruits', 'apple']); //=> 'apple'
```

### params
Type: `any`<br>
Optional: `true`

The data object argument to pass your dictionary keys' string templates and/or functions.

> **Note:** If your *string template* tries to access a key that doesn't exist, an empty string is injected.

```js
const ctx = rosetta({
	es: {
		hello: '¡Hola {{name}}!'
	},
	en: {
		hello(obj) {
			return obj.name === 'lukeed' ? 'wazzzuppp' : `Hello, ${obj.name}!`;
		},
	},
	pt: {
		hello: 'Oi {{person}}, tudo bem?' // <-- key is wrong
	},
});

const user1 = { name: 'lukeed' };
const user2 = { name: 'Billy' };

ctx.t('hello', user1, 'es'); //=> '¡Hola lukeed!'

ctx.t('hello', user1, 'en'); //=> 'wazzzuppp'
ctx.t('hello', user2, 'en'); //=> 'Hello, Billy!'

ctx.t('hello', user1, 'pt'); //=> 'Oi , tudo bem?'
```

### lang
Type: `String`<br>
Optional: `true`

A language code override without changing the entire `Rosetta` instance's default language.

```js
const ctx = rosetta();

ctx.locale('en'); //=> set default

ctx.t('greeting', 'lukeed');
//=> (en) 'Hello lukeed!'
ctx.t('greeting', 'lukeed', 'es');
//=> (es) '¡Hola lukeed!'
ctx.t('bye');
//=> (en) 'Cya'
```

## Runtime Support

The library makes use of [Object shorthand methods](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions/Method_definitions#Browser_compatibility) and [`Object.assign`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/assign#Browser_compatibility).<br>This yields the following support matrix:

| Chrome | Safari | Firefox | Edge | IE | Node.js |
|:---:|:--:|:---:|:---:|:---:|:----:|
| 45+ | 9+ | 34+ | 12+ | :x: | 4.0+ |

If you need to support older platforms, simply attach `rosetta` to your project's Babel (or similar) configuration.

## Credits

Thank you [7sempra](https://github.com/7sempra) for gifting the `rosetta` name on npm.

## License

MIT © [Luke Edwards](https://lukeed.com)

### Release notes

## 3.1.0
- added `state` getter
- unused code stripping, further reducing file size (Bun powered)

## 3.0.0
- **breaking:** absorbed `Obsidia` into flagship `Obsidium`.
	- the differentiating factor resulting in two modes:
		- _Method mode:_ the OG `Obsidium[method](el)` and
		- _Function mode:_ `Obsidium(el)` --- _see [code examples](https://github.com/dkazmer/Obsidium/wiki/Code-examples)_

## 2.0.0
- **breaking:** pass the iterable over the individual entry,
    - making subs more manageable, letting you iterate _within_ your callback;
    - to achieve same with `mutation`, use `subscribe` method.
- **new** feature! `Obsidia`: attach multiple observers to the same element at once
- extensive type optimizations

## 1.2.0
- notifier callbacks: added instance as final parameter
- precise `this` context for all notifier callbacks

## 1.1.1
- properly typed `this` context for all notifer callbacks

## 1.1.0
- precise types in `Notify` interface
- better, less manual `Obsidium` type with generic
- `.on()` return type excludes notifiers already used, when chained
- `.on()` check whether a notifier already exists at runtime
- new! `.subscribe()` method
- export each wrapper class individually
- crossed 80% unit test coverage!

## 1.0.0
- initial release

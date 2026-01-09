# Obsidium
Declarative wrapper class for the JS observers.

### Rationale

Created to encourage greater use of these high-value JS utilities, as they're vastly unknown and criminally underused, largely due to their complex implementation strategy. I found that every time I wanted to use one or more of them, I'd have to go out of my way to research and refresh my understanding thereof.

Moreover, there are subtle differences in their implementation between them that are somewhat irritating. I really just want to _set it and forget it._ `Obsidium` allows you to do just that…in a strongly typed, consolidated way.

Obs. name | wraps…
--------- | --------
`mutation` | `MutationObserver`
`resize` | `ResizeObserver`
`intersection` | `IntersectionObserver`

### Usage

The idea is to instantiate the desired type of observer, then simply subscribe to it…without having to be aware of the underlying BS.

Implementation examples (not exhaustive):
```ts
import { Obsidium } from 'obsidium';

Obsidium.mutation(scopeElement)
	.on('add', addFn)
	.on('remove', removeFn);

Obsidium.resize(element).on('resize', resizeFn);

Obsidium.intersection(element)
	.on('intersect', function ([entry]) {
		this.dump();
		// do something...
	});
```
See more [code examples](https://github.com/dkazmer/Obsidium/wiki/Code-examples).

### Members

__Control__ your instance with the following methods:

Method | Desc.
------ | -----
`suspend` | stop observing; reserves the right to resume
`resume` | resume a suspended observer
`toggle` | suspend or resume depending on observer state
`dump` | end the process entirely and destroy the instance

### Settings

The generic default settings are set for each observer, which can be optionally overridden via the second argument of the wrapped constructor, specific to the chosen observer type. **Caveat:** `resize` has no such settings arg. as it's not complex enough to need it.

```ts
const myObs: Obsidium = Obsidium[name](element, options?);
```

### Advanced

- use the alternatively available `subscribe` method
- find the `Obsidium` instance object as an additional callback parameter
- import only the wrapper class you need for optimal _tree shaking_
- attach multiple observers to the same element at once with `Obsidia`

---

<!-- ![Coded by human ><](https://webshifted.com/tribute/imgs/blog.gif) -->
<img src="https://webshifted.com/tribute/imgs/blog.gif" align="left" hspace="8" />[Daniel K.](https://github.com/dkazmer)<br>
Coded by human

# Obsidium
Declarative wrapper class for the JS observers.

### Rationale

Created to encourage greater use of these high-value JS utilities, as they're vastly unknown and criminally underused, largely due to their complex implementation strategy.

I found that every time I wanted to use one or more of them, I'd have to go out of my way to research and refresh my understanding thereof. Moreover, there are subtle differences in their implementation between them that's just annoying.

I really just want to _set it and forget it._ `Obsidium` allows you to do just that…in a strongly typed, consolidated way. The idea is to instantiate the desired type of observer, then subscribe to it via `.on(…)` — without having to be aware of the underlying BS.

Obs. name | wraps…
--------- | --------
`mutation` | `MutationObserver`
`resize` | `ResizeObserver`
`intersection` | `IntersectionObserver`

### Usage

Implementation examples (not exhaustive):
```ts
import { Obsidium } from 'obsidium';

Obsidium.mutation(scopeElement)
	.on('add', myCallbackAdd)
	.on('remove', myCallbackRmv);

Obsidium.resize(element).on('resize', myCallback);
Obsidium.intersection(element).on('intersect', myCallback);
```
`on` method is fully IntelliSensed. Meaning, the available options will be made known.

### Members

Control your instance with the following methods:

Method | Desc.
------ | -----
`suspend` | stop observing; reserves the right to resume
`resume` | resume a suspended observer
`toggle` | suspend or resume depending on observer state
`dump` | end the process entirely and destroy the instance

### Settings

The generic default settings are set for each observer, which can be overridden via the second, pointedly typed, parameter of the wrapped constructor, specific to the chosen observer type. **Caveat:** `resize` has no such settings as it's not complex enough to need one.

```ts
const myObs: Obsidium = Obsidium[obsName](elementObsd, obsOptions);
```

### Advanced

<!-- As of v1.1 … -->
- use the alternatively available `subscribe` method
- import only the wrapper class you need

<!-- As of v1.1, use the `subscribe` method.
```ts
Obsidium.intersection(...).subscribe(entry => void 0));
```

Also as of v1.1, import only the wrapper class you need.
```ts
import { Resize } from 'obsidium';
``` -->
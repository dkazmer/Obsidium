# Obsidium
Declarative wrapper class for the JS observers:

### Rationale

Created to encourage greater use of these high-value JS utilities, as they're vastly underused and criminally unknown, largely due to their complex implementation strategy.

I found that every time I wanted to use one or more of them, I'd have to go out of my way to research and refresh my understanding thereof. Moreover, there are subtle differences in their implementation between them that's just annoying.

I really just want to set it and forget it. `Obsidium` allows me and just about anyone else to do just that...in a consolidated way. The idea is to instantiate the desired type of observer:

Class | wraps...
----- | --------
`mutation` | `MutationObserver`
`resize` | `ResizeObserver`
`intersection` | `IntersectionObserver`

### Usage

Implementation examples:
```ts
import { Obsidium } from 'obsidium';

Obsidium.mutation(scopeElement)
	.on('added', myCallbackAdd)
	.on('removed', myCallbackRmv);

Obsidium.resize(element).on('resize', myCallback);
Obsidium.intersection(element).on('intersect', myCallback);
```
`on` method is fully intellisensed! Control your instance with the following methods:

Method | Desc.
------ | -----
`suspend` | stop observing; reserves the right to resume
`resume` | resume a suspended observer
`toggle` | suspend or resume depending on observer state
`dump` | end the process entirely and destroy the instance

The generic default settings are set for each observer, which can be overridden via the second, fully typed, parameter of the constructor, specific to the chosen observer type. **Caveat:** `resize` has no "options" param as it's not complex enough to need one.

```ts
const myObs = new Obsidium[observerType](elementObserved, observerTypeOptions);
```

/**
 * Declarative wrapper functions for the JS observers:
 * - {@linkcode Obsidium.mutation|mutation} _MutationObserver_
 * - {@linkcode Obsidium.resize|resize} _ResizeObserver_
 * - {@linkcode Obsidium.intersection|intersection} _IntersectionObserver_
 * @summary Created to encourage greater use of these high-value JS utilities,
 * as they're vastly underused and unknown, largely due to their complex implementation strategy.
 * @author Daniel B. Kazmer
 * @version 2.0.0
 * @see {@link https://github.com/dkazmer/Obsidium|GitHub}
 */
export namespace Obsidium {
	/**
	 * Declarative wrapper for `IntersectionObserver`. Control methods:
	 * - {@linkcode Observer.suspend|suspend}
	 * - {@linkcode Observer.resume|resume}
	 * - {@linkcode Observer.toggle|toggle}
	 * - {@linkcode Observer.dump|dump}
	 * @example
	 * Obsidium.intersection(element).on('intersect', callbackFn);
	 */
	export function intersection(target: Element, settings?: IntersectionObserverInit) {
		return new Intersection(target, settings);
	}

	/**
	 * Declarative wrapper for `ResizeObserver`. Control methods:
	 * - {@linkcode Observer.suspend|suspend}
	 * - {@linkcode Observer.resume|resume}
	 * - {@linkcode Observer.toggle|toggle}
	 * - {@linkcode Observer.dump|dump}
	 * @example
	 * Obsidium.resize(element).on('resize', callbackFn);
	 */
	export function resize(target: Element) {
		return new Resize(target);
	}

	/**
	 * Declarative wrapper for `MutationObserver`. Control methods:
	 * - {@linkcode Observer.suspend|suspend}
	 * - {@linkcode Observer.resume|resume}
	 * - {@linkcode Observer.toggle|toggle}
	 * - {@linkcode Observer.dump|dump}
	 * @example
	 * Obsidium.mutation(scopeElement)
	 *   .on('add', addFn)
	 *   .on('remove', removeFn);
	 */
	export function mutation(target: Node, settings?: MutationObserverInit) {
		return new Mutation(target, settings);
	}
}

/**
 * Declarative wrapper for _any / all_ of the three major JS observers. Control methods:
 * - {@linkcode All.suspend|suspend}
 * - {@linkcode All.resume|resume}
 * - {@linkcode All.toggle|toggle}
 * - {@linkcode All.dump|dump}
 * @summary Good for attaching multiple observers to the same element at once.
 * @example
 * Obsidia(element)
 *   .on('mutate', mutateFn)
 *   .on('resize', resizeFn);
 */
export function Obsidia<T extends ObserverType>(
	target: T extends MutationObserver ? Node : Element,
	settings?: MutationObserverInit & IntersectionObserverInit
) {
	return new All<T>(target, settings);
}

// -----------------------------------------------------------------------------------------------------
// classes

abstract class Observer<T extends ObserverType, OnKeys extends keyof Notify = ByObs<T>[2]> {
	#isSuspended = true;

	protected observer!: T;
	protected notify: { [K in OnKeys]?: Notify<ThisType<this>>[K] } = {};
	protected notifySub?(this: ByObs<T>[1], arg: ByObs<T>[0], obs: Obsidium): void;

	public type = '';

	constructor(
		private target: T extends MutationObserver ? Node : Element,
		private settings?: MutationObserverInit
	) {
		resolve('Safe to invoke sub class methods').then(() => {
			this.type = this.observer?.constructor.name || 'any';
			// this.resume();
		});
	}

	/**
	 * `resume` (explicit)
	 * @summary resume a suspended observer
	 */
	public resume() {
		if (this.#isSuspended === false) {
			warn('Obsidium: observer is already running.');
			return;
		}

		this.observer instanceof MutationObserver
			? this.observer.observe(this.target, { attributes: true, childList: true, subtree: true, ...this.settings })
			: this.observer.observe(this.target as Element);

		this.#isSuspended = false;
	}

	/**
	 * `suspend` (explicit)
	 * @summary suspend observation; reserves the right to resume
	 */
	public suspend() {
		if (this.#isSuspended === true) {
			warn('Obsidium: observer is already suspended.');
			return;
		}

		this.observer.disconnect();
		this.#isSuspended = true;
	}

	/**
	 * `toggle` (implicit)
	 * @summary suspend or resume depending on observer state
	 */
	public toggle() {
		this.#isSuspended ? this.resume() : this.suspend();
	}

	/**
	 * `dump`
	 * @summary end the process entirely and destroy the instance
	 */
	public dump() {
		this.observer?.disconnect();

		for (const prop in this) {
			Object.hasOwn(this, prop) && delete this[prop];
		}
	}

	/**
	 * `on` (specific)
	 * @summary subscription method, with accurate IntelliSense; examples in parent class/fn
	 */
	public on<K extends OnKeys>(
		name: K,
		fn: Exclude<Notify<ByObs<T>[1]>[K], undefined>
	): Observer<T, Exclude<OnKeys, K>> {
		this.notify[name]
			? warn(`Obsidium: a subscription already exists for <${name}> on this instance.`)
			: (this.notify[name] = (...e: unknown[]) => fn.call(this as Any, ...(e as [Any, Any, Any]))); // Any's to avoid unnecessary, internal-facing TS gymnastics

		return this;
	}

	/**
	 * `subscribe` (generic)
	 * @summary subscription method; like {@linkcode on} but non-discriminatory; pass only callback
	 */
	public subscribe(fn: Exclude<typeof this.notifySub, undefined>): void {
		this.notifySub
			? warn('Obsidium: a <subscribe> notifier has already been created for this instance.')
			: (this.notifySub = e => fn.call(this as Any, e, this as Any)); // Any to avoid unnecessary, internal-facing TS gymnastics
	}
}

export class Intersection extends Observer<IntersectionObserver> {
	constructor(target: Element, settings?: IntersectionObserverInit) {
		super(target);

		this.observer = new IntersectionObserver(
			(entries, _obs) => {
				/* for (const entry of entries) {
					this.notify.intersect?.(entry, this);
					this.notifySub?.(entry, this);
				} */
				this.notify.intersect?.(entries, this);
				this.notifySub?.(entries, this);
			},
			{
				root: null,
				rootMargin: '0px',
				...settings
			}
		);

		this.resume();
	}
}

export class Resize extends Observer<ResizeObserver> {
	constructor(target: Element) {
		super(target);

		this.observer = new ResizeObserver((entries, _obs) => {
			/* for (const entry of entries) {
				this.notify.resize?.(entry, this);
				this.notifySub?.(entry, this);
			} */
			if (entries) {
				this.notify.resize?.(entries, this);
				this.notifySub?.(entries, this);
			}
		});

		this.resume();
	}
}

export class Mutation extends Observer<MutationObserver> {
	constructor(target: Node, settings?: MutationObserverInit) {
		super(target, settings);

		this.observer = new MutationObserver((records, _obs) => {
			for (const mutation of records) {
				switch (mutation.type) {
					// biome-ignore format: compact
					case 'childList': {
						const { addedNodes, removedNodes } = mutation;
						addedNodes.length && this.notify.add?.(addedNodes, this);
						removedNodes.length && this.notify.remove?.(removedNodes, this);
						(addedNodes.length || removedNodes.length) && this.notify.mutate?.(addedNodes, removedNodes, this)
					} break;

					// biome-ignore format: compact
					case 'attributes': {
						const { target: t, attributeName } = mutation;
						this.notify.attr?.({ attribute: attributeName, target: t }, this);
					}
				}
			}

			this.notifySub?.(records, this);
		});

		this.resume();
	}
}

class All<T extends ObserverType, OnKeys extends keyof Notify = ByObs<T>[2]> {
	// implements Observer<ObserverType, OnKeys>
	#mutation?: Mutation;
	#resize?: Resize;
	#intersection?: Intersection;

	#isSuspended = true;
	#observers = new Set<Mutation | Resize | Intersection>();

	constructor(
		private target: Node | Element,
		private settings?: MutationObserverInit & IntersectionObserverInit
	) {}

	private determine(name: OnKeys, fn: (...args: Any[]) => void) {
		switch (name) {
			case 'add':
			case 'remove':
			case 'mutate':
			case 'attr':
				if (!this.#mutation) {
					this.#mutation = new Mutation(this.target as Node, this.settings);
					this.#observers.add(this.#mutation);
				}
				this.#mutation.on(name, fn);
				break;

			case 'resize':
				if (!this.#resize) {
					this.#resize = new Resize(this.target as Element);
					this.#observers.add(this.#resize);
				}
				this.#resize.on(name, fn);
				break;

			case 'intersect':
				if (!this.#intersection) {
					this.#intersection = new Intersection(this.target as Element, this.settings);
					this.#observers.add(this.#intersection);
				}
				this.#intersection.on(name, fn);
				break;

			default:
				break;
		}

		// @ts-expect-error (2339): does not exist
		if (process?.env.NODE_ENV === 'test') this.o = this.#observers;
	}

	/**
	 * `resume` (explicit)
	 * @summary resume a suspended observer
	 */
	public resume() {
		if (this.#isSuspended === false) {
			warn('Obsidia: observer/s already running.');
			return;
		}

		this.#observers.forEach(obs => {
			obs.resume();
		});

		this.#isSuspended = false;
	}

	/**
	 * `suspend` (explicit)
	 * @summary suspend observation; reserves the right to resume
	 */
	public suspend() {
		if (this.#isSuspended === true) {
			warn('Obsidia: observer/s already suspended.');
			return;
		}

		this.#observers.forEach(obs => {
			obs.suspend();
		});

		this.#isSuspended = true;
	}

	/**
	 * `toggle` (implicit)
	 * @summary suspend or resume depending on observer state
	 */
	public toggle() {
		this.#isSuspended ? this.resume() : this.suspend();
	}

	/**
	 * `dump`
	 * @summary end the process entirely and destroy the instance
	 */
	public dump() {
		this.#observers.forEach(obs => {
			obs.dump();
		});

		for (const prop in this) {
			Object.hasOwn(this, prop) && delete this[prop];
		}
	}

	public on<K extends OnKeys>(name: K, fn: Notify[K]): All<T, Exclude<OnKeys, K>> {
		this.determine(name, fn);
		return this;
	}
}

/**
 * Prevents sub class prop assignments before their "registration" proper.
 * Seems to take precedence over a time-out.
 * @returns a promise
 */
function resolve<T = string>(msg: T) {
	return new Promise<T>(res => res(msg));
}

function warn(msg: string) {
	// biome-ignore lint/suspicious/noConsole: allow console.warn
	console.warn(msg);
}

// -----------------------------------------------------------------------------------------------------
// types

// biome-ignore lint/suspicious/noExplicitAny: allow `any` where needed
type Any = any;
type ObserverType = MutationObserver | ResizeObserver | IntersectionObserver;

// must include a user-facing default generic
interface Notify<T = Obsidium> {
	attr: (this: T, obj: { attribute: string | null; target: Node }, obs: Obsidium<'mutation'>) => void;
	add: (this: T, nodes: NodeList, obs: Obsidium<'mutation'>) => void;
	remove: (this: T, nodes: NodeList, obs: Obsidium<'mutation'>) => void;
	mutate: (this: T, added: NodeList, removed: NodeList, obs: Obsidium<'mutation'>) => void;
	resize: (this: T, entry: ResizeObserverEntry[], obs: Obsidium<'resize'>) => void;
	intersect: (this: T, entry: IntersectionObserverEntry[], obs: Obsidium<'intersection'>) => void;
}

export type Obsidium<T extends keyof typeof Obsidium = keyof typeof Obsidium> = ReturnType<(typeof Obsidium)[T]>;
export type Obsidia = All<ObserverType>;
// export type Obsidia = ReturnType<typeof Obsidia>;
// export type Obsidia<T extends ObserverType = ObserverType> = All<T>;

// tuple type: [<Obs.entry>, <wrapper class>, <on.keys>] // oddly can't start with ResizeObserver
type ByObs<T extends ObserverType | undefined> = T extends IntersectionObserver
	? [IntersectionObserverEntry[], Intersection, 'intersect']
	: T extends ResizeObserver
		? [ResizeObserverEntry[], Resize, 'resize']
		: T extends MutationObserver
			? [MutationRecord[], Mutation, 'add' | 'attr' | 'mutate' | 'remove']
			: [never, Obsidium, never];

// -----------------------------------------------------------------------------------------------------
// unit test

if (process?.env.NODE_ENV === 'test') {
	// @ts-expect-error (2339): does not exist
	All.prototype.getObservers = function (
		at?: number
	): Mutation | Resize | Intersection | (Mutation | Resize | Intersection)[] {
		const o: Any = [];
		// @ts-expect-error (2339): does not exist
		this.o.forEach(x => {
			o.push(x);
		});

		return at === undefined ? o : o.at(at);
	};
}

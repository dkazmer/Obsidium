/**
 * Declarative wrapper functions for the JS observers:
 * - {@linkcode Obsidium.mutation|mutation} _MutationObserver_
 * - {@linkcode Obsidium.resize|resize} _ResizeObserver_
 * - {@linkcode Obsidium.intersection|intersection} _IntersectionObserver_
 * @summary Created to encourage greater use of these high-value JS utilities,
 * as they're vastly underused and unknown, largely due to their complex implementation strategy.
 * @author Daniel B. Kazmer
 * @version 1.0.0
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
	 * Obsidium.intersection(element).on('intersect', myCallback);
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
	 * Obsidium.resize(element).on('resize', myCallback);
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
	 *   .on('add', myCallbackAdd)
	 *   .on('remove', myCallbackRmv);
	 */
	export function mutation(target: Node, settings?: MutationObserverInit) {
		return new Mutation(target, settings);
	}
}

// -----------------------------------------------------------------------------------------------------
// classes

abstract class Observer<
	T extends MutationObserver | ResizeObserver | IntersectionObserver,
	OnKeys extends keyof Notify
> {
	#isSuspended = true;

	protected notify: { [K in OnKeys]?: Notify[K] } = {};
	protected observer!: T;
	public type = '';

	constructor(
		private target: T extends MutationObserver ? Node : Element,
		private settings?: MutationObserverInit
	) {
		resolve('Safe to invoke sub class methods').then(() => {
			this.type = this.observer.constructor.name;
			// this.resume();
		});
	}

	/**
	 * `resume` (explicit)
	 * @summary resume a suspended observer
	 */
	public resume() {
		if (this.#isSuspended === false) {
			console.warn('Observer is already running...');
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
			console.warn('Observer is already suspended...');
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
		this.observer.disconnect();

		for (const prop in this) {
			Object.hasOwn(this, prop) && delete this[prop];
		}
	}

	/**
	 * `on`
	 * @summary subscription method, with accurate intellisense; examples in parent class/fn
	 */
	public on<K extends OnKeys>(name: K, fn: Exclude<Notify[K], undefined>) {
		this.notify[name] = (...e: any[]) => fn.call(this, ...e);
		return this;
	}
}

class Intersection extends Observer<IntersectionObserver, Extract<keyof Notify, 'intersect'>> {
	constructor(target: Element, settings?: IntersectionObserverInit) {
		super(target);

		this.observer = new IntersectionObserver(
			entries => {
				for (const entry of entries) {
					this.notify.intersect?.(entry);
				}
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

class Resize extends Observer<ResizeObserver, Extract<keyof Notify, 'resize'>> {
	constructor(target: Element) {
		super(target);

		this.observer = new ResizeObserver(entries => {
			for (const entry of entries) {
				this.notify.resize?.(entry);
			}
		});

		this.resume();
	}
}

class Mutation extends Observer<MutationObserver, keyof Omit<Notify, 'resize' | 'intersect'>> {
	constructor(target: Node, settings?: MutationObserverInit) {
		super(target, settings);

		this.observer = new MutationObserver((list, obs) => {
			for (const mutation of list) {
				switch (mutation.type) {
					// biome-ignore format: compact
					case 'childList': {
						const { addedNodes, removedNodes } = mutation;
						addedNodes.length && this.notify.add?.(addedNodes);
						removedNodes.length && this.notify.remove?.(removedNodes);
						(addedNodes.length || removedNodes.length) && this.notify.mutate?.(addedNodes, removedNodes)
					} break;

					// biome-ignore format: compact
					case 'attributes': {
						const { target: t, attributeName } = mutation;
						this.notify.attr?.({ attribute: attributeName, target: t });
					}
				}
			}
		});

		this.resume();
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

// -----------------------------------------------------------------------------------------------------
// types

interface Notify<T = void> {
	attr?: Fn<T, { attribute: string | null; target: Node }>;
	add?: Fn<T, NodeList>;
	remove?: Fn<T, NodeList>;
	mutate?: (added: NodeList, removed: NodeList) => T;
	resize?: Fn<T, ResizeObserverEntry>;
	intersect?: Fn<T, IntersectionObserverEntry>;
}

type Fn<T = void, U = any> = (...args: U[]) => T;
type FnNames = 'mutation' | 'resize' | 'intersection';
export type Obsidium = ReturnType<(typeof Obsidium)[FnNames]>;
// export type Obsidium<T extends FnNames = FnNames> = ReturnType<(typeof Obsidium)[T]>;
// export type Obsidium = InstanceType<(typeof Obsidium)['mutation' | 'resize' | 'intersection']>;
/* type GetParam<Type> = Type extends Fn<any, infer X>
	? X
	: Type extends (p: infer Y) => any
		? Y
		: never; */

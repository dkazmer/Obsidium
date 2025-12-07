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
	 * resume
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
	 * suspend
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
	 * kill
	 */
	public kill() {
		this.observer.disconnect();

		for (const prop in this) {
			Object.hasOwn(this, prop) && delete this[prop];
		}
	}

	/**
	 * on
	 */
	public on(name: OnKeys, fn: Fn) {
		this.notify[name] = (e: any) => fn.call(this, e);
		return this;
	}
}

/**
 * Intuitive wrapper class for the JS observers:
 * - {@linkcode Obsidium.mutation|mutation} _MutationObserver_
 * - {@linkcode Obsidium.resize|resize} _ResizeObserver_
 * - {@linkcode Obsidium.intersection|intersection} _IntersectionObserver_
 * @summary Created to encourage greater use of these high-value JS utilities,
 * as they're vastly underused and unknown, largely for their complex implementation.
 * @author Daniel B. Kazmer
 * @version 1.0.0
 */
export namespace Obsidium {
	/**
	 * Intuitive wrapper class for `IntersectionObserver`. Controls:
	 * - {@linkcode Observer.suspend|.suspend()}
	 * - {@linkcode Observer.resume|.resume()}
	 * - {@linkcode Observer.kill|.kill()}
	 * @author Daniel B. Kazmer
	 * @version 1.0.0
	 * @example
	 * const obsidI = new Obsidium.intersection(element)
	 *    .on('intersect', myCallback);
	 */
	export class intersection extends Observer<IntersectionObserver, Extract<keyof Notify, 'intersect'>> {
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

	/**
	 * Intuitive wrapper class for `ResizeObserver`. Controls:
	 * - {@linkcode Observer.suspend|.suspend()}
	 * - {@linkcode Observer.resume|.resume()}
	 * - {@linkcode Observer.kill|.kill()}
	 * @author Daniel B. Kazmer
	 * @version 1.0.0
	 * @example
	 * const obsidR = new Obsidium.resize(element)
	 *    .on('resize', myCallback);
	 */
	export class resize extends Observer<ResizeObserver, Extract<keyof Notify, 'resize'>> {
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

	/**
	 * Intuitive wrapper class for `MutationObserver`. Controls:
	 * - {@linkcode Observer.suspend|.suspend()}
	 * - {@linkcode Observer.resume|.resume()}
	 * - {@linkcode Observer.kill|.kill()}
	 * @author Daniel B. Kazmer
	 * @version 1.0.0
	 * @example
	 * const obsidM = new Obsidium.mutation(scopeElement)
	 *    .on('added', myCallbackAdd)
	 *    .on('removed', myCallbackRmv);
	 */
	export class mutation extends Observer<MutationObserver, keyof Omit<Notify, 'resize'>> {
		constructor(target: Node, settings?: MutationObserverInit) {
			super(target, settings);

			this.observer = new MutationObserver((list, obs) => {
				for (const mutation of list) {
					switch (mutation.type) {
						// biome-ignore format: compact
						case 'childList': {
							const { addedNodes, removedNodes } = mutation;
							addedNodes.length && this.notify.added?.(addedNodes);
							removedNodes.length && this.notify.removed?.(removedNodes);
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
}

/**
 * Prevents sub class prop assignments before their "registration" proper.
 * Seems to take precedence over a time-out.
 * @returns a promise
 */
export function resolve<T = string>(msg: T) {
	return new Promise<T>(res => res(msg));
}

interface Notify<T = void> {
	attr?: Fn<T, { attribute: string | null; target: Node }>;
	added?: Fn<T, NodeList>;
	removed?: Fn<T, NodeList>;
	resize?: Fn<T, ResizeObserverEntry>;
	intersect?: Fn<T, IntersectionObserverEntry>;
}

type Fn<T = void, U = any> = (...args: U[]) => T;
export type Obsidium = InstanceType<(typeof Obsidium)['mutation' | 'resize' | 'intersection']>;

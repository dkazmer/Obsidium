abstract class Observer<
	T extends MutationObserver | ResizeObserver | IntersectionObserver,
	OnKeys extends keyof Notify
> {
	#isSuspended = true;

	protected notify: Notify = {};
	protected observer!: T;
	public type = '';

	constructor(
		private target: T extends MutationObserver ? Node : Element,
		private settings?: MutationObserverInit
	) {
		resolve('Safe to invoke sub class methods').then(() => {
			this.type = this.observer.constructor.name; // as typeof this.type;
			// this.restart();
		});
	}

	/**
	 * restart
	 */
	public restart() {
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
 * - {@linkcode Obsidian.mutation|mutation} _MutationObserver_
 * - {@linkcode Obsidian.resize|resize} _ResizeObserver_
 * - {@linkcode Obsidian.intersection|intersection} _IntersectionObserver_
 * @summary Created to encourage greater use of these high-value JS utilities,
 * as they're vastly underused and unknown, largely for their complex implementation.
 * @author Daniel B. Kazmer
 * @version 1.0.0
 */
export namespace Obsidian {
	/**
	 * Intuitive wrapper class for `ResizeObserver`. Controls:
	 * - {@linkcode Observer.suspend|.suspend()}
	 * - {@linkcode Observer.restart|.restart()}
	 * - {@linkcode Observer.kill|.kill()}
	 * @author Daniel B. Kazmer
	 * @version 1.0.0
	 * @example
	 * const obsidR = new Obsidian.resize(element)
	 *    .on('resize', myCallback);
	 */
	export class resize extends Observer<ResizeObserver, Extract<keyof Notify, 'resize'>> {
		constructor(target: Element) {
			super(target);

			this.observer = new ResizeObserver(entries => {
				for (const entry of entries) {
					if (entry.contentBoxSize) {
						// const contentBoxSize = entry.contentBoxSize[0];
						console.log('>> contentBoxSize', entry.contentBoxSize);
					} else {
						console.log('>> borderBoxSize', entry.borderBoxSize);
					}
					console.log('>> resized?', entry);
					this.notify.resize?.(entry);
				}
			});

			this.restart();
		}
	}

	/**
	 * Intuitive wrapper class for `MutationObserver`. Controls:
	 * - {@linkcode Observer.suspend|.suspend()}
	 * - {@linkcode Observer.restart|.restart()}
	 * - {@linkcode Observer.kill|.kill()}
	 * @author Daniel B. Kazmer
	 * @version 1.0.0
	 * @example
	 * const obsidM = new Obsidian.mutation(scopeElement)
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

			this.restart();
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
}

type Fn<T = void, U = any> = (...args: U[]) => T;
export type Obsidian = InstanceType<(typeof Obsidian)['mutation' | 'resize']>;

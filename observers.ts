export class Observer {
    #observer: MutationObserver;
    #notify: Notify = {};
    #isSuspended = true;

    constructor(private target: Node, private settings?: MutationObserverInit) {
        this.#observer = new MutationObserver((list, obs) => {
            for (const mutation of list) {
                if (mutation.type === "childList") {
                    console.log("A child node has been added or removed.", mutation);
                    this.#notify.added?.(mutation);
                } else if (mutation.type === "attributes") {
                    console.log(`The ${mutation.attributeName} attribute was modified.`, mutation);
                }
            }
        })

        this.restart()
    }

    /**
     * restart
     */
    public restart() {
        if (this.#isSuspended === false) {
            console.warn('Observer is already running...')
            return
        }

        this.#observer.observe(this.target, { attributes: true, childList: true, subtree: true, ...this.settings })
        this.#isSuspended = false
    }

    /**
     * suspend
     */
    public suspend() {
        if (this.#isSuspended === true) {
            console.warn('Observer is already suspended...')
            return
        }

        this.#observer.disconnect();
        this.#isSuspended = true;
    }

    /**
     * kill
     */
    public kill() {
        this.suspend();

        for (const prop in this) {
            Object.hasOwn(this, prop) && delete this[prop];
        }
    }

    /**
     * on
     */
    public on(name: keyof Notify, fn: Fn) {
        this.#notify[name] = (e: any) => fn.call(this, e);
        return this;
    }
}

interface Notify<T = void> {
    attr?: Fn<T, MutationRecord>;
    added?: Fn<T, MutationRecord>;
    removed?: Fn<T, MutationRecord>;
}

type Fn<T = void, U = any> = (...args: U[]) => T;
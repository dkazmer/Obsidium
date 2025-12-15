import type { Mock } from 'vitest/dist/index';
import { Obsidium } from './obsidium';

const mockMethods = {
	mo<T extends NodeList | MoAttr>(_arg: T) {
		return 'mutated!';
	},
	ro(_entry: ResizeObserverEntry) {
		return 'resized!';
	},
	io(_entry: IntersectionObserverEntry) {
		return 'intersected!';
	}
};

describe('Mutation Observer', () => {
	const elem = mockDOM();
	const mo = Obsidium.mutation(elem);

	const { promise: p1, resolve: res1 } = Promise.withResolvers<NodeList>();
	const { promise: p2, resolve: res2 } = Promise.withResolvers<MoAttr>();

	Promise.allSettled([p1, p2]).finally(() => {
		setTimeout(() => mo.dump(), 0);
		document.body.removeChild(elem);
	});

	it('should create', () => {
		expect<Obsidium>(mo).toBeTruthy();
	});

	it('should indicate a mutation: add', async () => {
		const spy = vi.spyOn(mockMethods, 'mo');

		p1.then(nodes => {
			expect<Mock>(spy).toHaveBeenCalledExactlyOnceWith<NodeList[]>(nodes);
			expect<Node>(nodes[0]!).toBe<Node>(elem.childNodes[0]!);
			spy.mockClear();
		});

		mo.on('add', added => {
			mockMethods.mo(added);
			res1(added);
		});

		mockDOM(elem);
		return p1;
	});

	it('should indicate a mutation: attr', async () => {
		const spy = vi.spyOn(mockMethods, 'mo');

		p2.then(obj => {
			expect<Mock>(spy).toHaveBeenCalledExactlyOnceWith<MoAttr[]>(obj);
			expect<Node>(obj.target).toBe<Node>(elem);
			spy.mockClear();
		});

		mo.on('attr', obj => {
			mockMethods.mo(obj);
			res2(obj);
		});

		elem.id = 'test';
		return p2;
	});

	const spy = vi.spyOn(console, 'warn').mockImplementation(vi.fn());

	it('should warn that specific notifier already exists', () => {
		mo.on('mutate', vi.fn());
		mo.on('mutate', vi.fn());
		expect<Mock>(spy).toHaveBeenCalledOnce();
		spy.mockClear();
	});

	it('should warn that generic notifier already exists', () => {
		mo.subscribe(vi.fn());
		mo.subscribe(vi.fn());
		expect<Mock>(spy).toHaveBeenCalledOnce();
		spy.mockClear();
	});
});

describe('Resize Observer', () => {
	const elem = mockDOM();
	const ro = Obsidium.resize(elem);

	it('should create', () => {
		expect<Obsidium>(ro).toBeTruthy();
	});

	it.skip('should indicate a resize', async () => {
		const spy = vi.spyOn(mockMethods, 'ro');

		return new Promise<ResizeObserverEntry>(res => {
			ro.on('resize', entry => {
				mockMethods.ro(entry);
				res(entry);
				setTimeout(() => ro.dump(), 0);
				// ro.suspend();
				document.body.removeChild(elem);
			});

			elem.style.height = '25px';
		}).then(entry => {
			expect<Mock>(spy).toHaveBeenCalledExactlyOnceWith<ResizeObserverEntry[]>(entry);
		});
	});

	it('should suspend instance', () => {
		const spy = vi.spyOn(ro, 'suspend');
		ro.suspend();
		expect<Mock>(spy).toHaveBeenCalledOnce();
	});

	it('should toggle instance state', () => {
		const spy = vi.spyOn(ro, 'toggle');
		ro.toggle();
		expect<Mock>(spy).toHaveBeenCalledOnce();
	});
});

describe('Intersection Observer', () => {
	const elem = mockDOM();
	const io = Obsidium.intersection(elem);

	it('should create', () => {
		expect<Obsidium>(io).toBeTruthy();
	});

	it.skip('should indicate an intersection', async () => {
		const spy = vi.spyOn(mockMethods, 'io');

		return new Promise<IntersectionObserverEntry>(res => {
			io.on('intersect', entry => {
				mockMethods.io(entry);
				res(entry);
				setTimeout(() => io.dump(), 0);
				// io.suspend();
				document.body.removeChild(elem);
			});

			// elem.style.height = '25px';
		}).then(entry => {
			expect<Mock>(spy).toHaveBeenCalledExactlyOnceWith<IntersectionObserverEntry[]>(entry);
		});
	});
});

function mockDOM(container?: HTMLElement) {
	const div = document.createElement('div');
	container ? container.append(div) : document.body.append(div);
	return div;
}

type MoAttr = { attribute: string | null; target: Node };

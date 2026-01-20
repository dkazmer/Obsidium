/** biome-ignore-all lint/suspicious/noConsole: test bed */
import { Mutation, Obsidium } from './obsidium';

const { resize } = Obsidium;

window.mo = new Mutation(document.body)
	.on('add', nodes => console.log('>> added!', nodes))
	.on('remove', nodes => console.log('>> removed!', nodes))
	.on('mutate', nodes => console.log('>> removed!', nodes))
	// .on('mutate', (added, removed) => console.log('>> mutated!', added, removed))
	.on('attr', ({ attribute, target }) => console.log('>> attr!', attribute, target));

window.ro = resize(document.body).on('resize', ([ent]) => console.log('>> resized!', ent!.contentBoxSize));

window.io = Obsidium.intersection(document.body).on('intersect', function ([ent], _obs) {
	console.log('>> intersected!', ent!.isIntersecting, this.dump);
});

declare global {
	var mo: Obsidium;
	var ro: Obsidium;
	var io: Obsidium<IntersectionObserver>;

	var multi: Obsidium<ResizeObserver>;
	// var multi2: Obsidia;
}

/* window.mo.on('add', entry => {
	console.log('>> entry', entry);
});

window.ro.subscribe(function (entry) {
	console.log('>> entry', entry, this.dump);
}); */

/* window.ro.subscribe(entry => {
	console.log('>>> entry', entry);
});
 */

window.multi = Obsidium<ResizeObserver | IntersectionObserver>(document.body)
	.on('intersect', ([ent]) => {
		console.log('>> Obsidia: intersect', ent!.boundingClientRect);
	})
	.on('resize', ([ent], _obs) => {
		console.log('>> Obsidia: resize', ent!.contentBoxSize);
	});

declare global {
	namespace NodeJS {
		interface ProcessEnv {
			NODE_ENV: 'development' | 'production' | 'test';
		}
	}
}

import { Mutation, Obsidia, Obsidium } from './obsidium';

const { resize, intersection } = Obsidium;

window.mo = new Mutation(document.body)
	.on('add', nodes => console.log('>> added!', nodes))
	.on('remove', nodes => console.log('>> removed!', nodes))
	.on('mutate', nodes => console.log('>> removed!', nodes))
	// .on('mutate', (added, removed) => console.log('>> mutated!', added, removed))
	.on('attr', ({ attribute, target }) => console.log('>> attr!', attribute, target));

window.ro = resize(document.body).on('resize', ([ent]) => console.log('>> resized!', ent!.contentBoxSize));

window.io = intersection(document.body).on('intersect', function ([ent], _obs) {
	console.log('>> intersected!', ent!.isIntersecting, this.dump);
});

declare global {
	var mo: Obsidium;
	var ro: Obsidium;
	var io: Obsidium<'intersection'>;

	var multi: Obsidia;
	var multi2: Obsidia;
}

window.mo.on('add', entry => {
	console.log('>> entry', entry);
});

window.ro.subscribe(function (entry) {
	console.log('>> entry', entry, this.dump);
});

/* window.ro.subscribe(entry => {
	console.log('>>> entry', entry);
});
 */

window.multi = Obsidia<ResizeObserver>(document.body)
	// .on('add', (added, removed) => {
	// 	console.log('>> Obsidia: mutate', added, removed);
	// })
	.on('resize', ([ent]) => {
		console.log('>> Obsidia: resize', ent!.contentBoxSize);
	});

window.multi2 = Obsidia<ResizeObserver>(document.body).on('resize', ([ent]) => {
	console.log('>> Obsidia: resize', ent!.contentBoxSize);
});

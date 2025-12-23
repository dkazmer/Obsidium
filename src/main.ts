import { Obsidium } from './obsidium';

const { resize, mutation, intersection } = Obsidium;

window.mo = mutation(document.body)
	.on('add', nodes => console.log('>> added!', nodes))
	.on('remove', nodes => console.log('>> removed!', nodes))
	// .on('mutate', (added, removed) => console.log('>> mutated!', added, removed))
	.on('attr', ({ attribute, target }) => console.log('>> attr!', attribute, target));

window.ro = resize(document.body).on('resize', ({ contentBoxSize }) => console.log('>> resized!', contentBoxSize));

window.io = intersection(document.body).on('intersect', function ({ isIntersecting }, _obs) {
	console.log('>> intersected!', isIntersecting, this.dump);
});

declare global {
	var mo: Obsidium;
	var ro: Obsidium;
	var io: Obsidium<'intersection'>;
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

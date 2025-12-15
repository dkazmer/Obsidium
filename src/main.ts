import { Obsidium } from './obsidium';

window.mo = Obsidium.mutation(document.body)
	.on('add', nodes => console.log('>> added!', nodes))
	.on('remove', nodes => console.log('>> removed!', nodes))
	// .on('mutate', (added, removed) => console.log('>> mutated!', added, removed))
	.on('attr', ({ attribute, target }) => console.log('>> attr!', attribute, target));

window.ro = Obsidium.resize(document.body).on('resize', ({ contentBoxSize }) =>
	console.log('>> resized!', contentBoxSize)
);

window.io = Obsidium.intersection(document.body).on('intersect', ({ isIntersecting }) =>
	console.log('>> intersected!', isIntersecting)
);

declare global {
	var mo: Obsidium;
	var ro: Obsidium;
	var io: Obsidium<'intersection'>;
}

window.mo.on('add', entry => {
	console.log('>> entry', entry);
});

window.ro.subscribe(entry => {
	console.log('>> entry', entry);
});

/* window.ro.subscribe(entry => {
	console.log('>>> entry', entry);
});
 */

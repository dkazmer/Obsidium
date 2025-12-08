import { Obsidium } from './observers';

window.mo = Obsidium.mutation(document.body)
	.on('add', x => console.log('>> added!', x))
	.on('remove', y => console.log('>> removed!', y))
	.on('attr', ({ attribute, target }) => console.log('>> attr!', attribute, target));

window.ro = Obsidium.resize(document.body).on('resize', x => console.log('>> resized!', x));

window.io = Obsidium.intersection(document.body).on('intersect', x => console.log('>> intersected!', x));

declare global {
	var mo: Obsidium;
	var ro: Obsidium;
	var io: Obsidium;
}

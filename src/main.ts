import { Obsidium } from './observers';

window.mo = new Obsidium.mutation(document.body)
	.on('added', x => console.log('>> added!', x))
	.on('removed', y => console.log('>> remved!', y))
	.on('attr', z => console.log('>> attr!', z));

window.ro = new Obsidium.resize(document.body).on('resize', x => console.log('>> resized!', x));

window.io = new Obsidium.intersection(document.body).on('intersect', x => console.log('>> intersected!', x));

declare global {
	var mo: Obsidium;
	var ro: Obsidium;
	var io: Obsidium;
}

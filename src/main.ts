import { Obsidian } from './observers';

window.mo = new Obsidian.mutation(document.body)
	.on('added', x => console.log('>> added!', x))
	.on('removed', y => console.log('>> remved!', y))
	.on('attr', z => console.log('>> attr!', z));

window.ro = new Obsidian.resize(document.body).on('resize', x => console.log('>> resized!', x));

declare global {
	var mo: Obsidian;
	var ro: Obsidian;
}

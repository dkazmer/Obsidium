// biome-ignore-all lint/suspicious/noConsole: Bun
// @ts-expect-error: Module '"*.html"' can only be default-imported using the 'allowSyntheticDefaultImports' flag
import homepage from './index.html';

Bun.env.NODE_ENV = 'development';

const server = Bun.serve({
	port: 5500,
	// fetch(_req: Request) {
	// 	// return new Response('hello!', _req);
	// 	return new Response(Bun.file('./index.html'));
	// }
	routes: {
		'/': homepage
	}
	// development: {}
});

console.log('>> Listening on', server.url.href);

import { db, Users, Sites, Pages } from 'astro:db';

export default async function seed() {
	await db.insert(Users).values([
		{ id: '1', firstName: 'Mary'},
		{ id: '2', firstName: 'John'},
	])
	await db.insert(Sites).values([
		{ id: 1, userId: '1', subdomain:'mary'},
		{ id: 2, userId: '2', subdomain:'john'},
	])
	await db.insert(Pages).values([
		{ id: 1, siteId: 1, userId: '1', slug: null, title: 'Mary Home', json: '{"type":"doc","content":[{"type":"paragraph","content":[{"type":"text","text":"Hello 👋"}]}]}', html: '<h2>This is some sample html</h2>'},
		{ id: 2, siteId: 2, userId: '2', slug:'', title: 'John Home', json: '{"type":"doc","content":[{"type":"paragraph","content":[{"type":"text","text":"Hello 👋"}]}]}', html: '<h2>This is some sample html</h2>'},
		{ id: 3, siteId: 1, userId: '1', slug:'about', title: 'About Mary', json: '{"type":"doc","content":[{"type":"paragraph","content":[{"type":"text","text":"Hello 👋"}]}]}', html: '<h2>This is some sample html</h2>'},
		{ id: 4, siteId: 2, userId: '2', slug:'about', title: 'About John', json: '{"type":"doc","content":[{"type":"paragraph","content":[{"type":"text","text":"Hello 👋"}]}]}', html: '<h2>This is some sample html</h2>'},
		{ id: 5, siteId: 1, userId: '1', slug:'lp/up', title: '2nd level page', json: '{"type":"doc","content":[{"type":"paragraph","content":[{"type":"text","text":"Hello 👋"}]}]}', html: '<h2>This is some sample html</h2>'},
	])
}

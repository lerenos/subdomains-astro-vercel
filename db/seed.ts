import { db, Users, Sites, Pages } from 'astro:db';

export default async function seed() {
	await db.insert(Users).values([
		{ id: 1, name: 'Mary'},
		{ id: 2, name: 'John'},
	])
	await db.insert(Sites).values([
		{ id: 1, userId: 1, subdomain:'mary'},
		{ id: 2, userId: 2, subdomain:'john'},
	])
	await db.insert(Pages).values([
		{ id: 1, siteId: 1, userId: 1, slug: null, title: 'Mary Home', body: '{"component":"section"}'},
		{ id: 2, siteId: 2, userId: 2, slug:'', title: 'John Home', body: '{"component":"section"}'},
		{ id: 3, siteId: 1, userId: 1, slug:'about', title: 'About Mary', body: '{"component":"section"}'},
		{ id: 4, siteId: 2, userId: 2, slug:'about', title: 'About John', body: '{"component":"section"}'},
		{ id: 5, siteId: 1, userId: 1, slug:'lp/up', title: '2nd level page', body: '{"component":"section"}'},
	])
}

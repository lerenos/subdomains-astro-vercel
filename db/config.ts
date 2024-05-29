import { defineDb, defineTable, column } from 'astro:db';

const Users = defineTable({
	columns: {
		id: column.text({ primaryKey: true }),
		firstName: column.text(),
	}
});
  
const Sites = defineTable({
	columns: {
		id: column.number({ primaryKey: true }),
		userId: column.text({ references: () => Users.columns.id }),
		subdomain: column.text({ unique: true }),
	}
});

const Pages = defineTable({
	columns: {
		id: column.number({ primaryKey: true }),
		userId: column.text({ references: () => Users.columns.id }),
		siteId: column.number({ references: () => Sites.columns.id }),
		slug: column.text({optional: true}),
		title: column.text(),
		json: column.json({optional: true}),
		html: column.text({optional: true}),
	}
}) ;

export default defineDb({
  tables: { Users, Sites, Pages },
})

/* 
Constraints:
 - [✓] - Subdomains must be unique
 - [✓] - UserId is never defined by the user. It is an identifier from authorization. - Never use as input ✓
 - [ ] - The combination of subdomain and slug must be unique (a slug must be unique for the same subdomain) - I think this is possible... via index? For now, I'll just validate on the input
 - [ ] - A Pages.siteId can only be inserted if Pages.userId==Sites.userId. UserId comes from User.id.
        [ ] - Input validation: [ ] - Select siteId value from a list where Sites.userId==Pages.userId - to do, but it is easy
						  		[ ] - Try to enforce this rule on inserting a new database row - is it possible?		
		[✓] - Output validation: when generating a page array, check if x.Pages.userId === x.Sites.userId - ✓
*/ 
import type { APIRoute } from "astro";
import { db, eq, and, Users, Sites, Pages } from "astro:db";

let user = ( await db.select().from(Users).where(eq(Users.id, 1)) )[0] //Get the user.id
// let site = ( await db.select().from(Sites).where(and(eq(Sites.userId, user.id),eq(Sites.subdomain, subdomain))) )[0] //Get site.id

export const POST: APIRoute = async ({ request, params }) => {

    const { id } = params

    const data = await request.formData();

    const slug = data.get("slug");
    const title = data.get("title");
    const body = data.get("body");
    // Validate the data - you'll probably want to do more than this
    if (!slug || !title || !body) {
      return new Response(
        JSON.stringify({
          message: "Missing required fields",
        }),
        { status: 400 }
      );
    }

    const res = await db.update(Pages)
    .set({slug, title, body })
    .where(and(
        eq(Pages.id, id),
        // eq(Pages.siteId, site.id),
        eq(Pages.userId, user.id)) //Verify logged user
    ).returning({ updatedSlug: Pages.slug });

    // const res = await db.insert(Pages)
    // .values({id, userId:user.id, slug, title, body })
    // .returning({ updatedSlug: Pages.slug });

    return new Response(JSON.stringify({res}),
      { status: 200 }
    );
  };

export const DELETE: APIRoute = async (ctx) => {
    const { id } = ctx.params
    await db.delete(Pages).where(and(
        eq(Pages.id, id),
        // eq(Pages.siteId, site.id),
        eq(Pages.userId, user.id)) //Verify logged user
    );
    return new Response(null, { status: 204 });
}
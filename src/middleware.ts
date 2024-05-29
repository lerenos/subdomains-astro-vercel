import { sequence } from "astro:middleware";
import { clerkMiddleware, createRouteMatcher } from "astro-clerk-auth/server";
import { db, eq, and, Users, Sites, Pages } from "astro:db";
import { User } from "lucide-react";

const subdomainRoute = async (context, next) => {

    const url = context.url   
    const hostnameParts = url.hostname.split(".").reverse()
    const rootDomain = hostnameParts[0]
    const subdomain = hostnameParts[1]

    if(subdomain  
        && !context.request.headers.has("X-Astro-Rewrite")
        && !url.pathname.startsWith('/_astro')
    ){
        let sourceURL = url
        sourceURL.hostname=rootDomain
        sourceURL.pathname=subdomain+url.pathname

        let modifiedRequest = context.request
        modifiedRequest.headers.set("X-Astro-Rewrite","true")

        // rewrite(sourceURL, { ...modifiedRequest})
        /*
        As Astro don't have a rewrite method (or the proposed "reroute"), this is the workaround. Note that 404 deserves special attention, since it has an infinite loop bug.
        */

        const newRequest = new Request(sourceURL, { ...modifiedRequest})

        let res = await fetch(newRequest)

        if (res.status == 404){
            let redirect404 = sourceURL

            if (url.pathname.includes("favicon")){
                redirect404.pathname = "/favicon.svg"//context.url.pathname
                return fetch(redirect404, {
                    headers : {
                        "X-Astro-Rewrite" : "true"
                    }
                })
            } //The bright side of this workaround: you can choose how to deal with some 404s.

            redirect404.pathname = "/404"
            Response.redirect(redirect404) //It doens't cause an infinite loop, but it is a redirect.
                    
            // We could grab the content of the root 404.html, or maybe just retun it, but it causes an infinite loop.
            // return fetch(redirect404, {
            //     headers : {
            //         "X-Astro-Rewrite" : "true"
            //     }
            // })
                        
            // Sending a 404 status makes an infinite loop. This bug is known by astro team, and is yet to be solved (Implicit routing)
            // return new Response(null,{
            //     status: 404,
            //     headers : {
            //         "X-Astro-Rewrite" : "true"
            //     }
            // })

        } else {
            return res
        }
        /* End of the Astro workaround */
    } 

    return next()
    // next({headers: { 'x-from-middleware': 'true' }})
}

const isProtectedPage = createRouteMatcher(['/app(.*)'])

const authClerk = clerkMiddleware(async (auth, context, next) => {
    if (isProtectedPage(context.request) && !auth().userId) {
        return auth().redirectToSignIn();
    } else if (isProtectedPage(context.request) && auth().userId) {

        let clerkUser = await context.locals.currentUser()
        let UserId = clerkUser?.id

        let user = (await db.select().from(Users).where(eq(Users.id, UserId)))[0] // Check if user exists on site database

        if (!user) {
            // News user on site database 
            await db.insert(Users).values({
                id: UserId,
                firstName: clerkUser?.firstName 
            });

            // Insert example site and pages
            console.log("Inserting example site and pages...");
            const exampleSite = await db.insert(Sites).values({
                userId: UserId,
                subdomain: 'test' //verify first
            }).returning({siteId: Sites.id});
            await db.insert(Pages).values([
                { siteId: exampleSite[0].siteId, userId: UserId, slug: null, title: 'Home', json: '{"component":"section"}', html: '<h2>This is some sample html</h2>'},
                { siteId: exampleSite[0].siteId, userId: UserId, slug:'about', title: 'About', json: '{"component":"section"}', html: '<h2>This is some sample html</h2>'},
            ]);
            // End of inserting example site and pages
        }
    }
    
    return next();
  });


// export const onRequest = sequence(subdomainRoute)
// export const onRequest = sequence(authClerk,subdomainRoute)
export const onRequest = sequence(subdomainRoute,authClerk)



// export const config = {
//   matcher: [
//     /*
//      * Match all paths except for:
//      * 1. /api routes
//      * 2. /_astro (Next.js internals)
//      * 3. /_static (inside /public)
//      * 4. all root files inside /public (e.g. /favicon.ico)
//      */
//     "/((?!api/|_astro/|_static/|_vercel|[\\w-]+\\.\\w+).*)",
//   ],
// };

// export default async function middleware(req: NextRequest) {
//   const url = req.nextUrl;

//   // Get hostname of request (e.g. demo.vercel.pub, demo.localhost:3000)
//   let hostname = req.headers
//     .get("host")!
//     .replace(".localhost:3000", `.${process.env.NEXT_PUBLIC_ROOT_DOMAIN}`);

//   // special case for Vercel preview deployment URLs
//   if (
//     hostname.includes("---") &&
//     hostname.endsWith(`.${process.env.NEXT_PUBLIC_VERCEL_DEPLOYMENT_SUFFIX}`)
//   ) {
//     hostname = `${hostname.split("---")[0]}.${
//       process.env.NEXT_PUBLIC_ROOT_DOMAIN
//     }`;
//   }

//   const searchParams = req.nextUrl.searchParams.toString();
//   // Get the pathname of the request (e.g. /, /about, /blog/first-post)
//   const path = `${url.pathname}${
//     searchParams.length > 0 ? `?${searchParams}` : ""
//   }`;

//   // rewrites for app pages
//   if (hostname == `app.${process.env.NEXT_PUBLIC_ROOT_DOMAIN}`) {
//     const session = await getToken({ req });
//     if (!session && path !== "/login") {
//       return NextResponse.redirect(new URL("/login", req.url));
//     } else if (session && path == "/login") {
//       return NextResponse.redirect(new URL("/", req.url));
//     }
//     return NextResponse.rewrite(
//       new URL(`/app${path === "/" ? "" : path}`, req.url),
//     );
//   }

//   // special case for `vercel.pub` domain
//   if (hostname === "vercel.pub") {
//     return NextResponse.redirect(
//       "https://vercel.com/blog/platforms-starter-kit",
//     );
//   }

//   // rewrite root application to `/home` folder
//   if (
//     hostname === "localhost:3000" ||
//     hostname === process.env.NEXT_PUBLIC_ROOT_DOMAIN
//   ) {
//     return NextResponse.rewrite(
//       new URL(`/home${path === "/" ? "" : path}`, req.url),
//     );
//   }

//   // rewrite everything else to `/[domain]/[slug] dynamic route
//   return NextResponse.rewrite(new URL(`/${hostname}${path}`, req.url));
// }

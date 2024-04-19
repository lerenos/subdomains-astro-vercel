import db from '@astrojs/db';
import { defineConfig } from 'astro/config';
import vercel from "@astrojs/vercel/serverless";
import tailwind from "@astrojs/tailwind";
import sitemap from "@astrojs/sitemap";
import clerk from "astro-clerk-auth";
import { ptBR } from "@clerk/localizations";
import expressiveCode from "astro-expressive-code";

import react from "@astrojs/react";

// https://astro.build/config
export default defineConfig({
  integrations: [clerk({
    afterSignInUrl: "/app/",
    afterSignUpUrl: "/app/",
    localization: ptBR
  }), db(), tailwind(), sitemap(), expressiveCode(), react()],
  output: "server",
  adapter: vercel({
    edgeMiddleware: true
  })
});
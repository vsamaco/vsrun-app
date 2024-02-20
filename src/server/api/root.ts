import { exampleRouter } from "~/server/api/routers/example";
import { createTRPCRouter } from "~/server/api/trpc";
import { runProfileRouter } from "./routers/runProfile";
import { stravaRouter } from "./routers/strava";
import { shoeRotationRouter } from "./routers/shoeRotation";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  example: exampleRouter,
  runProfile: runProfileRouter,
  strava: stravaRouter,
  shoeRotation: shoeRotationRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;

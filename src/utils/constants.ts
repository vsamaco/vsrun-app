export const APP_HOSTNAMES = new Set(["localhost:3000", "localhost"]);
export const API_CACHE_DURATION =
  process.env.NODE_ENV === "production"
    ? ({
        stravaGetActivities: 1000 * 60 * 60, // 1 hr
        stravaGetShoes: 1000 * 60 * 60, // 1 hr
        stravaGetRaces: 1000 * 60 * 60, // 1 hr
      } as const)
    : ({
        stravaGetActivities: 1000 * 60 * 5, //  5 min
        stravaGetShoes: 1000 * 60 * 5, //  5 min
        stravaGetRaces: 1000 * 60 * 5, //  5 min
      } as const);

import {
  NextResponse,
  type NextFetchEvent,
  type NextRequest,
} from "next/server";
import { parse } from "./lib/utils";
import { getToken } from "next-auth/jwt";

export const config = {
  matcher: ["/settings"],
};

export default async function middleware(req: NextRequest) {
  const { domain, path, key } = parse(req);
  const session = await getToken({
    req,
    secret: process.env.NEXTAUTH_SECRET,
    raw: true,
    cookieName: "next-auth.session-token",
  });

  console.log("=== APP MIDDLEWARE === ", { domain, path, key });
  console.log("=== SESSION: ", session);

  if (!session) {
    return NextResponse.redirect(
      new URL(
        `/api/auth/signin/strava?callback=${encodeURI("/settings")}`,
        req.url
      )
    );
  }
  // return AppMiddleware(req);
}

// async function AppMiddleware(req: NextRequest) {}

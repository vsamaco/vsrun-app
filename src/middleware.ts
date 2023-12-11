import { NextResponse, type NextRequest } from "next/server";
import { parse } from "./lib/utils";
import { getToken } from "next-auth/jwt";

export const config = {
  matcher: ["/settings", "/settings/:path*"],
};

export default async function middleware(req: NextRequest) {
  const { path } = parse(req);
  const session = await getToken({
    req,
    secret: process.env.NEXTAUTH_SECRET,
    raw: true,
  });

  if (!session) {
    return NextResponse.rewrite(
      new URL(`/api/auth/signin/strava?callbackUrl=${encodeURI(path)}`, req.url)
    );
  }
}

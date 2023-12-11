import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { type GetServerSidePropsContext } from "next";
import {
  getServerSession,
  type NextAuthOptions,
  type DefaultSession,
  type Session,
  type TokenSet,
} from "next-auth";
import { env } from "~/env.mjs";
import { prisma } from "~/server/db";
import StravaProvider from "next-auth/providers/strava";

/**
 * Module augmentation for `next-auth` types. Allows us to add custom properties to the `session`
 * object and keep type safety.
 *
 * @see https://next-auth.js.org/getting-started/typescript#module-augmentation
 */
declare module "next-auth" {
  interface Session extends DefaultSession {
    user: {
      id: string;
      // ...other properties
      // role: UserRole;
    } & DefaultSession["user"];
  }

  // interface User {
  //   // ...other properties
  //   // role: UserRole;
  // }
}

async function refreshAccessToken(refreshToken: string) {
  const url = "https://www.strava.com/api/v3/oauth/token";

  const response = await fetch(url, {
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      client_id: env.STRAVA_CLIENT_ID,
      client_secret: env.STRAVA_CLIENT_SECRET,
      grant_type: "refresh_token",
      refresh_token: refreshToken,
    }),
    method: "POST",
  });

  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const tokens: TokenSet = await response.json();

  if (!response.ok) throw tokens;

  return tokens;
}

const maybeRefreshSessionToken = async (
  session: Session,
  refreshToken: string | null,
  providerAccountId: string,
  expiresAt: number | null
) => {
  if (!refreshToken || !expiresAt) {
    return;
  }

  if (expiresAt * 1000 < Date.now()) {
    // access token expired, refresh it
    console.log("=== access token expired ===");
    try {
      const tokens = await refreshAccessToken(refreshToken);

      await prisma.account.update({
        data: {
          access_token: tokens.access_token,
          expires_at: tokens.expires_at,
          refresh_token: tokens.refresh_token ?? refreshToken,
        },
        where: {
          provider_providerAccountId: {
            provider: "strava",
            providerAccountId: providerAccountId,
          },
        },
      });
    } catch (error) {
      console.error("error refresh token");
      // session.error = "RefreshAccessTokenError" as const;
    }
  }
};

/**
 * Options for NextAuth.js used to configure adapters, providers, callbacks, etc.
 *
 * @see https://next-auth.js.org/configuration/options
 */
export const authOptions: NextAuthOptions = {
  callbacks: {
    session: async ({ session, user }) => {
      console.log("session auth");
      const [strava] = await prisma.account.findMany({
        where: {
          userId: user.id,
          provider: "strava",
        },
      });

      if (strava) {
        await maybeRefreshSessionToken(
          session,
          strava.refresh_token,
          strava.providerAccountId,
          strava.expires_at
        );
      }

      return {
        ...session,
        user: {
          ...session.user,
          id: user.id,
        },
      };
    },
  },
  adapter: PrismaAdapter(prisma),
  providers: [
    StravaProvider({
      clientId: env.STRAVA_CLIENT_ID,
      clientSecret: env.STRAVA_CLIENT_SECRET,
      authorization: {
        params: {
          scope: "profile:read_all,activity:read",
        },
      },
      token: {
        // address unknown athlete arg
        async request(context) {
          const { client, params, checks, provider } = context;
          const { token_type, expires_at, refresh_token, access_token } =
            await client.oauthCallback(provider.callbackUrl, params, checks);

          return {
            tokens: { token_type, expires_at, refresh_token, access_token },
          };
        },
      },
    }),
    /**
     * ...add more providers here.
     *
     * Most other providers require a bit more work than the Discord provider. For example, the
     * GitHub provider requires you to add the `refresh_token_expires_in` field to the Account
     * model. Refer to the NextAuth.js docs for the provider you want to use. Example:
     *
     * @see https://next-auth.js.org/providers/github
     */
  ],
};

/**
 * Wrapper for `getServerSession` so that you don't need to import the `authOptions` in every file.
 *
 * @see https://next-auth.js.org/configuration/nextjs
 */
export const getServerAuthSession = (ctx: {
  req: GetServerSidePropsContext["req"];
  res: GetServerSidePropsContext["res"];
}) => {
  return getServerSession(ctx.req, ctx.res, authOptions);
};

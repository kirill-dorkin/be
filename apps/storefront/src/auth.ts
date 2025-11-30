import { cookies } from "next/headers";
import NextAuth, { type NextAuthConfig } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { getTranslations } from "next-intl/server";

import { saleorAuthClient } from "@nimara/infrastructure/auth/client";

import { signInSchema } from "@/components/schema";
import { getUserService } from "@/services/user";

import { COOKIE_KEY } from "./config";
import { setAccessToken, setRefreshToken } from "./lib/actions/auth";

export const getAccessToken = async () =>
  (await cookies()).get(COOKIE_KEY.accessToken)?.value;

export const getRefreshToken = async () =>
  (await cookies()).get(COOKIE_KEY.refreshToken)?.value;

export const config = {
  trustHost: true,
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/sign-in",
  },
  callbacks: {
    async jwt({ token, user }) {
      // Initial sign in
      if (user) {
        console.log("[NextAuth] JWT callback - user logged in:", user.email);
        token.user = user;
      }

      return token;
    },
    async session({ session, token }) {
      // Add user data to session
      if (token.user) {
        session.user = token.user as any;
        console.log(
          "[NextAuth] Session callback - session created for:",
          session.user.email,
        );
      }

      return session;
    },
  },
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const t = await getTranslations();

        try {
          const { email, password } = await signInSchema({ t }).parseAsync(
            credentials,
          );

          console.log("[NextAuth] Authorize - attempting login for:", email);

          // @ts-expect-error - Saleor Auth SDK types may not match exactly
          const { data, errors } = await (
            await saleorAuthClient()
          ).signIn({ email, password });

          if (errors?.length) {
            console.error(
              "[NextAuth] Saleor GraphQL API errors:",
              JSON.stringify(errors, null, 2),
            );

            return null;
          }

          if (data?.tokenCreate?.errors.length) {
            console.error(
              "[NextAuth] Token create errors:",
              JSON.stringify(data.tokenCreate.errors, null, 2),
            );

            return null;
          }

          const token = data?.tokenCreate?.token;
          const refreshToken = data?.tokenCreate?.refreshToken;

          if (!token || !refreshToken) {
            console.error(
              "[NextAuth] Missing token or refreshToken in Saleor response",
            );

            return null;
          }

          console.log("[NextAuth] Tokens received, setting cookies");

          const [userService] = await Promise.all([
            getUserService(),
            setAccessToken(token),
            setRefreshToken(refreshToken),
          ]);

          console.log("[NextAuth] Cookies set, fetching user data");

          const resultUserGet = await userService.userGet(token);

          if (!resultUserGet.ok) {
            console.error(
              "[NextAuth] Failed to get user from Saleor:",
              resultUserGet.errors,
            );

            return null;
          }

          const user = resultUserGet.data;

          if (!user) {
            console.error(
              "[NextAuth] User data is null after successful fetch",
            );

            return null;
          }

          console.log(
            "[NextAuth] User successfully authenticated:",
            user.email,
            "| isStaff:",
            user.isStaff,
          );

          // Note: isActive field is not available for regular customers in Saleor
          // Only staff members have this field. Regular customers are active by default
          // if they successfully authenticate with Saleor's tokenCreate

          console.log("[NextAuth] Authorize returning user object");

          return {
            ...user,
          };
        } catch (error) {
          console.error(
            "[NextAuth] Exception during authorization:",
            error instanceof Error ? error.message : String(error),
          );

          return null;
        }
      },
    }),
  ],
} satisfies NextAuthConfig;

export const { auth, handlers, signIn, signOut } = NextAuth(config);
export const update = NextAuth(config).unstable_update;

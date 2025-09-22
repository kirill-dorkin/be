import { NextAuthOptions, getServerSession } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { getUserByEmail } from "@/shared/lib/dbUtils";
import bcrypt from "bcryptjs";
import { connectToDatabase } from "@/shared/lib/dbConnect";
import crypto from "crypto";

declare global {
  // eslint-disable-next-line no-var
  var __authSecret: string | undefined;
}

function resolveAuthSecret(): string {
  if (process.env.NEXTAUTH_SECRET) {
    return process.env.NEXTAUTH_SECRET;
  }

  if (globalThis.__authSecret) {
    return globalThis.__authSecret;
  }

  const fallbackSecret =
    process.env.NODE_ENV === "development"
      ? "development-secret"
      : crypto.randomBytes(32).toString("hex");

  if (process.env.NODE_ENV === "production") {
    console.warn(
      "NEXTAUTH_SECRET is not set. Generated a temporary secret. " +
        "Set NEXTAUTH_SECRET in the environment for stable authentication.",
    );
  }

  globalThis.__authSecret = fallbackSecret;
  return fallbackSecret;
}

const authSecret = resolveAuthSecret();

export const authOptions: NextAuthOptions = {
  secret: authSecret,
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials) return null;
        try {
          await connectToDatabase();
          const user = await getUserByEmail(credentials.email);
          if (!user || !user.passwordHash) {
            return null;
          }
          const isValid = await bcrypt.compare(credentials.password, user.passwordHash);
          if (!isValid) {
            return null;
          }
          return {
            id: user._id.toString(),
            email: user.email,
            name: user.name,
            image: user.image,
            role: user.role,
          };
        } catch (error) {
          console.error("Error during credentials authorize", error);
          return null;
        }
      },
    }),
  ],
  callbacks: {

    async jwt({ token, user }) {
      if (user) {
        token.role = user.role;
        token.image = user.image;
        token.name = user.name;
        token.email = user.email;
        token.id = user.id;
      }
      return token;
    },

    async session({ session, token }) {
      if (token) {
        session.user.role = token.role as string;
        session.user.email = token.email as string;
        session.user.image = token.image as string;
        session.user.name = token.name as string;
        session.user.id = token.id as string;
      }
      return session;
    },
  },
};

export const getSession = async () => {
  try {
    return await getServerSession(authOptions);
  } catch (error) {
    console.error("Failed to retrieve session", error);
    return null;
  }
};

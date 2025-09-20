import { NextAuthOptions, getServerSession } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { getUserByEmail } from "./lib/dbUtils";
import bcrypt from "bcryptjs";
import { connectToDatabase } from "@/lib/dbConnect";

export const authOptions: NextAuthOptions = {
  secret: process.env.NEXTAUTH_SECRET,
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  jwt: {
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  cookies: {
    sessionToken: {
      name: `next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production',
      },
    },
  },
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
      try {
        if (user) {
          token.role = user.role;
          token.image = user.image;
          token.name = user.name;
          token.email = user.email;
          token.id = user.id;
        }
        return token;
      } catch (error) {
        console.error("JWT callback error:", error);
        // Return the original token if there's an error
        return token;
      }
    },

    async session({ session, token }) {
      try {
        if (token && token.email) {
          session.user.role = token.role as string;
          session.user.email = token.email as string;
          session.user.image = token.image as string;
          session.user.name = token.name as string;
          session.user.id = token.id as string;
        }
        return session;
      } catch (error) {
        console.error("Session callback error:", error);
        return session;
      }
    },
  },
  pages: {
    signIn: '/login',
    error: '/login',
  },
  events: {
    async signOut() {
      // Clear any cached session data
    },
  },
  debug: process.env.NODE_ENV === 'development',
};

export const getSession = async () => {
  try {
    return await getServerSession(authOptions);
  } catch (error) {
    console.error("Session retrieval failed:", error);
    return null;
  }
};

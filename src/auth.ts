import { NextAuthOptions, getServerSession } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { getUserByEmail } from "./lib/dbUtils";
import bcrypt from "bcryptjs";
import { connectToDatabase } from "@/lib/dbConnect";

export const authOptions: NextAuthOptions = {
  secret: process.env.NEXTAUTH_SECRET,
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
          } as any;
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

export const getSession = () => getServerSession(authOptions);

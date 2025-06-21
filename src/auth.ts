import { NextAuthOptions, getServerSession } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { saveUser } from "./lib/dbUtils";
import Role from "@/models/Role";
import { connectToDatabase } from "@/lib/dbConnect";

export const authOptions: NextAuthOptions = {
  secret: process.env.NEXTAUTH_SECRET,
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    }),
  ],
  callbacks: {
    async signIn({ user }) {
      try {
        await connectToDatabase();

        const existingRole = await Role.findOne({ email: user.email });
        const role = existingRole?.role || "user";

        const savedUser = await saveUser({
          name: user.name as string,
          email: user.email as string,
          image: user.image as string,
          role,
        });

        user.role = role;
        user.id = savedUser._id.toString();
        return true;
      } catch (error) {
        console.error("Error during sign-in:", error);
        return false;
      }
    },

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

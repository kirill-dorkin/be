import NextAuth from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import bcrypt from "bcryptjs"
import { connectToDatabase } from "@/shared/lib/dbConnect"
import User from "@/entities/user/User"

const authOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        console.log("🔐 Attempting authentication for:", credentials?.email)
        
        if (!credentials?.email || !credentials?.password) {
          console.log("❌ Missing credentials")
          return null
        }

        try {
          await connectToDatabase()
          console.log("✅ Connected to database")
          
          // Ищем пользователя в базе данных
          const user = await User.findOne({ email: credentials.email })
          console.log("👤 User found:", user ? `${user.email} (${user.role})` : "Not found")
          
          if (!user || !user.passwordHash) {
            console.log("❌ User not found or no password hash")
            return null
          }

          // Проверяем пароль
          const isPasswordValid = await bcrypt.compare(credentials.password, user.passwordHash)
          console.log("🔑 Password valid:", isPasswordValid)
          
          if (!isPasswordValid) {
            console.log("❌ Invalid password")
            return null
          }

          console.log("✅ Authentication successful")
          return {
            id: user._id.toString(),
            email: user.email,
            name: user.name,
            role: user.role,
            image: user.image
          }
        } catch (error) {
          console.error("❌ Auth error:", error)
          return null
        }
      }
    })
  ],
  secret: process.env.NEXTAUTH_SECRET,
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role
      }
      return token
    },
    async session({ session, token }) {
      if (token && token.sub) {
        session.user.id = token.sub
        session.user.role = token.role as string
      }
      return session
    }
  }
}

export default authOptions

import type { NextAuthOptions } from "next-auth";
import { credentialsProvider, googleProvider } from "./providers";
import { getDb } from "@/lib/db/client";

export const authOptions: NextAuthOptions = {
  providers: [credentialsProvider, googleProvider],
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/login",
  },
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === "google") {
        const db = await getDb();
        const email = user.email?.toLowerCase();
        
        if (!email) return false;

        const existing = await db
          .collection("users")
          .findOne({ email });

        if (!existing) {
          const now = new Date().toISOString();
          await db.collection("users").insertOne({
            email,
            name: user.name,
            provider: "google",
            ageVerified: false,
            createdAt: now,
            updatedAt: now,
          });
        }
      }
      return true;
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      
      // Refresh user data from DB to ensure ageVerified is current
      if (token.email) {
        const db = await getDb();
        const dbUser = await db.collection("users").findOne({ email: token.email.toLowerCase() });
        if (dbUser) {
          token.ageVerified = dbUser.ageVerified;
          token.id = dbUser._id.toString();
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.id as string;
        (session.user as any).ageVerified = token.ageVerified as boolean;
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};

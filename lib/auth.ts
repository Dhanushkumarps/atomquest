import NextAuth, { CredentialsSignin } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import type { Role } from "@prisma/client";
import { authConfig } from "@/lib/auth.config";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      email: string;
      name: string;
      role: Role;
      department?: string | null;
      managerId?: string | null;
    };
  }
  interface User {
    role: Role;
    department?: string | null;
    managerId?: string | null;
  }
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        try {
          const user = await prisma.user.findUnique({
            where: { email: credentials.email as string },
          });

          if (!user) return null;

          const isValid = await bcrypt.compare(
            credentials.password as string,
            user.password
          );

          if (!isValid) return null;

          return {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
            department: user.department,
            managerId: user.managerId,
          };
        } catch (error: any) {
          console.error("Auth Error:", error);
          // Throw specific NextAuth error so it reaches the client
          class CustomError extends CredentialsSignin {
            code = "Database connection failed. Please check Vercel DATABASE_URL.";
          }
          throw new CustomError();
        }
      },
    }),
  ],
  trustHost: true,
});

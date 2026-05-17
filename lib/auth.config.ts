import type { NextAuthConfig } from "next-auth";
import type { Role } from "@prisma/client";

// Edge-safe auth config — NO Prisma, NO bcrypt, NO Node.js-only modules.
// This is used by middleware.ts which runs on the Edge runtime.
export const authConfig: NextAuthConfig = {
  secret: process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET || "018d1c9830d2422ab47d776df3251533_hackathon",
  pages: {
    signIn: "/login",
  },
  providers: [], // Providers are added in lib/auth.ts (Node.js only)
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const role = auth?.user?.role as Role | undefined;

      const isAuthPage = nextUrl.pathname.startsWith("/login");
      const isEmployeePage = nextUrl.pathname.startsWith("/employee");
      const isManagerPage = nextUrl.pathname.startsWith("/manager");
      const isAdminPage = nextUrl.pathname.startsWith("/admin");

      if (isAuthPage) {
        if (isLoggedIn) return Response.redirect(new URL(
          role === "ADMIN" ? "/admin/dashboard"
          : role === "MANAGER" ? "/manager/dashboard"
          : "/employee/dashboard",
          nextUrl
        ));
        return true;
      }

      if (!isLoggedIn) {
        return Response.redirect(new URL("/login", nextUrl));
      }

      if (isEmployeePage && role !== "EMPLOYEE" && role !== "ADMIN") {
        return Response.redirect(new URL("/manager/dashboard", nextUrl));
      }
      if (isManagerPage && role !== "MANAGER" && role !== "ADMIN") {
        return Response.redirect(new URL("/employee/dashboard", nextUrl));
      }
      if (isAdminPage && role !== "ADMIN") {
        return Response.redirect(new URL(
          role === "MANAGER" ? "/manager/dashboard" : "/employee/dashboard",
          nextUrl
        ));
      }

      return true;
    },
    jwt({ token, user }) {
      if (user) {
        token.role = (user as any).role;
        token.department = (user as any).department;
        token.managerId = (user as any).managerId;
      }
      return token;
    },
    session({ session, token }) {
      if (token) {
        session.user.id = token.sub as string;
        session.user.role = token.role as Role;
        session.user.department = token.department as string | null;
        session.user.managerId = token.managerId as string | null;
      }
      return session;
    },
  },
  session: { strategy: "jwt" },
};

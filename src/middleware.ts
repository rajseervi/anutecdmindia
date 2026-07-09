import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

// Protect admin and management routes
export default withAuth(
  function middleware() {
    // If user is authenticated, allow access
    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => {
        // Return true if user has a valid token (is authenticated)
        return !!token;
      },
    },
    pages: {
      signIn: "/login", // Redirect to login page if not authenticated
    },
  }
);

// Specify which routes to protect
export const config = {
  matcher: [
    "/admin/:path*",
    "/inventory/:path*",
  ],
};
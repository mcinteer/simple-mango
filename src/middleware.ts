import { getToken } from "next-auth/jwt";
import { NextRequest, NextResponse } from "next/server";

export default async function middleware(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

  if (!token) {
    const loginUrl = new URL("/login", req.url);
    return NextResponse.redirect(loginUrl);
  }

  // Check age verification
  if (req.nextUrl.pathname.startsWith("/dashboard")) {
      // Accessing dashboard requires age verification
      // Note: We need to ensure the token actually has this field populated correctly from the DB
      if (token.ageVerified === false) {
           // Redirect to a page to verify age or show an error
           // For now, let's redirect to a special error page or back to login with error
           // But since we don't have an age-verification page yet, we will just redirect to home for now
           // In a real app, this would go to /verify-age
           const homeUrl = new URL("/", req.url);
           return NextResponse.redirect(homeUrl); 
      }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/(auth)/:path*"],
};

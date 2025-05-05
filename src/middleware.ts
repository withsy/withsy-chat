import { createCsrfProtect, CsrfError } from "@edge-csrf/nextjs";
import { NextResponse, type NextRequest } from "next/server";

const csrfProtect = createCsrfProtect({
  cookie: {
    secure: process.env.NODE_ENV === "production",
  },
});

export const middleware = async (request: NextRequest) => {
  const response = NextResponse.next();

  try {
    await csrfProtect(request, response);
  } catch (e) {
    if (e instanceof CsrfError)
      return new NextResponse("invalid csrf token", { status: 403 });
    throw e;
  }

  return response;
};

export const config = {
  matcher: [
    "/((?!api/auth|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)",
  ],
};

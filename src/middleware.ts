import { createCsrfProtect, CsrfError } from "@edge-csrf/nextjs";
import { NextResponse, type NextRequest } from "next/server";
import { service } from "./server/service-registry";

const csrfProtect = createCsrfProtect({
  cookie: {
    secure: service.env.nodeEnv === "production",
  },
});

export const middleware = async (request: NextRequest) => {
  const response = NextResponse.next();

  try {
    await csrfProtect(request, response);
    console.log(
      "CSRF Token set in middleware:",
      response.headers.get("x-csrf-token")
    );
  } catch (e) {
    if (e instanceof CsrfError)
      return new NextResponse("invalid csrf token", { status: 403 });
    throw e;
  }

  return response;
};

export const config = {
  runtime: "nodejs",
  matcher: [
    "/((?!api/auth|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)",
  ],
};

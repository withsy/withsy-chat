import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // 로그인 완료 후 호출될 수 있게 하기 위해, NextAuth에서 redirect 설정 시 여기를 사용
  const token =
    req.cookies["next-auth.session-token"] ||
    req.cookies["__Secure-next-auth.session-token"];

  if (!token) {
    return res.redirect("https://withsy.chat/auth/signin?error=token_missing");
  }

  // 앱으로 리디렉션
  return res.redirect(`withsy://auth/callback?token=${token}`);
}

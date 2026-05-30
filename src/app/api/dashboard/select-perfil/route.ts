import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const session = await auth() as any; // eslint-disable-line
  if (!session?.user) return NextResponse.redirect(new URL("/login", req.url));

  const perfilId = req.nextUrl.searchParams.get("id");
  if (!perfilId) return NextResponse.redirect(new URL("/dashboard/select", req.url));

  const res = NextResponse.redirect(new URL("/dashboard", req.url));
  res.cookies.set("bjj_perfil_id", perfilId, {
    httpOnly: true,
    secure:   process.env.NODE_ENV === "production",
    maxAge:   8 * 60 * 60,
    path:     "/",
    sameSite: "lax",
  });
  return res;
}

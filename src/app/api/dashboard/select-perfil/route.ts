import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";

function publicUrl(req: NextRequest, path: string): string {
  const proto = req.headers.get("x-forwarded-proto") ?? "https";
  const host  = req.headers.get("x-forwarded-host") ?? req.headers.get("host") ?? "";
  return `${proto}://${host}${path}`;
}

export async function GET(req: NextRequest) {
  const session = await auth() as any; // eslint-disable-line
  if (!session?.user) return NextResponse.redirect(publicUrl(req, "/login"));

  const perfilId = req.nextUrl.searchParams.get("id");
  if (!perfilId) return NextResponse.redirect(publicUrl(req, "/dashboard/select"));

  const res = NextResponse.redirect(publicUrl(req, "/dashboard"));
  res.cookies.set("bjj_perfil_id", perfilId, {
    httpOnly: true,
    secure:   process.env.NODE_ENV === "production",
    maxAge:   8 * 60 * 60,
    path:     "/",
    sameSite: "lax",
  });
  return res;
}

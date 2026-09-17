import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { getSupabaseConfig } from "@/lib/supabase/config";

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request });
  const { url, anonKey } = getSupabaseConfig();
  const supabase = createServerClient(url, anonKey, { cookies: { getAll: () => request.cookies.getAll(), setAll: (values) => { values.forEach(({ name, value }) => request.cookies.set(name, value)); response = NextResponse.next({ request }); values.forEach(({ name, value, options }) => response.cookies.set(name, value, options)); } } });
  const { data: { user } } = await supabase.auth.getUser();
  const protectedPath = ["/dashboard", "/analytics", "/logs", "/projects", "/settings"].some((path) => request.nextUrl.pathname.startsWith(path));
  if (!user && protectedPath) { const target = request.nextUrl.clone(); target.pathname = "/login"; target.searchParams.set("next", request.nextUrl.pathname); return NextResponse.redirect(target); }
  if (user && ["/login", "/register"].includes(request.nextUrl.pathname)) { const target = request.nextUrl.clone(); target.pathname = "/dashboard"; return NextResponse.redirect(target); }
  return response;
}

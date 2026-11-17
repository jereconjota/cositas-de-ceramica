import { NextResponse, type NextRequest } from "next/server";
import { COOKIE, tokenValido } from "@/lib/auth";

// El ícono del celular de la tía apunta a /entrar?llave=XXXX.
// Deja una cookie por un año y la manda a su página. No hay contraseña que recordar.
export function GET(request: NextRequest) {
  const llave = request.nextUrl.searchParams.get("llave");
  if (!tokenValido(llave)) {
    return NextResponse.redirect(new URL("/", request.url));
  }
  const respuesta = NextResponse.redirect(new URL("/tia", request.url));
  respuesta.cookies.set(COOKIE, llave!, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
  });
  return respuesta;
}

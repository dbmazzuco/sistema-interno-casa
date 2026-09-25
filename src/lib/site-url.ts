import { headers } from "next/headers";

/**
 * Origin do request atual (ex: "https://sistema-interno-casa.vercel.app" ou
 * "http://localhost:3000"). Usado para montar o `redirectTo` de e-mails de
 * autenticação do Supabase, já que Server Actions não têm acesso a `request.url`.
 */
export async function getSiteOrigin() {
  const h = await headers();
  const host = h.get("host") ?? "localhost:3000";
  const proto = h.get("x-forwarded-proto") ?? (host.startsWith("localhost") ? "http" : "https");
  return `${proto}://${host}`;
}

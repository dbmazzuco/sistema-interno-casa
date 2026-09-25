import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * Callback genérico de autenticação do Supabase (fluxo PKCE): troca o `code`
 * recebido por e-mail (recuperação de senha, confirmação, etc.) por uma
 * sessão válida via cookies, e então redireciona para `next`.
 */
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/dashboard";

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  return NextResponse.redirect(`${origin}/esqueci-senha?erro=link-invalido`);
}

import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * Callback de autenticação do Supabase (fluxo PKCE): troca o `code` recebido
 * por e-mail por uma sessão válida via cookies. Hoje essa rota só é usada
 * pelo fluxo de recuperação de senha, então sempre manda para lá — o
 * `type=recovery` que o Supabase anexa não chega de forma confiável nessa
 * troca via `code`, então não dá pra confiar nele para decidir o destino.
 *
 * Importante: esta URL (sem querystring) precisa estar cadastrada
 * exatamente assim em Authentication > URL Configuration > Redirect URLs
 * no painel do Supabase, senão ele cai no fallback do Site URL.
 */
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(`${origin}/redefinir-senha`);
    }
  }

  return NextResponse.redirect(`${origin}/esqueci-senha?erro=link-invalido`);
}

import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * Callback genérico de autenticação do Supabase (fluxo PKCE): troca o `code`
 * recebido por e-mail (recuperação de senha, confirmação, etc.) por uma
 * sessão válida via cookies, e então redireciona para o destino certo.
 *
 * Importante: esta URL (sem querystring) precisa estar cadastrada
 * exatamente assim em Authentication > URL Configuration > Redirect URLs
 * no painel do Supabase — por isso não usamos um `?next=` aqui, para o
 * `redirectTo` enviado ao Supabase ser idêntico ao valor cadastrado. O
 * destino é decidido a partir do `type` que o Supabase mesmo já anexa.
 */
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const type = searchParams.get("type");
  const next = type === "recovery" ? "/redefinir-senha" : "/dashboard";

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  return NextResponse.redirect(`${origin}/esqueci-senha?erro=link-invalido`);
}

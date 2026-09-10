import { requireProfile } from "@/lib/auth";
import { NameForm, PasswordForm } from "./configuracoes-forms";

export default async function ConfiguracoesPage() {
  const profile = await requireProfile();

  return (
    <div className="max-w-sm space-y-6">
      <h1 className="text-2xl font-semibold">Configurações</h1>
      <NameForm currentName={profile.name} />
      <PasswordForm />
    </div>
  );
}

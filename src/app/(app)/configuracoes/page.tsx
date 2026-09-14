import { requireProfile } from "@/lib/auth";
import { PageHeader } from "@/components/app-shell";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { NameForm, PasswordForm } from "./configuracoes-forms";

function initials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

export default async function ConfiguracoesPage() {
  const profile = await requireProfile();

  return (
    <div>
      <PageHeader title="Configurações" subtitle="Gerencie seus dados de acesso" />

      <div className="max-w-2xl space-y-5">
        <div className="flex items-center gap-4 rounded-2xl border border-border bg-card p-6 shadow-soft">
          <Avatar className="size-14">
            <AvatarFallback className="bg-gradient-primary text-base font-bold text-primary-foreground">
              {initials(profile.name)}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="font-display text-lg font-bold">{profile.name}</p>
            <p className="text-sm text-muted-foreground">{profile.email}</p>
          </div>
        </div>

        <NameForm currentName={profile.name} />
        <PasswordForm />
      </div>
    </div>
  );
}

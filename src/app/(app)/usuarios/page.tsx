import { requireAdmin } from "@/lib/auth";
import { getAllProfiles } from "@/lib/data/profiles";
import { PageHeader } from "@/components/app-shell";
import { UserRowActions } from "@/components/users/user-row-actions";
import { Pill } from "@/components/task-badges";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

const STATUS_TONE: Record<string, "warning" | "success" | "neutral"> = {
  pendente: "warning",
  ativo: "success",
  inativo: "neutral",
};

function initials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

export default async function UsuariosPage() {
  const admin = await requireAdmin();
  const profiles = await getAllProfiles();

  return (
    <div>
      <PageHeader title="Usuários" subtitle={`${profiles.length} membros cadastrados`} />

      <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-soft">
        <ul className="divide-y divide-border">
          {profiles.map((p) => (
            <li key={p.id} className="flex items-center gap-4 p-4 transition-colors hover:bg-secondary/50">
              <Avatar className="size-10">
                <AvatarFallback className="bg-gradient-primary text-xs font-bold text-primary-foreground">
                  {initials(p.name)}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium">
                  {p.name}
                  {p.id === admin.id && <span className="ml-2 text-xs text-muted-foreground">(você)</span>}
                </p>
                <p className="truncate text-sm text-muted-foreground">{p.email}</p>
              </div>
              <div className="hidden sm:block">
                <Pill tone={p.role === "admin" ? "info" : "neutral"}>
                  {p.role === "admin" ? "Administrador" : "Usuário"}
                </Pill>
              </div>
              <Pill tone={STATUS_TONE[p.status]}>{p.status}</Pill>
              <UserRowActions user={p} isSelf={p.id === admin.id} />
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

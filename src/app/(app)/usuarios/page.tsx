import { requireAdmin } from "@/lib/auth";
import { getAllProfiles } from "@/lib/data/profiles";
import { UserRowActions } from "@/components/users/user-row-actions";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const STATUS_CLASS: Record<string, string> = {
  pendente: "bg-amber-100 text-amber-700",
  ativo: "bg-green-100 text-green-700",
  inativo: "bg-zinc-200 text-zinc-500",
};

export default async function UsuariosPage() {
  const admin = await requireAdmin();
  const profiles = await getAllProfiles();

  return (
    <div>
      <h1 className="mb-6 text-2xl font-semibold">Usuários</h1>
      <div className="overflow-x-auto rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>E-mail</TableHead>
              <TableHead>Perfil</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {profiles.map((p) => (
              <TableRow key={p.id}>
                <TableCell className="font-medium">{p.name}</TableCell>
                <TableCell>{p.email}</TableCell>
                <TableCell>{p.role === "admin" ? "Administrador" : "Usuário"}</TableCell>
                <TableCell>
                  <Badge className={STATUS_CLASS[p.status]}>{p.status}</Badge>
                </TableCell>
                <TableCell className="text-right">
                  <UserRowActions user={p} isSelf={p.id === admin.id} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

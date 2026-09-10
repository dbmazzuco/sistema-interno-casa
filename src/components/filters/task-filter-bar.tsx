import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import type { Profile, Category } from "@/lib/types/database";

const selectClass =
  "h-9 rounded-md border border-input bg-transparent px-3 text-sm shadow-xs focus:outline-none focus:ring-1 focus:ring-ring";

export function TaskFilterBar({
  profiles,
  categories,
  isAdminView = false,
  defaults,
}: {
  profiles: Profile[];
  categories: Category[];
  isAdminView?: boolean;
  defaults: Record<string, string | undefined>;
}) {
  return (
    <form className="mb-4 flex flex-wrap items-center gap-2" method="get">
      <Input
        name="titulo"
        placeholder="Buscar por título..."
        defaultValue={defaults.titulo}
        className="w-full sm:w-48"
      />
      {isAdminView && (
        <select name="responsavel" defaultValue={defaults.responsavel ?? ""} className={selectClass}>
          <option value="">Responsável (todos)</option>
          {profiles.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>
      )}
      <select name="status" defaultValue={defaults.status ?? ""} className={selectClass}>
        <option value="">Status (todos)</option>
        <option value="pendente">Pendente</option>
        <option value="em_andamento">Em andamento</option>
        <option value="concluida">Concluída</option>
        <option value="atrasada">Atrasada</option>
        <option value="cancelada">Cancelada</option>
      </select>
      <select name="prioridade" defaultValue={defaults.prioridade ?? ""} className={selectClass}>
        <option value="">Prioridade (todas)</option>
        <option value="baixa">Baixa</option>
        <option value="media">Média</option>
        <option value="alta">Alta</option>
        <option value="urgente">Urgente</option>
      </select>
      <select name="categoria" defaultValue={defaults.categoria ?? ""} className={selectClass}>
        <option value="">Categoria (todas)</option>
        {categories.map((c) => (
          <option key={c.id} value={c.id}>
            {c.name}
          </option>
        ))}
      </select>
      <select name="recorrencia" defaultValue={defaults.recorrencia ?? ""} className={selectClass}>
        <option value="">Recorrência (todas)</option>
        <option value="none">Sem recorrência</option>
        <option value="daily">Diária</option>
        <option value="weekly">Semanal</option>
        <option value="biweekly">Quinzenal</option>
        <option value="monthly">Mensal</option>
        <option value="custom">Personalizada</option>
      </select>
      {isAdminView && (
        <select name="criador" defaultValue={defaults.criador ?? ""} className={selectClass}>
          <option value="">Criador (todos)</option>
          {profiles.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>
      )}
      <label className="flex items-center gap-2 text-sm text-muted-foreground">
        <input type="checkbox" name="atrasadas" value="1" defaultChecked={defaults.atrasadas === "1"} />
        Só atrasadas
      </label>
      <Button type="submit" size="sm">
        Filtrar
      </Button>
    </form>
  );
}

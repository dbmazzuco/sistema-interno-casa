"use client";

import { useCallback, useRef, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Search, SlidersHorizontal } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Profile, Category } from "@/lib/types/database";

export function TaskFilterBar({
  profiles,
  categories,
  isAdminView = false,
}: {
  profiles: Profile[];
  categories: Category[];
  isAdminView?: boolean;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [titulo, setTitulo] = useState(searchParams.get("titulo") ?? "");
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const updateParam = useCallback(
    (key: string, value: string | null) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value && value !== "all") {
        params.set(key, value);
      } else {
        params.delete(key);
      }
      router.replace(`${pathname}?${params.toString()}`);
    },
    [pathname, router, searchParams],
  );

  function handleTituloChange(value: string) {
    setTitulo(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => updateParam("titulo", value || null), 400);
  }

  const atrasadasOnly = searchParams.get("atrasadas") === "1";

  return (
    <div className="mb-5 rounded-2xl border border-border bg-card p-4 shadow-soft">
      <div className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        <SlidersHorizontal className="size-3.5" />
        Filtros
      </div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div className="relative sm:col-span-2 lg:col-span-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar por título..."
            className="pl-9"
            value={titulo}
            onChange={(e) => handleTituloChange(e.target.value)}
          />
        </div>

        {isAdminView && (
          <Select
            value={searchParams.get("responsavel") ?? "all"}
            onValueChange={(v) => updateParam("responsavel", v)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Responsável" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Responsável (todos)</SelectItem>
              {profiles.map((p) => (
                <SelectItem key={p.id} value={p.id}>
                  {p.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}

        <Select value={searchParams.get("status") ?? "all"} onValueChange={(v) => updateParam("status", v)}>
          <SelectTrigger>
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Status (todos)</SelectItem>
            <SelectItem value="pendente">Pendente</SelectItem>
            <SelectItem value="em_andamento">Em andamento</SelectItem>
            <SelectItem value="concluida">Concluída</SelectItem>
            <SelectItem value="atrasada">Atrasada</SelectItem>
            <SelectItem value="cancelada">Cancelada</SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={searchParams.get("prioridade") ?? "all"}
          onValueChange={(v) => updateParam("prioridade", v)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Prioridade" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Prioridade (todas)</SelectItem>
            <SelectItem value="baixa">Baixa</SelectItem>
            <SelectItem value="media">Média</SelectItem>
            <SelectItem value="alta">Alta</SelectItem>
            <SelectItem value="urgente">Urgente</SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={searchParams.get("categoria") ?? "all"}
          onValueChange={(v) => updateParam("categoria", v)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Categoria" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Categoria (todas)</SelectItem>
            {categories.map((c) => (
              <SelectItem key={c.id} value={String(c.id)}>
                {c.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={searchParams.get("recorrencia") ?? "all"}
          onValueChange={(v) => updateParam("recorrencia", v)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Recorrência" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Recorrência (todas)</SelectItem>
            <SelectItem value="none">Sem recorrência</SelectItem>
            <SelectItem value="daily">Diária</SelectItem>
            <SelectItem value="weekly">Semanal</SelectItem>
            <SelectItem value="biweekly">Quinzenal</SelectItem>
            <SelectItem value="monthly">Mensal</SelectItem>
            <SelectItem value="custom">Personalizada</SelectItem>
          </SelectContent>
        </Select>

        {isAdminView && (
          <Select
            value={searchParams.get("criador") ?? "all"}
            onValueChange={(v) => updateParam("criador", v)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Criador" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Criador (todos)</SelectItem>
              {profiles.map((p) => (
                <SelectItem key={p.id} value={p.id}>
                  {p.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}

        <label className="flex items-center gap-2 rounded-xl border border-input px-3 text-sm text-muted-foreground">
          <input
            type="checkbox"
            checked={atrasadasOnly}
            onChange={(e) => updateParam("atrasadas", e.target.checked ? "1" : null)}
            className="size-4 accent-primary"
          />
          Só atrasadas
        </label>
      </div>
    </div>
  );
}

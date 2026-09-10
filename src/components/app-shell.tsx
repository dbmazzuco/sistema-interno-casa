"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  ListChecks,
  ClipboardList,
  PlusCircle,
  CheckSquare,
  Users,
  Settings,
  Menu,
  LogOut,
} from "lucide-react";
import { signOutAction } from "@/lib/actions/auth";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import type { Profile } from "@/lib/types/database";
import { cn } from "@/lib/utils";

interface NavItem {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  adminOnly?: boolean;
}

const NAV_ITEMS: NavItem[] = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/tarefas/minhas", label: "Minhas tarefas", icon: ListChecks },
  { href: "/tarefas", label: "Todas as tarefas", icon: ClipboardList, adminOnly: true },
  { href: "/tarefas/nova", label: "Criar tarefa", icon: PlusCircle },
  { href: "/aprovacoes", label: "Aprovações", icon: CheckSquare },
  { href: "/usuarios", label: "Usuários", icon: Users, adminOnly: true },
  { href: "/configuracoes", label: "Configurações", icon: Settings },
];

function initials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

function NavLinks({ profile, onNavigate }: { profile: Profile; onNavigate?: () => void }) {
  const pathname = usePathname();

  return (
    <nav className="flex flex-1 flex-col gap-1 px-2">
      {NAV_ITEMS.filter((item) => !item.adminOnly || profile.role === "admin").map((item) => {
        const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            className={cn(
              "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
              active ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted",
            )}
          >
            <Icon className="size-4" />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}

function ProfileFooter({ profile }: { profile: Profile }) {
  return (
    <div className="flex items-center gap-3 border-t p-4">
      <Avatar className="size-8">
        <AvatarFallback>{initials(profile.name)}</AvatarFallback>
      </Avatar>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium">{profile.name}</p>
        <p className="truncate text-xs text-muted-foreground">
          {profile.role === "admin" ? "Administrador" : "Usuário"}
        </p>
      </div>
      <form action={signOutAction}>
        <Button variant="ghost" size="icon" type="submit" title="Sair">
          <LogOut className="size-4" />
        </Button>
      </form>
    </div>
  );
}

export function AppShell({ profile, children }: { profile: Profile; children: React.ReactNode }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="flex min-h-svh">
      <aside className="hidden w-64 flex-col border-r md:flex">
        <div className="flex h-14 items-center border-b px-4 font-semibold">Casa da Família</div>
        <NavLinks profile={profile} />
        <ProfileFooter profile={profile} />
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-14 items-center gap-3 border-b px-4 md:hidden">
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger render={<Button variant="ghost" size="icon" />}>
              <Menu className="size-5" />
            </SheetTrigger>
            <SheetContent side="left" className="flex w-64 flex-col p-0">
              <SheetTitle className="flex h-14 items-center border-b px-4 text-left font-semibold">
                Casa da Família
              </SheetTitle>
              <NavLinks profile={profile} onNavigate={() => setOpen(false)} />
              <ProfileFooter profile={profile} />
            </SheetContent>
          </Sheet>
          <span className="font-semibold">Casa da Família</span>
        </header>

        <main className="flex-1 overflow-y-auto p-4 md:p-6">{children}</main>
      </div>
    </div>
  );
}

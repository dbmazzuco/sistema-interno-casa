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
  Home,
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
  exact?: boolean;
  adminOnly?: boolean;
}

const NAV_ITEMS: NavItem[] = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard, exact: true },
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

function Brand() {
  return (
    <div className="flex h-16 items-center gap-3 px-5">
      <span className="grid size-9 place-items-center rounded-xl bg-gradient-primary text-primary-foreground shadow-lift">
        <Home className="size-4.5" />
      </span>
      <div className="leading-tight">
        <p className="font-display text-base font-bold text-sidebar-foreground">Casa da Família</p>
        <p className="text-[11px] font-medium text-sidebar-foreground/55">Sistema interno</p>
      </div>
    </div>
  );
}

function NavLinks({ profile, onNavigate }: { profile: Profile; onNavigate?: () => void }) {
  const pathname = usePathname();

  return (
    <nav className="flex flex-1 flex-col gap-1 px-3 py-2">
      {NAV_ITEMS.filter((item) => !item.adminOnly || profile.role === "admin").map((item) => {
        const active = item.exact
          ? pathname === item.href
          : pathname === item.href || pathname.startsWith(`${item.href}/`);
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            className={cn(
              "group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all",
              active
                ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-lift"
                : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
            )}
          >
            <Icon className="size-4.5 shrink-0" />
            <span className="flex-1 truncate">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}

function ProfileFooter({ profile }: { profile: Profile }) {
  return (
    <div className="m-3 flex items-center gap-3 rounded-xl bg-sidebar-accent p-3">
      <Avatar className="size-9">
        <AvatarFallback className="bg-gradient-primary text-xs font-bold text-primary-foreground">
          {initials(profile.name)}
        </AvatarFallback>
      </Avatar>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-sidebar-foreground">{profile.name}</p>
        <p className="truncate text-xs text-sidebar-foreground/55">
          {profile.role === "admin" ? "Administrador" : "Usuário"}
        </p>
      </div>
      <form action={signOutAction}>
        <button
          type="submit"
          title="Sair"
          className="grid size-8 place-items-center rounded-lg text-sidebar-foreground/60 transition-colors hover:bg-sidebar-border hover:text-sidebar-foreground"
        >
          <LogOut className="size-4" />
        </button>
      </form>
    </div>
  );
}

function SidebarInner({ profile, onNavigate }: { profile: Profile; onNavigate?: () => void }) {
  return (
    <div className="flex h-full flex-col bg-sidebar">
      <Brand />
      <NavLinks profile={profile} onNavigate={onNavigate} />
      <ProfileFooter profile={profile} />
    </div>
  );
}

export function PageHeader({
  title,
  subtitle,
  action,
}: {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="font-display text-2xl font-bold tracking-tight sm:text-3xl">{title}</h1>
        {subtitle ? <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p> : null}
      </div>
      {action}
    </div>
  );
}

export function AppShell({ profile, children }: { profile: Profile; children: React.ReactNode }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="flex min-h-svh bg-background">
      <aside className="sticky top-0 hidden h-svh w-68 shrink-0 md:block">
        <SidebarInner profile={profile} />
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-border bg-background/85 px-4 backdrop-blur md:hidden">
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="size-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-72 border-0 p-0">
              <SheetTitle className="sr-only">Menu</SheetTitle>
              <SidebarInner profile={profile} onNavigate={() => setOpen(false)} />
            </SheetContent>
          </Sheet>
          <span className="font-display font-bold">Casa da Família</span>
        </header>

        <main className="mx-auto w-full max-w-7xl flex-1 p-4 sm:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}

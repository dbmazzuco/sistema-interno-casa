import { requireProfile } from "@/lib/auth";
import { getActiveProfiles } from "@/lib/data/profiles";
import { getCategories } from "@/lib/data/categories";
import { TaskForm } from "@/components/tasks/task-form";
import { submitTaskAction } from "@/lib/actions/tasks";

export default async function NovaTarefaPage() {
  const profile = await requireProfile();
  const [profiles, categories] = await Promise.all([getActiveProfiles(), getCategories()]);

  const isAdmin = profile.role === "admin";

  return (
    <div>
      <h1 className="mb-2 text-2xl font-semibold">{isAdmin ? "Criar tarefa" : "Sugerir tarefa"}</h1>
      <p className="mb-6 text-sm text-muted-foreground">
        {isAdmin
          ? "A tarefa é criada imediatamente e atribuída ao responsável escolhido."
          : "Sua sugestão será enviada para aprovação do administrador antes de virar uma tarefa."}
      </p>
      <TaskForm
        profiles={profiles}
        categories={categories}
        action={submitTaskAction}
        submitLabel={isAdmin ? "Criar tarefa" : "Enviar sugestão"}
        defaultValues={{ assigneeId: isAdmin ? undefined : profile.id }}
      />
    </div>
  );
}

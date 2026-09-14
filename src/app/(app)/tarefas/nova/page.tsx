import { requireProfile } from "@/lib/auth";
import { getActiveProfiles } from "@/lib/data/profiles";
import { getCategories } from "@/lib/data/categories";
import { PageHeader } from "@/components/app-shell";
import { TaskForm } from "@/components/tasks/task-form";
import { submitTaskAction } from "@/lib/actions/tasks";

export default async function NovaTarefaPage() {
  const profile = await requireProfile();
  const [profiles, categories] = await Promise.all([getActiveProfiles(), getCategories()]);

  const isAdmin = profile.role === "admin";

  return (
    <div>
      <PageHeader
        title={isAdmin ? "Criar tarefa" : "Sugerir tarefa"}
        subtitle={
          isAdmin
            ? "A tarefa é criada imediatamente e atribuída ao responsável escolhido."
            : "Sua sugestão será enviada para aprovação do administrador antes de virar uma tarefa."
        }
      />
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

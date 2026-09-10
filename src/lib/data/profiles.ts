import { createClient } from "@/lib/supabase/server";
import type { Profile } from "@/lib/types/database";

export async function getAllProfiles(): Promise<Profile[]> {
  const supabase = await createClient();
  const { data } = await supabase.from("profiles").select("*").order("name");
  return data ?? [];
}

export async function getActiveProfiles(): Promise<Profile[]> {
  const profiles = await getAllProfiles();
  return profiles.filter((p) => p.status === "ativo");
}

export async function getPendingProfiles(): Promise<Profile[]> {
  const profiles = await getAllProfiles();
  return profiles.filter((p) => p.status === "pendente");
}

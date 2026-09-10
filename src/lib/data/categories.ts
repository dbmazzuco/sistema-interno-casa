import { createClient } from "@/lib/supabase/server";
import type { Category } from "@/lib/types/database";

export async function getCategories(): Promise<Category[]> {
  const supabase = await createClient();
  const { data } = await supabase.from("categories").select("*").order("name");
  return data ?? [];
}

"use server";

import { createClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function login(formData: FormData) {
  const username = formData.get("username") as string;
  const pin = formData.get("pin") as string;

  const { data: player, error } = await supabase
    .from("players")
    .select("id")
    .eq("name", username)
    .eq("pin", pin)
    .single();

  if (error || !player) {
    return { error: "Usuário ou PIN incorretos" };
  }

  // CORREÇÃO AQUI: Adicionado 'await' antes de cookies()
  (await cookies()).set("player_id", player.id, { httpOnly: true });

  redirect("/ficha");
}

export async function saveSheet(jsonData: any) {
  // CORREÇÃO AQUI: Adicionado 'await'
  const cookieStore = await cookies();
  const playerId = cookieStore.get("player_id")?.value;

  if (!playerId) return { error: "Não autenticado" };

  const { error } = await supabase
    .from("sheets")
    .upsert(
      { player_id: playerId, data: jsonData },
      { onConflict: "player_id" }
    );

  if (error) return { error: "Erro ao salvar" };
  return { success: true };
}

export async function getSheet() {
  // CORREÇÃO AQUI: Adicionado 'await'
  const cookieStore = await cookies();
  const playerId = cookieStore.get("player_id")?.value;

  if (!playerId) return null;

  const { data } = await supabase
    .from("sheets")
    .select("data")
    .eq("player_id", playerId)
    .single();

  return data?.data || {};
}

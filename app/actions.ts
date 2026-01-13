"use server";

import { createClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

// Cliente Supabase (lado do servidor)
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function login(formData: FormData) {
  const username = formData.get("username") as string;
  const pin = formData.get("pin") as string;

  // 1. Busca o usuário e verifica o PIN (Plain Text conforme solicitado)
  const { data: player, error } = await supabase
    .from("players")
    .select("id")
    .eq("username", username)
    .eq("pin", pin)
    .single();

  if (error || !player) {
    return { error: "Usuário ou PIN incorretos" }; // Retorna erro para o front
  }

  // 2. Salva um cookie simples com o ID do jogador (sessão básica)
  // Nota: Para produção real, use JWT ou Supabase Auth. Isso é "quick & dirty".
  cookies().set("player_id", player.id, { httpOnly: true });

  redirect("/ficha");
}

export async function saveSheet(jsonData: any) {
  const playerId = cookies().get("player_id")?.value;
  if (!playerId) return { error: "Não autenticado" };

  // Atualiza ou cria a ficha (upsert)
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
  const playerId = cookies().get("player_id")?.value;
  if (!playerId) return null;

  const { data } = await supabase
    .from("sheets")
    .select("data")
    .eq("player_id", playerId)
    .single();

  return data?.data || {}; // Retorna o JSON da ficha ou vazio
}

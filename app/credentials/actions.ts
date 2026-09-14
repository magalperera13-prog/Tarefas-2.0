"use server";

import { requireOwner } from "@/lib/auth";
import { encryptSecret } from "@/lib/crypto";

export async function addCredentialAction(
  serviceName: string,
  loginIdentifier: string | null,
  password: string
): Promise<{ id: string; created_at: string; updated_at: string } | { error: string }> {
  const { supabase, user } = await requireOwner();

  const { data, error } = await supabase
    .from("credentials")
    .insert({
      user_id: user.id,
      service_name: serviceName,
      login_identifier: loginIdentifier,
      password_encrypted: encryptSecret(password),
    })
    .select("id, created_at, updated_at")
    .single();

  if (error || !data) return { error: "Não foi possível adicionar" };
  return data;
}

export async function updateCredentialAction(
  id: string,
  changes: { service_name: string; login_identifier: string | null; password: string; notes: string | null }
): Promise<{ updated_at: string } | { error: string }> {
  const { supabase } = await requireOwner();

  const { data, error } = await supabase
    .from("credentials")
    .update({
      service_name: changes.service_name,
      login_identifier: changes.login_identifier,
      password_encrypted: encryptSecret(changes.password),
      notes: changes.notes,
    })
    .eq("id", id)
    .select("updated_at")
    .single();

  if (error || !data) return { error: "Não foi possível salvar" };
  return data;
}

export async function deleteCredentialAction(id: string): Promise<{ ok: true } | { error: string }> {
  const { supabase } = await requireOwner();

  const { error } = await supabase.from("credentials").delete().eq("id", id);
  if (error) return { error: "Não foi possível excluir" };
  return { ok: true };
}

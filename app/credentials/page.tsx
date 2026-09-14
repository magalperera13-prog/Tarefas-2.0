import { requireOwner } from "@/lib/auth";
import { AppShell } from "@/components/AppShell";
import { CredentialsView } from "@/components/CredentialsView";
import { decryptSecret } from "@/lib/crypto";
import type { Credential } from "@/lib/types";

export default async function CredentialsPage() {
  const { supabase, user } = await requireOwner();

  const { data, error } = await supabase.from("credentials").select("*");

  const initialCredentials: Credential[] = error
    ? []
    : (data ?? []).map((row) => ({
        id: row.id,
        user_id: row.user_id,
        service_name: row.service_name,
        login_identifier: row.login_identifier,
        password: decryptSecret(row.password_encrypted),
        notes: row.notes,
        created_at: row.created_at,
        updated_at: row.updated_at,
      }));

  return (
    <AppShell userEmail={user.email}>
      <CredentialsView initialCredentials={initialCredentials} />
    </AppShell>
  );
}

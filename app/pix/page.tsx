import { requireOwner } from "@/lib/auth";
import { AppShell } from "@/components/AppShell";
import { PixView } from "@/components/PixView";
import type { PixKey } from "@/lib/types";

export default async function PixPage() {
  const { supabase, user } = await requireOwner();

  const { data, error } = await supabase.from("pix_keys").select("*").order("created_at", { ascending: true });
  const initialKeys = (error ? [] : data ?? []) as PixKey[];

  return (
    <AppShell userEmail={user.email}>
      <PixView userId={user.id} initialKeys={initialKeys} />
    </AppShell>
  );
}

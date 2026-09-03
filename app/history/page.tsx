import { requireOwner } from "@/lib/auth";
import { AppShell } from "@/components/AppShell";
import { HistoryView } from "@/components/HistoryView";

export default async function HistoryPage() {
  const { user } = await requireOwner();

  return (
    <AppShell userEmail={user.email}>
      <HistoryView />
    </AppShell>
  );
}

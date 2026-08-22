import { requireOwner } from "@/lib/auth";
import { AppHeader } from "@/components/AppHeader";
import { HistoryView } from "@/components/HistoryView";

export default async function HistoryPage() {
  const { user } = await requireOwner();

  return (
    <main className="mx-auto max-w-3xl px-4 py-6 sm:px-6 sm:py-10">
      <AppHeader userEmail={user.email} />
      <HistoryView />
    </main>
  );
}

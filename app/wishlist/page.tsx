import { requireOwner } from "@/lib/auth";
import { AppShell } from "@/components/AppShell";
import { WishlistView } from "@/components/WishlistView";
import type { WishlistItem } from "@/lib/types";

export default async function WishlistPage() {
  const { supabase, user } = await requireOwner();

  const { data, error } = await supabase.from("wishlist_items").select("*").order("created_at", { ascending: true });
  const initialItems = ((error ? [] : data ?? []) as WishlistItem[]).map((i) => ({
    ...i,
    price: i.price === null || i.price === undefined ? null : Number(i.price),
  }));

  return (
    <AppShell userEmail={user.email}>
      <WishlistView userId={user.id} initialItems={initialItems} />
    </AppShell>
  );
}

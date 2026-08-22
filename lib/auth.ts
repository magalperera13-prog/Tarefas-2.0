import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { isAuthorizedOwner } from "@/lib/authorized-email";

export { isAuthorizedOwner };

/**
 * Usado nos Server Components das páginas protegidas. Garante, no servidor,
 * que existe uma sessão válida E que ela pertence ao proprietário —
 * independente do que a interface mostra ou esconde.
 */
export async function requireOwner() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  if (!isAuthorizedOwner(user.email)) {
    await supabase.auth.signOut();
    redirect("/login?error=unauthorized");
  }

  return { supabase, user };
}

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
  // getClaims() confere a assinatura do login localmente, sem uma ida ao
  // Supabase por página. O acesso aos dados continua protegido por RLS no banco.
  const { data } = await supabase.auth.getClaims();
  const claims = data?.claims;

  if (!claims) {
    redirect("/login");
  }

  const user = { id: claims.sub, email: claims.email as string | undefined };

  if (!isAuthorizedOwner(user.email)) {
    await supabase.auth.signOut();
    redirect("/login?error=unauthorized");
  }

  return { supabase, user };
}

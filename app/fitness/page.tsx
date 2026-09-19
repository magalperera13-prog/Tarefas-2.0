import { requireOwner } from "@/lib/auth";
import { AppShell } from "@/components/AppShell";
import { FitnessView } from "@/components/FitnessView";
import { todayISODate } from "@/lib/date";
import type { WorkoutLog } from "@/lib/types";

export default async function FitnessPage() {
  const { supabase, user } = await requireOwner();

  // Todo o histórico de treinos do usuário — dataset pequeno (1 linha por dia
  // treinado), não precisa de paginação para um app pessoal.
  const { data, error } = await supabase
    .from("workout_logs")
    .select("*")
    .order("workout_date", { ascending: true });

  const initialLogs = (error ? [] : data ?? []) as WorkoutLog[];

  return (
    <AppShell userEmail={user.email}>
      <FitnessView userId={user.id} initialLogs={initialLogs} todayISO={todayISODate()} />
    </AppShell>
  );
}

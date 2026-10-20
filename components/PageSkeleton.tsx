import { AppShell } from "@/components/AppShell";

/**
 * Tela de carregamento: mantém o menu lateral/inferior no lugar e mostra blocos
 * "piscando" enquanto a página busca os dados — a troca de aba responde na hora.
 */
export function PageSkeleton() {
  const block = { background: "var(--color-bg-elevated)" };
  return (
    <AppShell>
      <div className="space-y-6" aria-busy="true" aria-label="Carregando">
        <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="h-[74px] animate-pulse rounded-xl" style={block} />
          ))}
        </div>
        <div className="h-14 animate-pulse rounded-2xl" style={block} />
        <div className="space-y-2">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="h-14 animate-pulse rounded-xl" style={block} />
          ))}
        </div>
      </div>
    </AppShell>
  );
}

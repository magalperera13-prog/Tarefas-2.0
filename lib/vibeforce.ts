import type { VibeforceQueueStatus } from "@/lib/types";
import { daysBetween, toSaoPauloDateString } from "@/lib/date";

/** Abaixo (ou igual) a esse número de dias, mostramos o aviso. */
export const VIBEFORCE_LOW_DAYS = 2;

export function isVibeforceQueueLow(status: VibeforceQueueStatus | null): status is VibeforceQueueStatus {
  return status !== null && status.dias_restantes <= VIBEFORCE_LOW_DAYS;
}

/** "Falta 1 dia" / "Faltam 2 dias" / "Faltam 0 dias". */
export function remainingDaysLabel(dias: number): string {
  return dias === 1 ? "Falta 1 dia" : `Faltam ${dias} dias`;
}

/**
 * O Publicador grava "dias_restantes" no momento do envio (atualizado_em). Se ele ficar dias sem
 * enviar (PC desligado, por exemplo), o número gravado fica velho. Por isso, descontamos os dias
 * que já passaram desde o envio: assim a contagem regressiva continua certa sozinha, e um novo
 * envio do Publicador simplesmente a corrige.
 */
export function withElapsedDays(status: VibeforceQueueStatus, todayISO: string): VibeforceQueueStatus {
  const syncedOn = toSaoPauloDateString(status.atualizado_em);
  const elapsed = Math.max(0, daysBetween(syncedOn, todayISO));
  return { ...status, dias_restantes: status.dias_restantes - elapsed };
}

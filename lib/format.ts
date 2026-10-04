export function formatBRL(value: number): string {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

/**
 * Converte um valor digitado no formato brasileiro ("1.234,56", "21,24" ou
 * "1234") para number. O "." é sempre tratado como separador de milhar (é
 * removido) e a "," como separador decimal — o mesmo formato que formatBRL
 * exibe, então o que a pessoa vê na tela é o que pode digitar de volta.
 * Um replace ingênuo (trocar só a vírgula por ponto) quebra em qualquer
 * valor com milhar, porque sobra mais de um "." e Number() vira NaN.
 */
export function parseBRLAmount(raw: string): number {
  const normalized = raw.trim().replace(/\./g, "").replace(",", ".");
  return Number(normalized);
}

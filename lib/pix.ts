import type { PixKeyType } from "@/lib/types";

export const PIX_KEY_TYPES: { value: PixKeyType; label: string; placeholder: string }[] = [
  { value: "cpf", label: "CPF", placeholder: "000.000.000-00" },
  { value: "cnpj", label: "CNPJ", placeholder: "00.000.000/0000-00" },
  { value: "email", label: "E-mail", placeholder: "voce@email.com" },
  { value: "phone", label: "Telefone", placeholder: "+55 21 90000-0000" },
  { value: "random", label: "Aleatória", placeholder: "Chave aleatória" },
];

export function pixTypeLabel(type: PixKeyType): string {
  return PIX_KEY_TYPES.find((t) => t.value === type)?.label ?? type;
}

/** Agrupa chaves por banco (ignorando maiúsculas/minúsculas e espaços), em ordem alfabética. */
export function groupByBank<T extends { bank_name: string }>(items: T[]): { bank: string; items: T[] }[] {
  const map = new Map<string, { bank: string; items: T[] }>();
  for (const item of items) {
    const key = item.bank_name.trim().toLowerCase();
    const group = map.get(key);
    if (group) group.items.push(item);
    else map.set(key, { bank: item.bank_name.trim(), items: [item] });
  }
  return Array.from(map.values()).sort((a, b) => a.bank.localeCompare(b.bank, "pt-BR"));
}

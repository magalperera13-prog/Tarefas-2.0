import type { CredentialCategory } from "@/lib/types";

export const CREDENTIAL_CATEGORIES: { value: CredentialCategory; label: string }[] = [
  { value: "streaming", label: "Streaming" },
  { value: "trabalho_ia", label: "Trabalho/IA" },
  { value: "outros", label: "Outros sites" },
];

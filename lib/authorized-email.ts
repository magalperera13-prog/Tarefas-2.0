/**
 * E-mail do único usuário autorizado a usar o sistema.
 * Fica em uma variável de ambiente do lado do servidor (sem prefixo
 * NEXT_PUBLIC_), portanto nunca é enviado ao navegador nem aparece no
 * código-fonte da aplicação.
 */
export function isAuthorizedOwner(email: string | null | undefined): boolean {
  const authorizedEmail = process.env.AUTHORIZED_EMAIL?.trim().toLowerCase();
  if (!authorizedEmail || !email) return false;
  return email.trim().toLowerCase() === authorizedEmail;
}

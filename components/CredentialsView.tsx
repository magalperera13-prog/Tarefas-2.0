"use client";

import { useMemo, useState } from "react";
import { useToast } from "@/components/ToastProvider";
import { CredentialQuickAdd } from "@/components/CredentialQuickAdd";
import { CredentialItem } from "@/components/CredentialItem";
import { EmptyState } from "@/components/EmptyState";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import type { Credential } from "@/lib/types";
import { addCredentialAction, updateCredentialAction, deleteCredentialAction } from "@/app/credentials/actions";

export function CredentialsView({ initialCredentials }: { initialCredentials: Credential[] }) {
  const { showToast } = useToast();
  const [credentials, setCredentials] = useState<Credential[]>(initialCredentials);
  const [pendingDelete, setPendingDelete] = useState<Credential | null>(null);

  const sorted = useMemo(
    () => [...credentials].sort((a, b) => a.service_name.localeCompare(b.service_name, "pt-BR")),
    [credentials]
  );

  async function handleAdd(serviceName: string, loginIdentifier: string | null, password: string) {
    const result = await addCredentialAction(serviceName, loginIdentifier, password);
    if ("error" in result) {
      showToast("Não foi possível adicionar", "danger");
      return;
    }
    setCredentials((prev) => [
      ...prev,
      {
        id: result.id,
        user_id: "",
        service_name: serviceName,
        login_identifier: loginIdentifier,
        password,
        notes: null,
        created_at: result.created_at,
        updated_at: result.updated_at,
      },
    ]);
    showToast("✓ Adicionado");
  }

  async function handleSaveEdit(
    credential: Credential,
    changes: { service_name: string; login_identifier: string | null; password: string; notes: string | null }
  ) {
    setCredentials((prev) => prev.map((c) => (c.id === credential.id ? { ...c, ...changes } : c)));
    const result = await updateCredentialAction(credential.id, changes);
    if ("error" in result) {
      setCredentials((prev) => prev.map((c) => (c.id === credential.id ? credential : c)));
      showToast("Não foi possível salvar", "danger");
      return;
    }
    showToast("✓ Salvo");
  }

  async function handleDeleteConfirmed() {
    if (!pendingDelete) return;
    const credential = pendingDelete;
    setPendingDelete(null);
    setCredentials((prev) => prev.filter((c) => c.id !== credential.id));

    const result = await deleteCredentialAction(credential.id);
    if ("error" in result) {
      setCredentials((prev) => [...prev, credential]);
      showToast("Não foi possível excluir", "danger");
      return;
    }
    showToast("✓ Excluído");
  }

  return (
    <div className="space-y-6">
      <CredentialQuickAdd onAdd={handleAdd} />

      {sorted.length === 0 ? (
        <EmptyState message="Nenhuma credencial cadastrada. Adicione a primeira acima." />
      ) : (
        <div className="space-y-2">
          {sorted.map((credential) => (
            <CredentialItem
              key={credential.id}
              credential={credential}
              onSaveEdit={handleSaveEdit}
              onDeleteRequest={setPendingDelete}
            />
          ))}
        </div>
      )}

      <ConfirmDialog
        open={!!pendingDelete}
        title="Excluir credencial"
        description={
          pendingDelete ? `Tem certeza que deseja excluir "${pendingDelete.service_name}"? Essa ação não pode ser desfeita.` : ""
        }
        onConfirm={handleDeleteConfirmed}
        onCancel={() => setPendingDelete(null)}
      />
    </div>
  );
}

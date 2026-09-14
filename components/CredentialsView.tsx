"use client";

import { useMemo, useState } from "react";
import { useToast } from "@/components/ToastProvider";
import { CredentialQuickAdd } from "@/components/CredentialQuickAdd";
import { CredentialItem } from "@/components/CredentialItem";
import { EmptyState } from "@/components/EmptyState";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import type { Credential, CredentialCategory } from "@/lib/types";
import { CREDENTIAL_CATEGORIES } from "@/lib/credential-categories";
import { addCredentialAction, updateCredentialAction, deleteCredentialAction } from "@/app/credentials/actions";

export function CredentialsView({ initialCredentials }: { initialCredentials: Credential[] }) {
  const { showToast } = useToast();
  const [credentials, setCredentials] = useState<Credential[]>(initialCredentials);
  const [pendingDelete, setPendingDelete] = useState<Credential | null>(null);

  const grouped = useMemo(() => {
    return CREDENTIAL_CATEGORIES.map((cat) => ({
      ...cat,
      items: credentials
        .filter((c) => c.category === cat.value)
        .sort((a, b) => a.service_name.localeCompare(b.service_name, "pt-BR")),
    }));
  }, [credentials]);

  const isEmpty = credentials.length === 0;

  async function handleAdd(
    serviceName: string,
    loginIdentifier: string | null,
    password: string,
    category: CredentialCategory
  ) {
    const result = await addCredentialAction(serviceName, loginIdentifier, password, category);
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
        category,
        created_at: result.created_at,
        updated_at: result.updated_at,
      },
    ]);
    showToast("✓ Adicionado");
  }

  async function handleSaveEdit(
    credential: Credential,
    changes: {
      service_name: string;
      login_identifier: string | null;
      password: string;
      notes: string | null;
      category: CredentialCategory;
    }
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

      {isEmpty ? (
        <EmptyState message="Nenhuma credencial cadastrada. Adicione a primeira acima." />
      ) : (
        <div className="space-y-6">
          {grouped.map(
            (group) =>
              group.items.length > 0 && (
                <div key={group.value}>
                  <h2
                    className="mb-3 font-[family-name:var(--font-display)] text-sm font-semibold tracking-wide"
                    style={{ color: "var(--color-text-muted)" }}
                  >
                    {group.label.toUpperCase()} ({group.items.length})
                  </h2>
                  <div className="space-y-2">
                    {group.items.map((credential) => (
                      <CredentialItem
                        key={credential.id}
                        credential={credential}
                        onSaveEdit={handleSaveEdit}
                        onDeleteRequest={setPendingDelete}
                      />
                    ))}
                  </div>
                </div>
              )
          )}
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

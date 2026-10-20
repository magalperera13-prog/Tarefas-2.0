"use client";

import { useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useToast } from "@/components/ToastProvider";
import { PixQuickAdd } from "@/components/PixQuickAdd";
import { PixKeyItem, type PixKeyChanges } from "@/components/PixKeyItem";
import { EmptyState } from "@/components/EmptyState";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import type { PixKey, PixKeyType } from "@/lib/types";
import { groupByBank, pixTypeLabel } from "@/lib/pix";

interface PixViewProps {
  userId: string;
  initialKeys: PixKey[];
}

export function PixView({ userId, initialKeys }: PixViewProps) {
  const supabase = createClient();
  const { showToast } = useToast();
  const [keys, setKeys] = useState<PixKey[]>(initialKeys);
  const [pendingDelete, setPendingDelete] = useState<PixKey | null>(null);

  const groups = useMemo(() => {
    const ordered = [...keys].sort((a, b) => (a.created_at < b.created_at ? -1 : 1));
    return groupByBank(ordered);
  }, [keys]);
  const bankNames = useMemo(() => groups.map((g) => g.bank), [groups]);

  async function handleAdd(data: { bank_name: string; key_type: PixKeyType; key_value: string }) {
    // Reaproveita a grafia de um banco já cadastrado ("nubank" -> "Nubank"),
    // para não criar dois grupos do mesmo banco por diferença de maiúscula.
    const existing = bankNames.find((b) => b.toLowerCase() === data.bank_name.toLowerCase());
    const { data: row, error } = await supabase
      .from("pix_keys")
      .insert({ ...data, bank_name: existing ?? data.bank_name, user_id: userId })
      .select()
      .single();

    if (error || !row) {
      showToast("Não foi possível adicionar a chave", "danger");
      return;
    }
    setKeys((prev) => [...prev, row as PixKey]);
    showToast("✓ Chave adicionada");
  }

  async function handleSaveEdit(pixKey: PixKey, changes: PixKeyChanges) {
    setKeys((prev) => prev.map((k) => (k.id === pixKey.id ? { ...k, ...changes } : k)));
    const { error } = await supabase.from("pix_keys").update(changes).eq("id", pixKey.id);
    if (error) {
      setKeys((prev) => prev.map((k) => (k.id === pixKey.id ? pixKey : k)));
      showToast("Não foi possível salvar a chave", "danger");
      return;
    }
    showToast("✓ Chave atualizada");
  }

  async function handleDeleteConfirmed() {
    if (!pendingDelete) return;
    const pixKey = pendingDelete;
    setPendingDelete(null);
    setKeys((prev) => prev.filter((k) => k.id !== pixKey.id));

    const { error } = await supabase.from("pix_keys").delete().eq("id", pixKey.id);
    if (error) {
      setKeys((prev) => [...prev, pixKey]);
      showToast("Não foi possível excluir a chave", "danger");
      return;
    }
    showToast("✓ Chave excluída");
  }

  return (
    <div className="space-y-6">
      <PixQuickAdd existingBanks={bankNames} onAdd={handleAdd} />

      {groups.length === 0 ? (
        <EmptyState message="Nenhuma chave Pix cadastrada. Adicione a primeira acima." />
      ) : (
        <div className="space-y-6">
          {groups.map((group) => (
            <section key={group.bank}>
              <h2
                className="mb-2.5 font-[family-name:var(--font-display)] text-sm font-semibold tracking-wide"
                style={{ color: "var(--color-text-muted)" }}
              >
                {group.bank.toUpperCase()}
              </h2>
              <div className="space-y-2">
                {group.items.map((pixKey) => (
                  <PixKeyItem
                    key={pixKey.id}
                    pixKey={pixKey}
                    onSaveEdit={handleSaveEdit}
                    onDeleteRequest={setPendingDelete}
                  />
                ))}
              </div>
            </section>
          ))}
        </div>
      )}

      <ConfirmDialog
        open={!!pendingDelete}
        title="Excluir chave Pix"
        description={
          pendingDelete
            ? `Tem certeza que deseja excluir a chave ${pixTypeLabel(pendingDelete.key_type)} de ${pendingDelete.bank_name}? Essa ação não pode ser desfeita.`
            : ""
        }
        onConfirm={handleDeleteConfirmed}
        onCancel={() => setPendingDelete(null)}
      />
    </div>
  );
}

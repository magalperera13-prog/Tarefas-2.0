export function EmptyState({
  message,
  action,
}: {
  message: string;
  action?: React.ReactNode;
}) {
  return (
    <div
      className="flex flex-col items-center gap-3 rounded-xl border border-dashed px-6 py-10 text-center"
      style={{ borderColor: "var(--color-border)" }}
    >
      <p className="text-sm" style={{ color: "var(--color-text-muted)" }}>
        {message}
      </p>
      {action}
    </div>
  );
}

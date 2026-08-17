"use client";

import { useActionState, useEffect, useRef } from "react";
import { useFormStatus } from "react-dom";
import { X } from "lucide-react";
import { useLocale } from "@/components/LocaleContext";
import { loginAdmin, type AdminLoginState } from "@/lib/admin-actions";
import { ADMIN_ERROR_KEYS } from "@/lib/i18n";

const INITIAL: AdminLoginState = { error: null };

function SubmitButton() {
  const { pending } = useFormStatus();
  const { t } = useLocale();

  return (
    <button
      type="submit"
      disabled={pending}
      className="h-9 rounded-md border border-border bg-surface-hover px-4 text-sm font-medium text-text transition-colors hover:bg-border disabled:opacity-60"
    >
      {pending ? t("adminSubmitting") : t("adminSubmit")}
    </button>
  );
}

export function AdminLoginDialog({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const { t } = useLocale();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [state, formAction] = useActionState(loginAdmin, INITIAL);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  // Não há tratamento de sucesso aqui de propósito: quando a senha é aceita, o
  // layout re-renderiza em modo admin, o AdminButton troca para o ramo
  // "sair" e este diálogo desmonta junto. `onClose` cobre Esc, o X e o
  // Cancelar — os três passam pelo evento `close` nativo do <dialog>.
  return (
    <dialog
      ref={dialogRef}
      onClose={onClose}
      onCancel={onClose}
      aria-labelledby="admin-login-title"
      className="m-auto w-[min(24rem,calc(100vw-2rem))] rounded-lg border border-border bg-surface p-0 text-text backdrop:bg-black/40"
    >
      <form action={formAction} className="flex flex-col gap-4 p-5">
        <div className="flex items-start justify-between gap-4">
          <h2 id="admin-login-title" className="text-sm font-semibold">
            {t("adminEnterTitle")}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label={t("adminCancel")}
            className="-m-1 flex h-7 w-7 shrink-0 items-center justify-center rounded text-text-muted transition-colors hover:text-text"
          >
            <X className="h-4 w-4" strokeWidth={1.75} aria-hidden="true" />
          </button>
        </div>

        <label className="flex flex-col gap-1.5">
          <span className="text-xs font-medium text-text-muted">
            {t("adminPasswordLabel")}
          </span>
          <input
            name="password"
            type="password"
            autoComplete="current-password"
            autoFocus
            required
            aria-invalid={state.error ? true : undefined}
            aria-describedby={state.error ? "admin-login-error" : undefined}
            className="h-9 rounded-md border border-border bg-bg px-3 text-sm text-text"
          />
        </label>

        {state.error && (
          <p id="admin-login-error" role="alert" className="text-xs text-text-muted">
            {t(ADMIN_ERROR_KEYS[state.error])}
          </p>
        )}

        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="h-9 rounded-md px-3 text-sm text-text-muted transition-colors hover:text-text"
          >
            {t("adminCancel")}
          </button>
          <SubmitButton />
        </div>
      </form>
    </dialog>
  );
}

"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { useFormStatus } from "react-dom";
import { Pencil, Trash2 } from "lucide-react";
import { useLocale } from "@/components/LocaleContext";
import { AppFormDialog } from "@/components/AppFormDialog";
import { deleteAppAction, type AppFormState } from "@/lib/app-actions";
import { APP_ERROR_KEYS } from "@/lib/i18n";
import type { App } from "@/lib/sheets";

const INITIAL: AppFormState = { error: null, ok: false };

function DeleteButton() {
  const { pending } = useFormStatus();
  const { t } = useLocale();

  return (
    <button
      type="submit"
      disabled={pending}
      className="h-9 rounded-md border border-border bg-surface-hover px-4 text-sm font-medium text-text transition-colors hover:bg-border disabled:opacity-60"
    >
      {pending ? t("appDeleting") : t("appDeleteConfirm")}
    </button>
  );
}

function DeleteDialog({
  app,
  open,
  onClose,
}: {
  app: App;
  open: boolean;
  onClose: () => void;
}) {
  const { t } = useLocale();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [state, formAction] = useActionState(deleteAppAction, INITIAL);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  const removeu = state.ok;
  useEffect(() => {
    if (removeu) onClose();
  }, [removeu, onClose]);

  return (
    <dialog
      ref={dialogRef}
      onClose={onClose}
      onCancel={onClose}
      aria-labelledby={`del-title-${app.id}`}
      className="m-auto w-[min(26rem,calc(100vw-2rem))] rounded-lg border border-border bg-surface p-0 text-text backdrop:bg-black/40"
    >
      <form action={formAction} className="flex flex-col gap-4 p-5">
        <input type="hidden" name="id" value={app.id} />

        <h2 id={`del-title-${app.id}`} className="text-sm font-semibold">
          {t("appDeleteConfirmTitle")}
        </h2>
        <p className="text-sm text-text-muted">
          <span className="font-medium text-text">{app.name}</span>
          {" — "}
          {t("appDeleteConfirmBody")}
        </p>

        {state.error && (
          <p role="alert" className="text-xs text-text-muted">
            {t(APP_ERROR_KEYS[state.error])}
          </p>
        )}

        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="h-9 rounded-md px-3 text-sm text-text-muted transition-colors hover:text-text"
          >
            {t("appCancel")}
          </button>
          <DeleteButton />
        </div>
      </form>
    </dialog>
  );
}

/**
 * Editar e remover, sobrepostos ao cartão. Ficam num contêiner próprio, fora
 * do <a> do cartão, senão clicar em "editar" também abriria o link.
 */
export function AppCardAdminControls({ app }: { app: App }) {
  const { t } = useLocale();
  const [editando, setEditando] = useState(false);
  const [removendo, setRemovendo] = useState(false);

  return (
    <>
      <div className="absolute right-2 top-2 flex gap-0.5">
        <button
          type="button"
          onClick={() => setEditando(true)}
          title={t("appEdit")}
          aria-label={`${t("appEdit")} — ${app.name}`}
          className="flex h-7 w-7 items-center justify-center rounded border border-border bg-surface text-text-muted transition-colors hover:bg-surface-hover hover:text-text"
        >
          <Pencil className="h-3.5 w-3.5" strokeWidth={1.75} aria-hidden="true" />
        </button>
        <button
          type="button"
          onClick={() => setRemovendo(true)}
          title={t("appRemove")}
          aria-label={`${t("appRemove")} — ${app.name}`}
          className="flex h-7 w-7 items-center justify-center rounded border border-border bg-surface text-text-muted transition-colors hover:bg-surface-hover hover:text-text"
        >
          <Trash2 className="h-3.5 w-3.5" strokeWidth={1.75} aria-hidden="true" />
        </button>
      </div>

      {editando && (
        <AppFormDialog app={app} open onClose={() => setEditando(false)} />
      )}
      {removendo && (
        <DeleteDialog app={app} open onClose={() => setRemovendo(false)} />
      )}
    </>
  );
}

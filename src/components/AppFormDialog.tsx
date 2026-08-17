"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { useFormStatus } from "react-dom";
import { X } from "lucide-react";
import { useLocale } from "@/components/LocaleContext";
import { IconPicker } from "@/components/IconPicker";
import { saveAppAction, type AppFormState } from "@/lib/app-actions";
import { DEFAULT_ICON } from "@/lib/icon-catalog";
import { APP_LIMITS } from "@/lib/app-schema";
import { APP_ERROR_KEYS } from "@/lib/i18n";
import type { App } from "@/lib/sheets";

const INITIAL: AppFormState = { error: null, ok: false };

function SaveButton() {
  const { pending } = useFormStatus();
  const { t } = useLocale();

  return (
    <button
      type="submit"
      disabled={pending}
      className="h-9 rounded-md border border-border bg-surface-hover px-4 text-sm font-medium text-text transition-colors hover:bg-border disabled:opacity-60"
    >
      {pending ? t("appSaving") : t("appSave")}
    </button>
  );
}

/**
 * Um só formulário serve para criar e editar: quando recebe `app`, manda o `id`
 * junto e a action chama updateApp; sem `id`, createApp.
 */
export function AppFormDialog({
  app,
  open,
  onClose,
}: {
  app?: App;
  open: boolean;
  onClose: () => void;
}) {
  const { t } = useLocale();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [state, formAction] = useActionState(saveAppAction, INITIAL);
  const [icon, setIcon] = useState(app?.icon || DEFAULT_ICON);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  // Salvou: a grade já foi revalidada pela action, então só resta fechar.
  const salvou = state.ok;
  useEffect(() => {
    if (salvou) onClose();
  }, [salvou, onClose]);

  return (
    <dialog
      ref={dialogRef}
      onClose={onClose}
      onCancel={onClose}
      aria-labelledby="app-form-title"
      className="m-auto w-[min(30rem,calc(100vw-2rem))] rounded-lg border border-border bg-surface p-0 text-text backdrop:bg-black/40"
    >
      <form action={formAction} className="flex flex-col gap-4 p-5">
        {app && <input type="hidden" name="id" value={app.id} />}

        <div className="flex items-start justify-between gap-4">
          <h2 id="app-form-title" className="text-sm font-semibold">
            {app ? t("appEditTitle") : t("appNewTitle")}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label={t("appCancel")}
            className="-m-1 flex h-7 w-7 shrink-0 items-center justify-center rounded text-text-muted transition-colors hover:text-text"
          >
            <X className="h-4 w-4" strokeWidth={1.75} aria-hidden="true" />
          </button>
        </div>

        <label className="flex flex-col gap-1.5">
          <span className="text-xs font-medium text-text-muted">{t("appFieldName")}</span>
          <input
            name="name"
            defaultValue={app?.name}
            required
            maxLength={APP_LIMITS.name}
            autoFocus
            className="h-9 rounded-md border border-border bg-bg px-3 text-sm text-text"
          />
        </label>

        <label className="flex flex-col gap-1.5">
          <span className="text-xs font-medium text-text-muted">{t("appFieldUrl")}</span>
          <input
            name="url"
            type="url"
            inputMode="url"
            defaultValue={app?.url}
            required
            maxLength={APP_LIMITS.url}
            placeholder="https://"
            className="h-9 rounded-md border border-border bg-bg px-3 text-sm text-text placeholder:text-text-muted"
          />
        </label>

        <div className="flex flex-col gap-1.5">
          <span className="text-xs font-medium text-text-muted">{t("appFieldIcon")}</span>
          <IconPicker value={icon} onChange={setIcon} />
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <label className="flex flex-col gap-1.5">
            <span className="text-xs font-medium text-text-muted">
              {t("appFieldDescriptionPt")}{" "}
              <span className="font-normal">({t("appOptional")})</span>
            </span>
            <input
              name="description_pt"
              defaultValue={app?.description_pt}
              maxLength={APP_LIMITS.description}
              className="h-9 rounded-md border border-border bg-bg px-3 text-sm text-text"
            />
          </label>

          <label className="flex flex-col gap-1.5">
            <span className="text-xs font-medium text-text-muted">
              {t("appFieldDescriptionEn")}{" "}
              <span className="font-normal">({t("appOptional")})</span>
            </span>
            <input
              name="description_en"
              defaultValue={app?.description_en}
              maxLength={APP_LIMITS.description}
              className="h-9 rounded-md border border-border bg-bg px-3 text-sm text-text"
            />
          </label>
        </div>

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
          <SaveButton />
        </div>
      </form>
    </dialog>
  );
}

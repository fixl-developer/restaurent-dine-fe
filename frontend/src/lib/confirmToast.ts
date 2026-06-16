import { toast } from 'sonner';

interface ConfirmOpts {
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  destructive?: boolean;
}

/**
 * Promise-based confirmation that replaces the browser's blocking `confirm()`.
 * Uses a sonner toast with action + cancel buttons.
 *
 * Example:
 *   if (await confirmToast({ title: `Delete "${name}"?`, destructive: true })) {
 *     await deleteMutation.mutateAsync(id);
 *   }
 */
export function confirmToast(opts: ConfirmOpts | string): Promise<boolean> {
  const config: ConfirmOpts =
    typeof opts === 'string' ? { title: opts } : opts;

  return new Promise((resolve) => {
    let settled = false;
    const settle = (value: boolean) => {
      if (settled) return;
      settled = true;
      resolve(value);
    };

    toast(config.title, {
      description: config.description,
      duration: 12_000,
      className: config.destructive ? 'border-red-200' : undefined,
      action: {
        label: config.confirmLabel ?? (config.destructive ? 'Delete' : 'Confirm'),
        onClick: () => settle(true),
      },
      cancel: {
        label: config.cancelLabel ?? 'Cancel',
        onClick: () => settle(false),
      },
      onDismiss: () => settle(false),
      onAutoClose: () => settle(false),
    });
  });
}

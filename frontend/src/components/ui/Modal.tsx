'use client';
/**
 * Native dialog provides focus containment, Escape, and return-to-trigger behavior.
 * Opens while mounted; used for edit/delete confirmation. Wiki: wiki/Authentication.md.
 */
import { useEffect, useRef, useId, type ReactNode } from 'react';
export function Modal({
  title,
  onClose,
  children,
}: {
  title: string;
  onClose(): void;
  children: ReactNode;
}) {
  const ref = useRef<HTMLDialogElement>(null),
    id = useId();
  useEffect(() => {
    const trigger = document.activeElement as HTMLElement | null;
    const dialog = ref.current;
    dialog?.showModal();
    return () => {
      dialog?.close();
      trigger?.focus();
    };
  }, []);
  return (
    <dialog
      ref={ref}
      onCancel={(e) => {
        e.preventDefault();
        onClose();
      }}
      aria-labelledby={id}
      className="m-auto w-full max-w-lg rounded-xl border border-ruleDark bg-paper p-6 text-ink backdrop:bg-ink/40"
    >
      <h2 id={id} className="mb-5 text-xl font-semibold">
        {title}
      </h2>
      {children}
    </dialog>
  );
}

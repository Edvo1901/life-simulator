/**
 * Shared labeled input with linked help/errors and visible focus.
 * Used by account forms and search. Wiki: wiki/Authentication.md.
 */
import { useId, type InputHTMLAttributes } from 'react';
export function Input({
  label,
  help,
  error,
  ...props
}: InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  help?: string;
  error?: string;
}) {
  const id = useId();
  return (
    <label className="grid gap-2" htmlFor={id}>
      {label}
      <input
        {...props}
        id={id}
        aria-invalid={Boolean(error)}
        aria-describedby={help || error ? id + '-help' : undefined}
        className="w-full rounded border border-ruleDark bg-card px-3 py-2 focus-visible:outline-2 focus-visible:outline-pine"
      />
      {(help || error) && (
        <span
          id={id + '-help'}
          className={error ? 'text-sm text-danger' : 'text-sm text-inkSoft'}
        >
          {error ?? help}
        </span>
      )}
    </label>
  );
}

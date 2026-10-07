/**
 * Shared keyboard-accessible button with consistent palette/disabled states.
 * Used by authentication and account management. Wiki: wiki/Authentication.md.
 */
import type { ButtonHTMLAttributes } from 'react';
export function Button({
  className = '',
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...props}
      className={
        'rounded border border-pine bg-pine px-4 py-2 text-paper hover:bg-pineDark focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pine disabled:cursor-not-allowed disabled:border-rule disabled:bg-paperDark disabled:text-inkSoft ' +
        className
      }
    />
  );
}

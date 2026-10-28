import { WarningCircle } from '@phosphor-icons/react';

// form-level error banner, announced to screen readers
function FormError({ children }) {
    if (!children) return null;

    return (
        <div role="alert" className="flex items-start gap-2.5 rounded-[var(--radius-control)] border border-danger/30 bg-danger/[0.06] px-4 py-3 text-sm text-danger">
            <WarningCircle size={18} weight="fill" className="mt-px shrink-0" aria-hidden="true" />
            <span>{children}</span>
        </div>
    );
}

export default FormError;

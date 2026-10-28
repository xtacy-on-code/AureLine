import { useId, useState } from 'react';

// label above, 16px input (no iOS zoom), error or hint below
function Field({ label, error, hint, type = 'text', className = '', ...inputProps }) {
    const id = useId();
    const [revealed, setRevealed] = useState(false);
    const isPassword = type === 'password';
    const describedBy = error ? `${id}-error` : hint ? `${id}-hint` : undefined;

    return (
        <div className={`flex flex-col gap-2 ${className}`}>
            <label htmlFor={id} className="text-sm font-bold text-ink">
                {label}
            </label>

            <div className="relative">
                <input
                    id={id}
                    type={isPassword && revealed ? 'text' : type}
                    aria-invalid={error ? true : undefined}
                    aria-describedby={describedBy}
                    className={[
                        'w-full h-12 rounded-[var(--radius-control)] bg-paper-raised px-4 text-base text-ink',
                        'border-2 placeholder:text-ink-faint/70 transition-[border-color,box-shadow] duration-150',
                        'focus:outline-none focus-visible:outline-none focus:shadow-[0_0_0_4px_var(--color-mark-yellow)]',
                        error ? 'border-danger' : 'border-ink',
                        isPassword ? 'pr-20' : '',
                    ].join(' ')}
                    {...inputProps}
                />

                {isPassword && (
                    <button
                        type="button"
                        onClick={() => setRevealed(r => !r)}
                        aria-label={revealed ? 'Hide password' : 'Show password'}
                        aria-pressed={revealed}
                        className="absolute right-1.5 top-1/2 -translate-y-1/2 h-9 px-3 rounded-md text-sm text-ink-soft hover-fine:text-ink hover-fine:bg-paper-sunken"
                    >
                        {revealed ? 'Hide' : 'Show'}
                    </button>
                )}
            </div>

            {error ? (
                <p id={`${id}-error`} className="text-sm text-danger">{error}</p>
            ) : hint ? (
                <p id={`${id}-hint`} className="text-sm text-ink-faint">{hint}</p>
            ) : null}
        </div>
    );
}

export default Field;

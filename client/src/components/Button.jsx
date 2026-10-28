import { Link } from 'react-router-dom';

const VARIANTS = {
    primary: 'bg-ink text-paper-raised hover-fine:bg-ink-soft',
    secondary: 'bg-paper-raised text-ink border border-rule-strong hover-fine:border-ink',
    ghost: 'text-ink-soft hover-fine:text-ink hover-fine:bg-paper-sunken',
    danger: 'bg-paper-raised text-danger border border-rule-strong hover-fine:border-danger',
};

const SIZES = {
    md: 'h-11 px-5 text-[15px]',
    sm: 'h-10 px-4 text-sm',
    lg: 'h-13 px-7 text-base',
};

// button, or a router link when `to` is given
function Button({ variant = 'primary', size = 'md', to, className = '', children, ...props }) {
    const classes = [
        'pressable inline-flex items-center justify-center gap-2 rounded-[var(--radius-control)] font-medium whitespace-nowrap select-none',
        'disabled:opacity-45 disabled:cursor-not-allowed',
        VARIANTS[variant],
        SIZES[size],
        className,
    ].join(' ');

    if (to) {
        return <Link to={to} className={classes} {...props}>{children}</Link>;
    }

    return (
        <button type="button" className={classes} {...props}>
            {children}
        </button>
    );
}

export default Button;

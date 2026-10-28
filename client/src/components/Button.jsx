import { Link } from 'react-router-dom';

const VARIANTS = {
    primary: 'press-ink bg-ink text-paper-raised border-2 border-ink',
    secondary: 'press-ink bg-paper-raised text-ink border-2 border-ink',
    ghost: 'pressable text-ink-soft hover-fine:text-ink hover-fine:bg-paper-sunken',
    danger: 'press-ink bg-paper-raised text-danger border-2 border-ink',
};

const SIZES = {
    md: 'h-11 px-5 text-[0.9375rem]',
    sm: 'h-10 px-4 text-sm',
    lg: 'h-13 px-7 text-base',
};

// button, a router link when `to` is given, or a plain link when `href` is
function Button({ variant = 'primary', size = 'md', to, href, className = '', children, ...props }) {
    const classes = [
        'inline-flex items-center justify-center gap-2 rounded-[var(--radius-control)] font-bold whitespace-nowrap select-none',
        'disabled:opacity-45 disabled:cursor-not-allowed',
        VARIANTS[variant],
        SIZES[size],
        className,
    ].join(' ');

    if (to) {
        return <Link to={to} className={classes} {...props}>{children}</Link>;
    }

    if (href) {
        return <a href={href} className={classes} {...props}>{children}</a>;
    }

    return (
        <button type="button" className={classes} {...props}>
            {children}
        </button>
    );
}

export default Button;

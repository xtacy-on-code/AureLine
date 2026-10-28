import { Link } from 'react-router-dom';

// wordmark: "Aure" + "Line" on a tilted yellow sticker
function Logo({ to = '/', size = 'md' }) {
    const text = size === 'lg' ? 'text-[1.9rem]' : 'text-[1.55rem]';

    return (
        <Link
            to={to}
            aria-label="AureLine home"
            translate="no"
            className={`font-display ${text} font-extrabold leading-none tracking-[-0.045em] text-ink inline-flex items-center rounded-sm`}
        >
            Aure
            <span className="ml-0.5 inline-block -rotate-2 rounded-[5px_3px_6px_3px] border-2 border-ink bg-mark-yellow px-1 pb-0.5">
                Line
            </span>
        </Link>
    );
}

export default Logo;

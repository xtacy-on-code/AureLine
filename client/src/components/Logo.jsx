import { Link } from 'react-router-dom';

// wordmark: serif "Aure" + "Line" sitting on a yellow marker stroke
function Logo({ to = '/', size = 'md' }) {
    const text = size === 'lg' ? 'text-[2rem]' : 'text-[1.6rem]';

    return (
        <Link
            to={to}
            aria-label="AureLine home"
            className={`font-serif ${text} leading-none tracking-tight text-ink inline-flex items-baseline rounded-sm`}
        >
            Aure<span className="marker italic">Line</span>
        </Link>
    );
}

export default Logo;

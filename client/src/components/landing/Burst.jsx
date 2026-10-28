// a hand-drawn starburst badge with a short label inside
const POINTS = '50,2 60,20 80,9 78,31 98,35 84,51 97,69 76,70 79,92 60,81 50,98 40,81 21,92 24,70 3,69 16,51 2,35 22,31 20,9 40,20';

function Burst({ children, className = '', color = 'var(--color-pop)' }) {
    return (
        <span className={`relative inline-grid size-24 place-items-center ${className}`} aria-hidden="true">
            <svg viewBox="0 0 100 100" className="absolute inset-0 size-full overflow-visible" style={{ filter: 'url(#wobble)' }}>
                <polygon points={POINTS} fill={color} stroke="var(--color-ink)" strokeWidth="3" strokeLinejoin="round" />
            </svg>
            <span className="relative text-center font-hand text-[1.3rem] font-bold leading-[0.9] text-ink">{children}</span>
        </span>
    );
}

export default Burst;

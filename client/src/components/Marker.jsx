import { useEffect, useRef, useState } from 'react';

// a highlighter stroke behind inline text; with `animate` it sweeps in the
// first time it scrolls into view
function Marker({ tone = 'yellow', animate = false, delay = 0, duration, line = false, className = '', children }) {
    const ref = useRef(null);
    const [drawn, setDrawn] = useState(!animate);

    useEffect(() => {
        if (!animate || !ref.current) return;

        const observer = new IntersectionObserver(([entry]) => {
            if (entry.isIntersecting) {
                setDrawn(true);
                observer.disconnect();
            }
        }, { rootMargin: '0px 0px -12% 0px' });

        observer.observe(ref.current);
        return () => observer.disconnect();
    }, [animate]);

    const style = {};
    if (delay) style['--marker-delay'] = `${delay}ms`;
    if (duration) style['--marker-duration'] = `${duration}ms`;

    return (
        <span
            ref={ref}
            className={`${line ? 'marker-line' : 'marker'} ${className}`}
            data-tone={tone}
            data-animate={animate ? '' : undefined}
            data-drawn={drawn ? 'true' : 'false'}
            style={style}
        >
            {children}
        </span>
    );
}

export default Marker;

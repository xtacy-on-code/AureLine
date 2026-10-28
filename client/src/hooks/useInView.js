import { useEffect, useRef, useState } from 'react';

// true once the element has scrolled into view (and stays true)
export function useInView({ rootMargin = '0px 0px -15% 0px', threshold = 0 } = {}) {
    const ref = useRef(null);
    const [inView, setInView] = useState(false);

    useEffect(() => {
        if (inView || !ref.current) return;
        const observer = new IntersectionObserver(([entry]) => {
            if (entry.isIntersecting) {
                setInView(true);
                observer.disconnect();
            }
        }, { rootMargin, threshold });
        observer.observe(ref.current);
        return () => observer.disconnect();
    }, [inView, rootMargin, threshold]);

    return [ref, inView];
}

export const prefersReducedMotion = () =>
    typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

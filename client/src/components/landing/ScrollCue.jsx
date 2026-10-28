import { useEffect, useRef, useState } from 'react';

// a hand-lettered "scroll down" tag pinned to the bottom of the screen; it
// fades away once the page has been scrolled (watched with a sentinel at the
// top of the page instead of a scroll listener)
function ScrollCue() {
    const sentinelRef = useRef(null);
    const [atTop, setAtTop] = useState(true);

    useEffect(() => {
        if (!sentinelRef.current) return;
        const observer = new IntersectionObserver(([entry]) => setAtTop(entry.isIntersecting));
        observer.observe(sentinelRef.current);
        return () => observer.disconnect();
    }, []);

    return (
        <>
            <div ref={sentinelRef} aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 h-20" />
            <a
                href="#how"
                aria-hidden={!atTop}
                tabIndex={atTop ? 0 : -1}
                className={[
                    'fixed bottom-[max(1.25rem,env(safe-area-inset-bottom))] left-1/2 z-40 flex -translate-x-1/2 items-center gap-2',
                    '-rotate-2 rounded-full border-[2.5px] border-ink bg-mark-yellow py-1.5 pl-4 pr-3 shadow-[var(--shadow-sketch-sm)]',
                    'font-hand text-xl text-ink whitespace-nowrap',
                    'transition-[opacity,translate] duration-300 ease-[var(--ease-out)]',
                    atTop ? 'opacity-100' : 'pointer-events-none translate-y-4 opacity-0',
                ].join(' ')}
            >
                scroll down, the story starts here
                <span className="inline-block motion-safe:animate-[cue-bob_1.4s_var(--ease-in-out)_infinite]" aria-hidden="true">&darr;</span>
            </a>
        </>
    );
}

export default ScrollCue;

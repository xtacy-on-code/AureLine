import { useCallback, useEffect, useRef, useState } from 'react';
import { ArrowCounterClockwise, CheckCircle } from '@phosphor-icons/react';
import { HIGHLIGHT_TYPES } from '../../lib/format';

// the demo page: a scan line reads it, then the highlights draw one by one
const READ_MS = 1700;
const MARK_EVERY_MS = 420;

// paragraphs as runs of plain text and highlighted text (in drawing order via `n`)
const PARAGRAPHS = [
    [
        'The ',
        { n: 0, type: 'definition', text: 'forgetting curve describes how quickly new information fades from memory' },
        ' when it is not reviewed. Hermann Ebbinghaus measured it on himself in 1885, using lists of nonsense syllables.',
    ],
    [
        { n: 1, type: 'key_concept', text: 'Spaced repetition' },
        ' is the practice of reviewing material at increasing intervals. ',
        { n: 2, type: 'important_point', text: 'Each review flattens the curve' },
        ', so less is lost before the next one.',
    ],
    [
        { n: 3, type: 'key_concept', text: 'Active recall' },
        ' beats rereading. Testing yourself on a passage ',
        { n: 4, type: 'important_point', text: 'strengthens memory more than reading it again' },
        ', even when the test feels harder.',
    ],
    [
        'Highlighting alone does little. ',
        { n: 5, type: 'definition', text: 'Encoding is the act of choosing what matters' },
        ' and connecting it to what you already know.',
    ],
];

const MARKS = PARAGRAPHS.flat().filter(run => typeof run !== 'string');

const prefersReducedMotion = () =>
    typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function HeroSheet() {
    const sheetRef = useRef(null);
    const timers = useRef([]);
    const [phase, setPhase] = useState('idle'); // idle -> reading -> marking -> done
    const [drawn, setDrawn] = useState(0);

    const clearTimers = () => {
        timers.current.forEach(clearTimeout);
        timers.current = [];
    };

    const play = useCallback(() => {
        clearTimers();

        if (prefersReducedMotion()) {
            setDrawn(MARKS.length);
            setPhase('done');
            return;
        }

        setDrawn(0);
        setPhase('reading');
        timers.current.push(setTimeout(() => setPhase('marking'), READ_MS));
        MARKS.forEach((_, i) => {
            timers.current.push(setTimeout(() => setDrawn(i + 1), READ_MS + 200 + i * MARK_EVERY_MS));
        });
        timers.current.push(setTimeout(() => setPhase('done'), READ_MS + 200 + MARKS.length * MARK_EVERY_MS + 300));
    }, []);

    // start the first time the sheet is on screen
    useEffect(() => {
        const observer = new IntersectionObserver(([entry]) => {
            if (entry.isIntersecting) {
                play();
                observer.disconnect();
            }
        }, { threshold: 0.35 });

        if (sheetRef.current) observer.observe(sheetRef.current);
        return () => {
            observer.disconnect();
            clearTimers();
        };
    }, [play]);

    const counts = MARKS.slice(0, drawn).reduce((acc, mark) => {
        acc[mark.type] = (acc[mark.type] || 0) + 1;
        return acc;
    }, {});

    return (
        <div className="relative mx-auto w-full max-w-[34rem] lg:max-w-none">
            {/* the page */}
            <div
                ref={sheetRef}
                className="relative overflow-hidden rounded-[var(--radius-sheet)] border border-rule bg-paper-raised shadow-[var(--shadow-sheet)] px-6 pt-6 pb-10 sm:px-10 sm:pt-9 sm:pb-14 md:rotate-[1.2deg]"
            >
                <div className="flex items-center justify-between font-mono text-[11px] uppercase tracking-[0.14em] text-ink-faint">
                    <span>Learning &amp; Memory</span>
                    <span>p. 47</span>
                </div>

                <h3 className="mt-6 font-serif text-[2rem] leading-none tracking-tight text-ink">
                    4. Why we forget
                </h3>

                <div className="mt-5 space-y-4 text-[15px] leading-[1.75] text-ink-soft">
                    {PARAGRAPHS.map((runs, p) => (
                        <p key={p}>
                            {runs.map((run, r) =>
                                typeof run === 'string' ? (
                                    <span key={r}>{run}</span>
                                ) : (
                                    <span
                                        key={r}
                                        className="marker-line text-ink"
                                        data-tone={HIGHLIGHT_TYPES[run.type].tone}
                                        data-animate=""
                                        data-drawn={run.n < drawn ? 'true' : 'false'}
                                        style={{ '--marker-duration': '620ms' }}
                                    >
                                        {run.text}
                                    </span>
                                )
                            )}
                        </p>
                    ))}

                    {/* the rest of the page, out of focus */}
                    <div aria-hidden="true" className="space-y-2.5 pt-1">
                        {[92, 100, 84, 96, 61].map((w, i) => (
                            <div key={i} className="h-2.5 rounded-full bg-paper-sunken" style={{ width: `${w}%` }} />
                        ))}
                    </div>
                </div>

                {/* scanner pass while "reading" */}
                <div
                    aria-hidden="true"
                    className={`pointer-events-none absolute inset-0 ${phase === 'reading' ? 'animate-[scan_1700ms_var(--ease-in-out)_both]' : 'opacity-0'}`}
                >
                    <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-b from-transparent to-mark-yellow/25" />
                    <div className="absolute inset-x-0 bottom-0 h-px bg-ink/60" />
                </div>
            </div>

            {/* status pill */}
            <div
                className="absolute -top-4 right-4 sm:right-8 flex items-center gap-2 rounded-full border border-rule bg-paper-raised px-3.5 h-9 text-[13px] text-ink shadow-[var(--shadow-sheet)]"
                role="status"
            >
                {phase === 'done' ? (
                    <>
                        <CheckCircle size={16} weight="fill" className="text-ink" aria-hidden="true" />
                        <span><span className="font-mono tabular-nums">{MARKS.length}</span> highlights</span>
                    </>
                ) : (
                    <>
                        <span aria-hidden="true" className="relative flex size-2">
                            <span className="absolute inset-0 rounded-full bg-ink animate-ping opacity-40 motion-reduce:hidden" />
                            <span className="relative size-2 rounded-full bg-ink" />
                        </span>
                        <span>{phase === 'marking' ? 'Marking passages' : 'Reading the page'}</span>
                    </>
                )}
            </div>

            {/* legend that counts up as marks land */}
            <div className="relative -mt-8 ml-auto mr-2 w-[15.5rem] rounded-[var(--radius-sheet)] border border-rule bg-paper-raised p-4 shadow-[var(--shadow-sheet)] sm:mr-0 md:-ml-10 md:mr-auto md:-rotate-[1.5deg]">
                <ul className="space-y-2.5">
                    {Object.entries(HIGHLIGHT_TYPES).map(([type, meta]) => (
                        <li key={type} className="flex items-center gap-3 text-sm text-ink">
                            <span className="h-3 w-6 rounded-[3px] mix-blend-multiply" style={{ background: `var(--color-mark-${meta.tone})` }} aria-hidden="true" />
                            <span className="flex-1">{meta.plural}</span>
                            <span className="font-mono tabular-nums text-ink-soft">{counts[type] || 0}</span>
                        </li>
                    ))}
                </ul>
                <button
                    type="button"
                    onClick={play}
                    disabled={phase === 'reading' || phase === 'marking'}
                    className="pressable mt-3 -mb-1 -ml-2 inline-flex h-9 items-center gap-1.5 rounded-md px-2 text-[13px] text-ink-soft hover-fine:text-ink hover-fine:bg-paper-sunken disabled:opacity-0"
                >
                    <ArrowCounterClockwise size={14} aria-hidden="true" />
                    Replay
                </button>
            </div>
        </div>
    );
}

export default HeroSheet;

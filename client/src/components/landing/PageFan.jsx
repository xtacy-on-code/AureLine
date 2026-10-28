import { useInView } from '../../hooks/useInView';
import { HIGHLIGHT_TYPES } from '../../lib/format';

// four kinds of document, each with its own highlights
const PAGES = [
    {
        label: 'lecture notes',
        title: 'Lecture 7: Recursion',
        lines: [
            [{ type: 'definition', text: 'A recursive function calls itself' }, ' on a smaller input.'],
            ['Every recursion needs ', { type: 'important_point', text: 'a base case that stops it' }, '.'],
            ['Without one the call stack overflows.'],
            [{ type: 'key_concept', text: 'Divide and conquer' }, ' splits a problem in halves.'],
        ],
    },
    {
        label: 'research paper',
        title: 'Abstract',
        lines: [
            ['We study sleep and recall in 212 students.'],
            [{ type: 'important_point', text: 'Seven hours of sleep improved recall by 18%' }, '.'],
            ['Effects were strongest for ', { type: 'key_concept', text: 'spaced practice' }, '.'],
            ['Late-night cramming showed no benefit.'],
        ],
    },
    {
        label: 'rental agreement',
        title: 'Clause 4: Deposit',
        lines: [
            [{ type: 'definition', text: 'Security deposit means two months of rent' }, '.'],
            [{ type: 'important_point', text: 'Refunded within 30 days' }, ' of moving out.'],
            ['Normal wear and tear is not deducted.'],
            ['Notice period: one month in writing.'],
        ],
    },
    {
        label: 'history textbook',
        title: 'The Salt March, 1930',
        lines: [
            ['Gandhi walked 385 km from Sabarmati to Dandi.'],
            [{ type: 'key_concept', text: 'Civil disobedience' }, ' against the salt tax.'],
            [{ type: 'important_point', text: 'Over 60,000 people were arrested' }, '.'],
            ['It drew worldwide attention to the movement.'],
        ],
    },
];

// where each page lands when the stack fans out (desktop)
const FAN = [
    { x: '-160%', y: '22px', r: '-8deg' },
    { x: '-54%', y: '-4px', r: '-2.5deg' },
    { x: '54%', y: '-4px', r: '2.5deg' },
    { x: '160%', y: '22px', r: '8deg' },
];

function MiniPage({ page, drawn, index }) {
    return (
        <div className="sketch sketch-thin h-full bg-white px-4 pb-5 pt-4 shadow-[var(--shadow-sheet)]">
            <p className="font-display text-[0.9375rem] font-extrabold leading-tight tracking-[-0.02em] text-ink">{page.title}</p>
            <div className="mt-2 space-y-1.5 text-xs leading-[1.5] text-ink-soft">
                {page.lines.map((line, i) => (
                    <p key={i}>
                        {line.map((run, j) =>
                            typeof run === 'string' ? (
                                <span key={j}>{run}</span>
                            ) : (
                                <span
                                    key={j}
                                    className="marker-line"
                                    data-tone={HIGHLIGHT_TYPES[run.type].tone}
                                    data-animate=""
                                    data-drawn={drawn ? 'true' : 'false'}
                                    style={{ '--marker-delay': `${650 + index * 120 + i * 110}ms`, '--marker-duration': '450ms' }}
                                >
                                    {run.text}
                                </span>
                            )
                        )}
                    </p>
                ))}
            </div>
        </div>
    );
}

// a stack of pages that fans out once it scrolls into view
function PageFan() {
    const [ref, inView] = useInView({ rootMargin: '0px 0px -25% 0px' });

    return (
        <section className="mx-auto max-w-6xl px-4 py-20 sm:px-6 md:py-28">
            <div className="text-center">
                <span className="caption-box">Works on anything</span>
                <h2 className="mx-auto mt-5 max-w-[18ch] font-display text-[clamp(2.4rem,5.5vw,4rem)] font-extrabold leading-[0.92] tracking-[-0.045em] text-ink">
                    Notes, papers, contracts, textbooks.
                </h2>
            </div>

            <div ref={ref} className="mt-14">
                {/* phones and tablets: a simple grid */}
                <ul className="grid grid-cols-2 gap-4 sm:grid-cols-4 lg:hidden">
                    {PAGES.map((page, i) => (
                        <li key={page.label}>
                            <MiniPage page={page} drawn={inView} index={i} />
                            <p className="mt-2 text-center font-hand text-lg text-ink-soft">{page.label}</p>
                        </li>
                    ))}
                </ul>

                {/* desktop: a stack that fans out */}
                <ul className="relative mx-auto hidden h-[19rem] w-[13.5rem] lg:block" aria-label="Example documents">
                    {PAGES.map((page, i) => {
                        const fan = FAN[i];
                        return (
                            <li
                                key={page.label}
                                className="absolute inset-0 transition-transform duration-[900ms] ease-[var(--ease-pop)] motion-reduce:transition-none"
                                style={{
                                    transform: inView
                                        ? `translate(${fan.x}, ${fan.y}) rotate(${fan.r})`
                                        : `translate(${i * 3}px, ${i * -3}px) rotate(${(i - 1.5) * 2}deg)`,
                                    transitionDelay: `${i * 70}ms`,
                                    zIndex: i,
                                }}
                            >
                                <MiniPage page={page} drawn={inView} index={i} />
                                <p
                                    className={`mt-3 text-center font-hand text-xl text-ink-soft transition-opacity duration-300 ${inView ? 'opacity-100' : 'opacity-0'}`}
                                    style={{ transitionDelay: `${700 + i * 80}ms` }}
                                >
                                    {page.label}
                                </p>
                            </li>
                        );
                    })}
                </ul>
            </div>
        </section>
    );
}

export default PageFan;

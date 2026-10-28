import { useState } from 'react';
import { CaretLeft, CaretRight } from '@phosphor-icons/react';
import { HIGHLIGHT_TYPES } from '../../lib/format';

// a page of an economics textbook, as runs of plain and highlighted text
const PAGE = [
    { heading: '5.1 Inflation' },
    [
        { type: 'definition', text: 'Inflation is a sustained rise in the general price level' },
        ' of goods and services over time. When prices rise, each rupee buys less, so the purchasing power of money falls.',
    ],
    [
        'Economists usually measure it with the ',
        { type: 'key_concept', text: 'Consumer Price Index (CPI)' },
        ', which tracks the cost of a fixed basket of everyday goods. In India the CPI is published monthly by the National Statistics Office.',
    ],
    [
        'Moderate inflation is normal in a growing economy. ',
        { type: 'important_point', text: 'The RBI targets 4% CPI inflation, within a band of 2% to 6%' },
        ', and raises the repo rate when prices climb too quickly.',
    ],
    [
        { type: 'definition', text: 'Deflation is a general fall in prices' },
        '. It sounds good but can be harmful, because people delay spending while they wait for prices to drop further.',
    ],
];

function Page({ marked }) {
    return (
        <div className="h-full bg-white px-6 pb-20 pt-7 sm:px-10 sm:pt-9">
            <div className="flex justify-between font-hand text-base uppercase tracking-[0.05em] text-ink-faint">
                <span>Introductory Economics</span>
                <span>p. 112</span>
            </div>
            {PAGE.map((block, i) =>
                block.heading ? (
                    <p key={i} className="mt-4 font-display text-[1.7rem] font-extrabold tracking-[-0.03em] text-ink">{block.heading}</p>
                ) : (
                    <p key={i} className="mt-4 text-[0.9375rem] leading-[1.8] text-ink-soft">
                        {block.map((run, j) =>
                            typeof run === 'string' ? (
                                <span key={j}>{run}</span>
                            ) : (
                                <span key={j} className={marked ? 'marker-line' : ''} data-tone={HIGHLIGHT_TYPES[run.type].tone}>
                                    {run.text}
                                </span>
                            )
                        )}
                    </p>
                )
            )}
        </div>
    );
}

// drag across one page to wipe between the plain and highlighted versions
function BeforeAfter() {
    const [position, setPosition] = useState(55);

    return (
        <section className="border-y-[2.5px] border-ink bg-paper-raised/70">
            <div className="mx-auto grid max-w-6xl items-center gap-12 px-4 py-20 sm:px-6 md:py-28 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16">
                <div>
                    <span className="caption-box">Before / after</span>
                    <h2 className="mt-5 max-w-[14ch] font-display text-[clamp(2.4rem,5.5vw,4rem)] font-extrabold leading-[0.92] tracking-[-0.045em] text-ink">
                        Same page. Way less rereading.
                    </h2>
                    <p className="mt-5 max-w-[30rem] text-lg leading-relaxed text-ink-soft">
                        Drag the handle across the page. On the left it&rsquo;s a wall of text; on the right the parts
                        you&rsquo;ll be tested on jump out.
                    </p>
                    <p className="mt-6 -rotate-1 font-hand text-2xl text-ink-soft">psst, arrow keys work too</p>
                </div>

                <div className="sketch relative overflow-hidden shadow-[var(--shadow-sheet)]">
                    {/* plain page underneath, highlighted page clipped on top */}
                    <Page marked={false} />
                    <div className="absolute inset-0" style={{ clipPath: `inset(0 0 0 ${position}%)` }} aria-hidden="true">
                        <Page marked />
                    </div>

                    {/* labels */}
                    <span className="pointer-events-none absolute bottom-4 left-4 -rotate-2 border-2 border-ink bg-white px-2.5 font-hand text-lg font-bold uppercase" aria-hidden="true">before</span>
                    <span className="pointer-events-none absolute bottom-4 right-4 rotate-2 border-2 border-ink bg-mark-yellow px-2.5 font-hand text-lg font-bold uppercase" aria-hidden="true">after</span>

                    {/* the visible handle follows the slider */}
                    <div className="pointer-events-none absolute inset-y-0 w-[3px] -translate-x-1/2 bg-ink" style={{ left: `${position}%` }} aria-hidden="true">
                        <span className="absolute left-1/2 top-1/2 grid size-11 -translate-x-1/2 -translate-y-1/2 grid-flow-col place-items-center rounded-full border-[2.5px] border-ink bg-mark-yellow shadow-[var(--shadow-sketch-sm)]">
                            <CaretLeft size={14} weight="bold" />
                            <CaretRight size={14} weight="bold" />
                        </span>
                    </div>

                    {/* a real range input across the whole page: drag, tap or use the keyboard */}
                    <input
                        type="range"
                        min="0"
                        max="100"
                        step="1"
                        value={position}
                        onChange={(e) => setPosition(Number(e.target.value))}
                        aria-label="Compare the plain page with the highlighted page"
                        aria-valuetext={`${100 - position}% highlighted`}
                        className="peer absolute inset-0 z-10 size-full cursor-ew-resize appearance-none bg-transparent opacity-0"
                    />
                    <span className="pointer-events-none absolute inset-0 z-20 rounded-[inherit] peer-focus-visible:outline peer-focus-visible:outline-[3px] peer-focus-visible:-outline-offset-[6px] peer-focus-visible:outline-ink" aria-hidden="true" />
                </div>
            </div>
        </section>
    );
}

export default BeforeAfter;

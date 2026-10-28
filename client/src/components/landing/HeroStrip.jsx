import { ArrowRight, ArrowDown } from '@phosphor-icons/react';
import Button from '../Button';
import Marker from '../Marker';
import Burst from './Burst';
import { HIGHLIGHT_TYPES } from '../../lib/format';

// the page in panel two, as runs of plain and highlighted text
const PAGE = [
    'The ',
    { type: 'definition', text: 'forgetting curve shows how fast new information fades', delay: 900 },
    ' when it isn’t reviewed. ',
    { type: 'key_concept', text: 'Spaced repetition', delay: 1350 },
    ' reviews it at growing intervals, and ',
    { type: 'important_point', text: 'each review flattens the curve', delay: 1800 },
    ', so less is lost before the next one.',
];

// two comic panels: the pitch, and a page getting highlighted
function HeroStrip({ startTo }) {
    return (
        <section className="mx-auto grid max-w-6xl gap-5 px-4 pb-20 pt-6 sm:px-6 md:pt-10 lg:grid-cols-[1.1fr_1fr] lg:gap-6 lg:pb-28">
            {/* panel 1: the pitch */}
            <div className="rise-in sketch bg-paper-raised p-6 shadow-[var(--shadow-sheet)] sm:p-10">
                <span className="caption-box">Meanwhile, the night before the exam&hellip;</span>

                <h1 className="mt-7 font-display text-[clamp(3rem,7.5vw,5.6rem)] font-extrabold leading-[0.88] tracking-[-0.05em] text-ink">
                    Read less.{' '}
                    <Marker line animate delay={350} duration={800} className="marker-display">Remember more.</Marker>
                </h1>

                <p className="mt-7 max-w-[34rem] text-lg leading-relaxed text-ink-soft">
                    Drop in a PDF. AureLine reads every page and marks the definitions, key concepts and
                    important points right on the page, then hands you the highlighted file.
                </p>

                <div className="mt-9 flex flex-wrap items-center gap-3">
                    <Button to={startTo} size="lg">
                        Highlight a PDF
                        <ArrowRight size={18} weight="bold" aria-hidden="true" />
                    </Button>
                    <Button href="#try" variant="secondary" size="lg">
                        Try it here
                        <ArrowDown size={18} weight="bold" aria-hidden="true" />
                    </Button>
                </div>

                <p className="mt-6 font-hand text-xl text-ink-faint">free &middot; PDFs up to 4 MB &middot; your files stay private</p>
            </div>

            {/* panel 2: the page being highlighted */}
            <div className="rise-in sketch relative flex flex-col justify-center bg-paper-raised p-6 pt-8 shadow-[var(--shadow-sheet)] sm:p-9 lg:rotate-[0.8deg]" style={{ '--i': 2 }} aria-label="Example: a page being highlighted">
                <Burst className="absolute -right-3 -top-7 rotate-[10deg] sm:-right-5">10 sec<br />flat!</Burst>

                <span className="bubble rise-in" style={{ '--i': 6 }}>Wait&hellip; it found the exact words?!</span>

                <div className="relative mt-7 rounded-[6px] border-2 border-ink bg-white px-5 pb-8 pt-5 sm:px-6">
                    <div className="flex items-center justify-between font-hand text-base uppercase tracking-[0.05em] text-ink-faint">
                        <span>Learning &amp; memory</span>
                        <span>p. 47</span>
                    </div>
                    <p className="mt-3 font-display text-2xl font-extrabold tracking-[-0.03em] text-ink">4. Why we forget</p>
                    <p className="mt-3 text-[15px] leading-[1.8] text-ink-soft">
                        {PAGE.map((run, i) =>
                            typeof run === 'string' ? (
                                <span key={i}>{run}</span>
                            ) : (
                                <Marker key={i} line animate delay={run.delay} duration={550} tone={HIGHLIGHT_TYPES[run.type].tone}>
                                    {run.text}
                                </Marker>
                            )
                        )}
                    </p>
                    <span className="sfx absolute -bottom-5 right-4 text-[2.4rem]" data-play="true" style={{ '--sfx-delay': '2300ms', '--sfx-rotate': '-9deg' }} aria-hidden="true">
                        swipe!
                    </span>
                </div>

                <ul className="mt-8 flex flex-wrap gap-x-5 gap-y-2 text-sm font-semibold text-ink">
                    {Object.values(HIGHLIGHT_TYPES).map(meta => (
                        <li key={meta.tone} className="flex items-center gap-2">
                            <span className="h-3 w-6 rounded-[3px] border-2 border-ink" style={{ background: `var(--color-mark-${meta.tone})` }} aria-hidden="true" />
                            {meta.plural}
                        </li>
                    ))}
                </ul>
            </div>
        </section>
    );
}

export default HeroStrip;

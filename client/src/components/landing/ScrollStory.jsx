import { useEffect, useRef, useState } from 'react';
import { FilePdf } from '@phosphor-icons/react';
import { HIGHLIGHT_TYPES } from '../../lib/format';

const STEPS = [
    {
        title: 'Drop in a PDF',
        body: 'Lecture notes, a research paper, a contract, the chapter due Monday. Anything up to 4 MB.',
        note: 'plop.',
    },
    {
        title: 'It reads every page',
        body: 'AureLine pulls the text off each page, even long ones, and keeps track of where every word sits.',
        note: 'reading…',
    },
    {
        title: 'It picks what matters',
        body: 'The AI chooses up to ten passages worth keeping and sorts them into definitions, key concepts and important points.',
        note: 'hmm, this one.',
    },
    {
        title: 'Marks land on the exact words',
        body: 'Highlights are drawn on your original PDF, on the words themselves. Download it, or open it again from your library.',
        note: 'done!',
    },
];

// the pinned document; `step` decides how far along it is
const LINES = [
    { text: 'Photosynthesis turns light energy into chemical energy', type: 'definition' },
    { text: 'and happens inside the chloroplasts of plant cells.' },
    { text: 'Chlorophyll absorbs mostly red and blue light', type: 'key_concept' },
    { text: 'which is why leaves look green to us.' },
    { text: 'The light reactions split water and release oxygen.' },
    { text: 'The Calvin cycle fixes carbon dioxide into sugar', type: 'important_point' },
    { text: 'using the ATP and NADPH made in the light reactions.' },
];

function StoryDoc({ step }) {
    return (
        <div className="relative mx-auto w-full max-w-[26rem]">
            {/* the file card that "drops in" on step 0 */}
            <div
                className={`absolute -left-3 -top-6 z-10 flex items-center gap-2 rounded-[8px] border-2 border-ink bg-mark-yellow px-3 py-1.5 shadow-[var(--shadow-sketch-sm)] transition-[transform,opacity] duration-500 ease-[var(--ease-pop)] ${step >= 0 ? 'translate-y-0 -rotate-6 opacity-100' : '-translate-y-6 opacity-0'}`}
                aria-hidden="true"
            >
                <FilePdf size={20} weight="bold" />
                <span className="text-sm font-bold">biology-ch3.pdf</span>
            </div>

            <div className="sketch relative overflow-hidden bg-white px-6 pb-9 pt-8 shadow-[var(--shadow-sheet)]">
                <p className="font-display text-xl font-extrabold tracking-[-0.03em] text-ink">3.2 Photosynthesis</p>

                <div className="mt-4 space-y-2.5 text-[0.90625rem] leading-[1.5] text-ink-soft">
                    {LINES.map((line, i) => {
                        const meta = line.type ? HIGHLIGHT_TYPES[line.type] : null;
                        const picked = meta && step >= 2;
                        const marked = meta && step >= 3;
                        return (
                            <p key={i} className="relative">
                                <span
                                    className="marker-line"
                                    data-tone={meta?.tone}
                                    data-animate=""
                                    data-drawn={marked ? 'true' : 'false'}
                                    style={{ '--marker-delay': `${i * 90}ms`, '--marker-duration': '600ms', ...(meta ? {} : { backgroundImage: 'none' }) }}
                                >
                                    {line.text}
                                </span>
                                {/* step 2: dashed "picked" boxes before the ink goes down */}
                                {meta && (
                                    <span
                                        aria-hidden="true"
                                        className={`pointer-events-none absolute -inset-x-1.5 -inset-y-0.5 rounded-md border-2 border-dashed border-ink transition-opacity duration-300 ${picked && !marked ? 'opacity-100' : 'opacity-0'}`}
                                    />
                                )}
                            </p>
                        );
                    })}
                </div>

                {/* step 1: a scan line sweeps down the page */}
                <div
                    aria-hidden="true"
                    className={`pointer-events-none absolute inset-x-0 top-0 h-full ${step === 1 ? 'motion-safe:animate-[story-scan_1600ms_var(--ease-in-out)_both]' : 'opacity-0'}`}
                >
                    <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-b from-transparent to-mark-blue/40" />
                    <div className="absolute inset-x-0 bottom-0 h-[2.5px] bg-ink" />
                </div>
            </div>

            <span
                className="sfx absolute -bottom-6 right-2 text-[2.2rem]"
                data-play={step >= 0 ? 'true' : 'false'}
                key={step}
                aria-hidden="true"
                style={{ '--sfx-rotate': step % 2 ? '7deg' : '-8deg' }}
            >
                {STEPS[Math.max(step, 0)].note}
            </span>
        </div>
    );
}

// how it works, told as you scroll: steps on one side, the document pinned on the other
function ScrollStory() {
    const [step, setStep] = useState(0);
    const stepRefs = useRef([]);

    useEffect(() => {
        const observer = new IntersectionObserver((entries) => {
            for (const entry of entries) {
                if (entry.isIntersecting) setStep(Number(entry.target.dataset.step));
            }
        }, { rootMargin: '-45% 0px -45% 0px' });

        stepRefs.current.forEach(el => el && observer.observe(el));
        return () => observer.disconnect();
    }, []);

    return (
        <section id="how" className="scroll-mt-6 border-y-[2.5px] border-ink bg-paper-raised/70">
            <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6 md:py-28">
                <span className="caption-box">How it works</span>
                <h2 className="mt-5 max-w-[16ch] font-display text-[clamp(2.4rem,5.5vw,4rem)] font-extrabold leading-[0.92] tracking-[-0.045em] text-ink">
                    Four panels, about ten seconds.
                </h2>

                <div className="mt-12 grid gap-10 md:grid-cols-[1fr_1fr] md:gap-16">
                    {/* pinned document: top of the screen on phones, beside the steps on desktop */}
                    <div className="sticky top-0 z-10 order-1 -mx-4 self-start bg-paper px-4 pb-2 pt-8 shadow-[0_10px_12px_-10px_rgb(34_37_43/0.25)] sm:-mx-6 sm:px-6 md:order-2 md:top-[calc(50vh-11rem)] md:mx-0 md:bg-transparent md:px-0 md:py-4 md:shadow-none">
                        <div className="origin-top scale-[0.82] sm:scale-100">
                            <StoryDoc step={step} />
                        </div>
                    </div>

                    <ol className="order-2 md:order-1">
                        {STEPS.map((s, i) => (
                            <li
                                key={s.title}
                                ref={el => (stepRefs.current[i] = el)}
                                data-step={i}
                                className={`flex min-h-[55vh] flex-col justify-center transition-opacity duration-300 md:min-h-[70vh] ${step === i ? 'opacity-100' : 'opacity-35'}`}
                            >
                                <span className="font-hand text-2xl text-ink-faint">panel {i + 1}</span>
                                <h3 className="mt-1 font-display text-3xl font-extrabold tracking-[-0.035em] text-ink">{s.title}</h3>
                                <p className="mt-3 max-w-[32rem] text-lg leading-relaxed text-ink-soft">{s.body}</p>
                            </li>
                        ))}
                    </ol>
                </div>
            </div>
        </section>
    );
}

export default ScrollStory;

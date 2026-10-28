import { useState } from 'react';
import { ThinkingOrb } from 'thinking-orbs';
import { ArrowRight, Sparkle } from '@phosphor-icons/react';
import { apiRequest } from '../../lib/api';
import { HIGHLIGHT_TYPES } from '../../lib/format';
import Button from '../Button';
import FormError from '../FormError';

const MAX_CHARS = 2500;

const SAMPLES = {
    Biology: 'Enzymes are proteins that speed up chemical reactions without being used up. Each enzyme has an active site, a pocket whose shape fits one particular substrate. When the substrate binds, the enzyme lowers the activation energy needed for the reaction to start. Enzymes work best at an optimum temperature and pH; too much heat changes the shape of the active site, which is called denaturation, and the enzyme stops working.',
    History: 'The Green Revolution was a period of rapid growth in agricultural output in India during the late 1960s and 1970s. It combined high-yielding varieties of wheat and rice with irrigation, chemical fertilisers and pesticides. Punjab, Haryana and western Uttar Pradesh saw the largest gains, and India moved from food shortages to self-sufficiency in grains. Critics point to falling groundwater levels and widening gaps between large and small farmers.',
    Contract: 'The tenant shall pay a security deposit equal to two months of rent before moving in. The deposit will be refunded within 30 days of the end of the lease, minus the cost of repairing any damage beyond normal wear and tear. Either party may end this agreement by giving one month of written notice. The tenant may not sublet the flat without the landlord’s written permission. Rent is due on the fifth day of each month.',
};

// split the text into plain runs and highlighted runs from the server's offsets
const toRuns = (text, highlights) => {
    const runs = [];
    let cursor = 0;
    for (const h of highlights) {
        if (h.start > cursor) runs.push({ text: text.slice(cursor, h.start) });
        runs.push({ text: text.slice(h.start, h.end), type: h.type });
        cursor = h.end;
    }
    if (cursor < text.length) runs.push({ text: text.slice(cursor) });
    return runs;
};

// paste a paragraph, get it highlighted by the real AI, no account needed
function TryItLive({ startTo }) {
    const [text, setText] = useState(SAMPLES.Biology);
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const run = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            const data = await apiRequest('/api/demo/highlight', { method: 'POST', body: { text } });
            setResult(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const pickSample = (name) => {
        setText(SAMPLES[name]);
        setResult(null);
        setError('');
    };

    const counts = (result?.highlights || []).reduce((acc, h) => {
        acc[h.type] = (acc[h.type] || 0) + 1;
        return acc;
    }, {});

    return (
        <section id="try" className="scroll-mt-6 mx-auto max-w-6xl px-4 py-20 sm:px-6 md:py-28">
            <div className="flex flex-wrap items-end justify-between gap-4">
                <div>
                    <span className="caption-box">Try it right here</span>
                    <h2 className="mt-5 max-w-[18ch] font-display text-[clamp(2.4rem,5.5vw,4rem)] font-extrabold leading-[0.92] tracking-[-0.045em] text-ink">
                        Paste a paragraph. Watch it get marked.
                    </h2>
                </div>
                <p className="max-w-[22rem] font-hand text-2xl leading-tight text-ink-soft">no sign up, this is the real AI &rarr;</p>
            </div>

            <div className="mt-10 grid gap-6 lg:grid-cols-2">
                {/* input panel */}
                <form onSubmit={run} className="sketch flex flex-col gap-4 bg-paper-raised p-5 shadow-[var(--shadow-sheet)] sm:p-7">
                    <div className="flex flex-wrap items-center gap-2" role="group" aria-label="Sample paragraphs">
                        <span className="mr-1 font-hand text-xl text-ink-faint">samples:</span>
                        {Object.keys(SAMPLES).map(name => (
                            <button
                                key={name}
                                type="button"
                                onClick={() => pickSample(name)}
                                aria-pressed={text === SAMPLES[name]}
                                className="pressable h-9 rounded-full border-2 border-ink px-3.5 text-sm font-semibold aria-pressed:bg-mark-yellow hover-fine:bg-paper-sunken aria-pressed:hover-fine:bg-mark-yellow"
                            >
                                {name}
                            </button>
                        ))}
                    </div>

                    <label htmlFor="try-text" className="text-sm font-bold text-ink">Your paragraph</label>
                    <textarea
                        id="try-text"
                        name="text"
                        value={text}
                        onChange={(e) => { setText(e.target.value); setResult(null); }}
                        maxLength={MAX_CHARS}
                        rows={9}
                        autoComplete="off"
                        className="min-h-[14rem] w-full resize-y rounded-[var(--radius-control)] border-2 border-ink bg-white px-4 py-3 text-base leading-relaxed text-ink focus:shadow-[0_0_0_4px_var(--color-mark-yellow)] focus:outline-none focus-visible:outline-none"
                    />
                    <div className="flex flex-wrap items-center justify-between gap-3">
                        <span className="text-sm text-ink-faint tabular-nums">{text.length} / {MAX_CHARS}</span>
                        <Button type="submit" disabled={loading || text.trim().length < 80}>
                            {loading ? 'Highlighting…' : <>Highlight it <Sparkle size={16} weight="fill" aria-hidden="true" /></>}
                        </Button>
                    </div>
                    <FormError>{error}</FormError>
                </form>

                {/* result panel */}
                <div className="sketch relative bg-white p-5 shadow-[var(--shadow-sheet)] sm:p-7" aria-live="polite">
                    {loading ? (
                        <div className="flex h-full min-h-[16rem] flex-col items-center justify-center gap-4 text-center">
                            <ThinkingOrb state="searching" size={64} theme="light" aria-hidden="true" />
                            <p className="font-hand text-2xl text-ink">reading your paragraph&hellip;</p>
                        </div>
                    ) : result ? (
                        <>
                            <p className="text-[16px] leading-[1.85] text-ink-soft">
                                {toRuns(result.text, result.highlights).map((r, i) =>
                                    r.type ? (
                                        <span
                                            key={i}
                                            className="marker-line rise-in"
                                            data-tone={HIGHLIGHT_TYPES[r.type]?.tone}
                                            style={{ '--i': i }}
                                            title={HIGHLIGHT_TYPES[r.type]?.label}
                                        >
                                            {r.text}
                                        </span>
                                    ) : (
                                        <span key={i}>{r.text}</span>
                                    )
                                )}
                            </p>
                            <div className="mt-6 flex flex-wrap items-center justify-between gap-4 border-t-2 border-dashed border-ink/25 pt-5">
                                <ul className="flex flex-wrap gap-x-4 gap-y-1.5 text-sm font-semibold text-ink">
                                    {Object.entries(HIGHLIGHT_TYPES).map(([type, meta]) => (
                                        <li key={type} className="flex items-center gap-2">
                                            <span className="h-3 w-5 rounded-[3px] border-2 border-ink" style={{ background: `var(--color-mark-${meta.tone})` }} aria-hidden="true" />
                                            {meta.plural} <span className="tabular-nums text-ink-faint">{counts[type] || 0}</span>
                                        </li>
                                    ))}
                                </ul>
                                <Button to={startTo} variant="secondary" size="sm">
                                    Do this to a whole PDF
                                    <ArrowRight size={15} weight="bold" aria-hidden="true" />
                                </Button>
                            </div>
                            <span className="sfx absolute -right-2 -top-6 text-[2.4rem]" data-play="true" style={{ '--sfx-rotate': '8deg', '--sfx-delay': '300ms' }} aria-hidden="true">ta-da!</span>
                        </>
                    ) : (
                        <div className="flex h-full min-h-[16rem] flex-col items-center justify-center gap-3 text-center">
                            <span className="bubble" data-tail="right">press the button, I&rsquo;ll mark the good bits</span>
                            <p className="mt-4 max-w-[22rem] text-sm text-ink-faint">
                                Up to 2,500 characters. Sign up to highlight whole PDFs and keep them in your library.
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </section>
    );
}

export default TryItLive;

import { useSearchParams } from 'react-router-dom';
import { HIGHLIGHT_TYPES } from '../../lib/format';

// filter chips plus the list of highlights; picking one jumps to its page
function HighlightList({ highlights, onPick }) {
    // the filter lives in the URL (?type=definition) so it survives refresh and can be shared
    const [searchParams, setSearchParams] = useSearchParams();
    const requested = searchParams.get('type');
    const filter = HIGHLIGHT_TYPES[requested] ? requested : 'all';

    const setFilter = (type) => {
        setSearchParams(params => {
            if (type === 'all') params.delete('type');
            else params.set('type', type);
            return params;
        }, { replace: true });
    };

    const counts = highlights.reduce((acc, h) => {
        acc[h.type] = (acc[h.type] || 0) + 1;
        return acc;
    }, {});

    const visible = filter === 'all' ? highlights : highlights.filter(h => h.type === filter);

    const chips = [
        { key: 'all', label: 'All', count: highlights.length },
        ...Object.entries(HIGHLIGHT_TYPES)
            .filter(([type]) => counts[type])
            .map(([type, meta]) => ({ key: type, label: meta.plural, count: counts[type], tone: meta.tone })),
    ];

    if (highlights.length === 0) {
        return <p className="text-sm text-ink-soft">No highlights were found in this document.</p>;
    }

    return (
        <div>
            <div className="flex flex-wrap gap-2" role="group" aria-label="Filter highlights">
                {chips.map(chip => (
                    <button
                        key={chip.key}
                        type="button"
                        aria-pressed={filter === chip.key}
                        onClick={() => setFilter(chip.key)}
                        className={[
                            'pressable inline-flex h-9 items-center gap-2 rounded-full border px-3.5 text-sm',
                            filter === chip.key
                                ? 'border-ink bg-ink text-paper-raised'
                                : 'border-rule-strong bg-paper-raised text-ink-soft hover-fine:border-ink hover-fine:text-ink',
                        ].join(' ')}
                    >
                        {chip.tone && (
                            <span className="h-2.5 w-3.5 rounded-[2px]" style={{ background: `var(--color-mark-${chip.tone})` }} aria-hidden="true" />
                        )}
                        {chip.label}
                        <span className={`font-mono text-xs tabular-nums ${filter === chip.key ? 'text-paper-raised/70' : 'text-ink-faint'}`}>{chip.count}</span>
                    </button>
                ))}
            </div>

            <ul className="mt-5 divide-y divide-rule border-y border-rule">
                {visible.map((h, i) => {
                    const meta = HIGHLIGHT_TYPES[h.type] || HIGHLIGHT_TYPES.definition;
                    const found = Boolean(h.page);

                    return (
                        <li key={`${h.text}-${i}`}>
                            <button
                                type="button"
                                disabled={!found}
                                onClick={() => onPick(h)}
                                className="group grid w-full grid-cols-[4px_1fr] gap-x-3.5 py-4 text-left disabled:cursor-default"
                            >
                                <span className="rounded-full" style={{ background: `var(--color-mark-${meta.tone})` }} aria-hidden="true" />
                                <span className="min-w-0">
                                    <span className="flex items-center justify-between gap-3 font-mono text-[11px] uppercase tracking-[0.12em] text-ink-faint">
                                        {meta.label}
                                        <span className="normal-case tracking-normal tabular-nums">
                                            {found ? `p. ${h.page}` : 'not on page'}
                                        </span>
                                    </span>
                                    <span className={`mt-1.5 block text-[15px] leading-relaxed ${found ? 'text-ink group-hover:underline group-hover:decoration-rule-strong group-hover:underline-offset-4' : 'text-ink-faint'}`}>
                                        {h.text}
                                    </span>
                                </span>
                            </button>
                        </li>
                    );
                })}
            </ul>
        </div>
    );
}

export default HighlightList;

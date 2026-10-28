import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ThinkingOrb } from 'thinking-orbs';
import { ArrowLeft, Check, FilePdf, UploadSimple, X } from '@phosphor-icons/react';
import { useApi } from '../hooks/useApi';
import { formatBytes } from '../lib/format';
import AppBar from '../components/AppBar';
import Button from '../components/Button';
import FormError from '../components/FormError';

const MAX_BYTES = 4 * 1024 * 1024;

// the server doesn't stream progress, so stages advance on a rough clock
const STAGES = [
    { label: 'Reading every page', orb: 'searching', after: 0 },
    { label: 'Picking what matters', orb: 'solving', after: 2500 },
    { label: 'Marking the exact words', orb: 'composing', after: 6000 },
];

const checkFile = (file) => {
    const isPdf = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
    if (!isPdf) return 'That is not a PDF. Please choose a .pdf file.';
    if (file.size > MAX_BYTES) return `This PDF is ${formatBytes(file.size)}. Please upload a file under 4 MB.`;
    return '';
};

function Processing({ file }) {
    const [stage, setStage] = useState(0);

    useEffect(() => {
        const timers = STAGES.slice(1).map((s, i) => setTimeout(() => setStage(i + 1), s.after));
        return () => timers.forEach(clearTimeout);
    }, []);

    return (
        <div className="rise-in sketch bg-paper-raised px-6 py-10 shadow-[var(--shadow-sheet)] sm:px-10 sm:py-12">
            <div className="flex items-center gap-5">
                <ThinkingOrb state={STAGES[stage].orb} size={64} theme="light" aria-hidden="true" />
                <div className="min-w-0">
                    <p className="text-lg font-medium text-ink" role="status">{STAGES[stage].label}…</p>
                    <p className="mt-1 truncate text-sm text-ink-faint">{file.name}</p>
                </div>
            </div>

            <ol className="mt-9 space-y-3.5 border-t border-rule pt-7">
                {STAGES.map((s, i) => (
                    <li key={s.label} className={`flex items-center gap-3 text-[15px] transition-colors duration-200 ${i <= stage ? 'text-ink' : 'text-ink-faint'}`}>
                        <span className={`grid size-6 place-items-center rounded-full border transition-colors duration-200 ${i < stage ? 'border-ink bg-ink text-paper-raised' : i === stage ? 'border-ink' : 'border-rule-strong'}`}>
                            {i < stage ? <Check size={13} weight="bold" aria-hidden="true" /> : <span className="text-[11px]">{i + 1}</span>}
                        </span>
                        {s.label}
                    </li>
                ))}
            </ol>

            <p className="mt-8 text-sm text-ink-faint">Usually 5 to 15 seconds. Keep this tab open.</p>
        </div>
    );
}

function Upload() {
    const [file, setFile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [isDragging, setIsDragging] = useState(false);

    const api = useApi();
    const navigate = useNavigate();
    const fileInputRef = useRef(null);

    const choose = (candidate) => {
        if (!candidate) return;
        const problem = checkFile(candidate);
        setError(problem);
        setFile(problem ? null : candidate);
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = (e) => {
        // ignore leaving into a child element
        if (e.currentTarget.contains(e.relatedTarget)) return;
        setIsDragging(false);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setIsDragging(false);
        choose(e.dataTransfer?.files?.[0]);
    };

    const clearFile = () => {
        setFile(null);
        setError('');
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const handleUpload = async (e) => {
        e.preventDefault();
        if (!file) return;
        setError('');
        setLoading(true);

        try {
            const formData = new FormData();
            formData.append('pdf', file);
            const data = await api('/api/upload', { method: 'POST', form: formData });
            navigate(`/doc/${data.documentId}`);
        } catch (err) {
            setLoading(false);
            if (err.status !== 401) setError(err.message);
        }
    };

    return (
        <div className="min-h-[100dvh]">
            <AppBar>
                <Button to="/dashboard" variant="ghost" size="sm">
                    <ArrowLeft size={16} aria-hidden="true" />
                    Library
                </Button>
            </AppBar>

            <main id="main" className="mx-auto max-w-2xl px-4 pb-[max(4rem,env(safe-area-inset-bottom))] pt-10 sm:px-6 md:pt-16">
                <h1 className="font-display text-4xl font-extrabold tracking-[-0.045em] text-ink md:text-5xl">Highlight a PDF</h1>
                <p className="mt-2 text-base text-ink-soft">
                    AureLine reads every page and marks the definitions, key concepts and important points.
                </p>

                <div className="mt-9">
                    {loading ? (
                        <Processing file={file} />
                    ) : (
                        <form onSubmit={handleUpload} className="flex flex-col gap-5">
                            <FormError>{error}</FormError>

                            <input
                                type="file"
                                accept="application/pdf,.pdf"
                                ref={fileInputRef}
                                onChange={(e) => choose(e.target.files?.[0])}
                                className="sr-only"
                                tabIndex={-1}
                                aria-hidden="true"
                            />

                            {file ? (
                                <div className="rise-in sketch flex items-center gap-4 bg-paper-raised p-5 shadow-[var(--shadow-sheet)]">
                                    <span className="grid size-12 shrink-0 place-items-center rounded-[var(--radius-control)] bg-mark-yellow/50">
                                        <FilePdf size={26} className="text-ink" aria-hidden="true" />
                                    </span>
                                    <span className="min-w-0 flex-1">
                                        <span className="block truncate font-medium text-ink">{file.name}</span>
                                        <span className="mt-0.5 block text-sm text-ink-faint tabular-nums">{formatBytes(file.size)}</span>
                                    </span>
                                    <button
                                        type="button"
                                        onClick={clearFile}
                                        aria-label="Remove file"
                                        className="pressable grid size-11 shrink-0 place-items-center rounded-[var(--radius-control)] text-ink-soft hover-fine:bg-paper-sunken hover-fine:text-ink"
                                    >
                                        <X size={18} aria-hidden="true" />
                                    </button>
                                </div>
                            ) : (
                                <button
                                    type="button"
                                    onClick={() => fileInputRef.current?.click()}
                                    onDragOver={handleDragOver}
                                    onDragLeave={handleDragLeave}
                                    onDrop={handleDrop}
                                    className={[
                                        'group flex min-h-[18rem] w-full flex-col items-center justify-center rounded-[var(--radius-sheet)] border-[2.5px] border-dashed px-6 py-12 text-center',
                                        'transition-[background-color,border-color] duration-200',
                                        isDragging
                                            ? 'border-ink bg-mark-yellow/25'
                                            : 'border-ink/50 bg-paper-raised/70 hover-fine:border-ink hover-fine:bg-paper-raised',
                                    ].join(' ')}
                                >
                                    <span className={`grid size-14 place-items-center rounded-full border-2 border-ink bg-mark-yellow transition-transform duration-200 ease-[var(--ease-out)] ${isDragging ? '-translate-y-1' : ''}`}>
                                        <UploadSimple size={24} className="text-ink" aria-hidden="true" />
                                    </span>
                                    <span className="mt-5 text-lg font-medium text-ink">
                                        {isDragging ? 'Drop it here' : 'Drop a PDF here'}
                                    </span>
                                    <span className="mt-1 text-base text-ink-soft">
                                        or <span className="underline decoration-rule-strong underline-offset-4 group-hover:decoration-ink">browse your files</span>
                                    </span>
                                    <span className="mt-5 font-hand text-[15px] uppercase tracking-[0.05em] text-ink-faint">PDF · up to 4 MB</span>
                                </button>
                            )}

                            <Button type="submit" size="lg" className="w-full sm:w-auto sm:self-end" disabled={!file}>
                                Highlight it
                            </Button>
                        </form>
                    )}
                </div>
            </main>
        </div>
    );
}

export default Upload;

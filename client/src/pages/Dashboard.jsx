import { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FilePdf, Plus, SignOut, Trash, ArrowRight } from '@phosphor-icons/react';
import { useAuth } from '../context/auth';
import { useApi } from '../hooks/useApi';
import { formatDate, plural } from '../lib/format';
import AppBar from '../components/AppBar';
import Button from '../components/Button';
import FormError from '../components/FormError';

const ROW_GRID = 'grid grid-cols-[1fr_auto] md:grid-cols-[minmax(0,1fr)_6rem_7rem_8.5rem_3rem] items-center gap-x-4';

// uploads from before PDFs were saved never left "processing", so anything
// still processing after this long has no file to open
const STALE_PROCESSING_MS = 10 * 60 * 1000;

const BADGES = {
    failed: { label: 'Failed', styles: 'border-danger/30 text-danger' },
    processing: { label: 'Processing', styles: 'border-rule-strong text-ink-soft' },
    unsaved: { label: 'Not saved', styles: 'border-rule text-ink-faint' },
};

function StatusBadge({ doc }) {
    if (doc.status === 'completed') return null;

    const badge = BADGES[doc.stale ? 'unsaved' : doc.status] || BADGES.processing;

    return (
        <span
            className={`ml-2 inline-flex h-6 shrink-0 items-center rounded-full border px-2.5 text-xs ${badge.styles}`}
            title={doc.stale ? 'Uploaded before AureLine kept a copy of highlighted PDFs' : undefined}
        >
            {badge.label}
        </span>
    );
}

// delete needs a second click, no browser dialog
function DeleteButton({ filename, onDelete }) {
    const [confirming, setConfirming] = useState(false);

    useEffect(() => {
        if (!confirming) return;
        const timer = setTimeout(() => setConfirming(false), 4000);
        return () => clearTimeout(timer);
    }, [confirming]);

    if (confirming) {
        return (
            <button
                type="button"
                onClick={onDelete}
                className="pressable h-10 whitespace-nowrap rounded-[var(--radius-control)] bg-danger px-3 text-sm font-medium text-paper-raised"
            >
                Delete
            </button>
        );
    }

    return (
        <button
            type="button"
            onClick={() => setConfirming(true)}
            aria-label={`Delete ${filename}`}
            className="pressable grid size-10 place-items-center rounded-[var(--radius-control)] text-ink-faint hover-fine:bg-paper-sunken hover-fine:text-danger"
        >
            <Trash size={18} aria-hidden="true" />
        </button>
    );
}

function DocumentRow({ doc, index, onDelete }) {
    const openable = doc.status === 'completed';
    const meta = [
        doc.pageCount ? plural(doc.pageCount, 'page') : null,
        doc.highlightCount ? plural(doc.highlightCount, 'highlight') : null,
        formatDate(doc.createdAt),
    ].filter(Boolean).join(' · ');

    const name = (
        <span className="flex min-w-0 items-center gap-3">
            <FilePdf size={22} className="shrink-0 text-ink-faint" aria-hidden="true" />
            <span className="min-w-0">
                <span className="flex items-center">
                    <span className="truncate font-medium text-ink">{doc.filename}</span>
                    <StatusBadge doc={doc} />
                </span>
                <span className="mt-0.5 block font-mono text-xs text-ink-faint tabular-nums md:hidden">{meta}</span>
            </span>
        </span>
    );

    return (
        <li
            className={[
                'rise-in group relative isolate py-3.5',
                ROW_GRID,
                // hover wash on its own layer so it can bleed past the divider lines
                "before:absolute before:inset-y-1 before:-inset-x-3 before:-z-10 before:rounded-[var(--radius-control)] before:content-[''] before:transition-colors before:duration-150",
                openable ? 'hover-fine:before:bg-paper-sunken' : '',
            ].join(' ')}
            style={{ '--i': Math.min(index, 8) }}
        >
            {openable ? (
                <Link to={`/doc/${doc._id}`} className="min-w-0 rounded-sm after:absolute after:inset-0 after:content-['']">
                    {name}
                </Link>
            ) : (
                <div className="min-w-0">{name}</div>
            )}

            <span className="hidden font-mono text-sm text-ink-soft tabular-nums md:block">{doc.pageCount || '–'}</span>
            <span className="hidden items-center gap-2 font-mono text-sm text-ink-soft tabular-nums md:flex">
                {doc.highlightCount ? (
                    <>
                        <span className="h-2.5 w-4 rounded-[2px] bg-mark-yellow mix-blend-multiply" aria-hidden="true" />
                        {doc.highlightCount}
                    </>
                ) : '–'}
            </span>
            <span className="hidden font-mono text-sm text-ink-soft tabular-nums md:block">{formatDate(doc.createdAt)}</span>

            {/* above the row link so it gets its own clicks */}
            <span className="relative z-10 flex justify-end">
                <DeleteButton filename={doc.filename} onDelete={() => onDelete(doc)} />
            </span>
        </li>
    );
}

function SkeletonRows() {
    return (
        <ul aria-hidden="true" className="divide-y divide-rule">
            {[60, 42, 51].map((w, i) => (
                <li key={i} className={`${ROW_GRID} py-4`}>
                    <span className="flex items-center gap-3">
                        <span className="size-5 rounded bg-paper-sunken" />
                        <span className="h-3.5 rounded-full bg-paper-sunken animate-pulse" style={{ width: `${w}%` }} />
                    </span>
                    {[1, 2, 3].map(k => <span key={k} className="hidden h-3 w-10 rounded-full bg-paper-sunken md:block" />)}
                    <span />
                </li>
            ))}
        </ul>
    );
}

function EmptyLibrary() {
    return (
        <div className="rise-in grid items-center gap-10 border-y border-rule py-16 md:grid-cols-[1fr_auto] md:py-20">
            <div>
                <h2 className="text-2xl font-semibold tracking-tight text-ink">Nothing highlighted yet</h2>
                <p className="mt-2 max-w-md text-base text-ink-soft">
                    Upload a PDF and AureLine will mark its definitions, key concepts and important points.
                    It will be waiting here when you come back.
                </p>
                <Button to="/upload" className="mt-7">
                    Highlight your first PDF
                    <ArrowRight size={16} weight="bold" aria-hidden="true" />
                </Button>
            </div>

            {/* a little sheet with the three pens on it */}
            <div aria-hidden="true" className="hidden w-60 -rotate-2 rounded-[var(--radius-sheet)] border border-rule bg-paper-raised p-6 shadow-[var(--shadow-sheet)] md:block">
                <div className="space-y-3">
                    <div className="h-2 w-[86%] rounded-full bg-paper-sunken" />
                    <div className="h-2.5 w-[64%] rounded-[3px] bg-mark-yellow mix-blend-multiply" />
                    <div className="h-2 w-full rounded-full bg-paper-sunken" />
                    <div className="h-2.5 w-[48%] rounded-[3px] bg-mark-blue mix-blend-multiply" />
                    <div className="h-2 w-[92%] rounded-full bg-paper-sunken" />
                    <div className="h-2.5 w-[72%] rounded-[3px] bg-mark-green mix-blend-multiply" />
                    <div className="h-2 w-[40%] rounded-full bg-paper-sunken" />
                </div>
            </div>
        </div>
    );
}

function Dashboard() {
    const [documents, setDocuments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [reloadKey, setReloadKey] = useState(0);
    const { logout } = useAuth();
    const api = useApi();
    const navigate = useNavigate();

    useEffect(() => {
        let ignore = false;

        api('/api/history')
            .then(data => {
                if (ignore) return;
                const now = Date.now();
                setDocuments(data.documents.map(doc => ({
                    ...doc,
                    stale: doc.status === 'processing' && now - new Date(doc.createdAt).getTime() > STALE_PROCESSING_MS,
                })));
            })
            .catch(err => {
                if (!ignore && err.status !== 401) setError(err.message);
            })
            .finally(() => {
                if (!ignore) setLoading(false);
            });

        return () => {
            ignore = true;
        };
    }, [api, reloadKey]);

    const retry = useCallback(() => {
        setError('');
        setLoading(true);
        setReloadKey(k => k + 1);
    }, []);

    // remove right away, put it back if the server says no
    const handleDelete = async (doc) => {
        const previous = documents;
        setDocuments(docs => docs.filter(d => d._id !== doc._id));
        try {
            await api(`/api/documents/${doc._id}`, { method: 'DELETE' });
        } catch (err) {
            setDocuments(previous);
            if (err.status !== 401) setError(`Couldn't delete ${doc.filename}. ${err.message}`);
        }
    };

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const totalHighlights = documents.reduce((sum, d) => sum + (d.highlightCount || 0), 0);

    return (
        <div className="min-h-[100dvh]">
            <AppBar>
                <Button to="/upload" size="sm">
                    <Plus size={16} weight="bold" aria-hidden="true" />
                    New PDF
                </Button>
                <Button variant="ghost" size="sm" onClick={handleLogout} aria-label="Log out">
                    <SignOut size={18} aria-hidden="true" />
                    <span className="hidden sm:inline">Log out</span>
                </Button>
            </AppBar>

            <main id="main" className="mx-auto max-w-6xl px-4 pb-[max(4rem,env(safe-area-inset-bottom))] pt-10 sm:px-6 md:pt-14">
                <div className="flex flex-wrap items-end justify-between gap-3">
                    <h1 className="text-3xl font-semibold tracking-tight text-ink md:text-4xl">Library</h1>
                    {!loading && documents.length > 0 && (
                        <p className="font-mono text-sm text-ink-faint tabular-nums">
                            {plural(documents.length, 'document')} · {plural(totalHighlights, 'highlight')}
                        </p>
                    )}
                </div>

                <div className="mt-8">
                    {error && (
                        <div className="mb-6 flex flex-col gap-3">
                            <FormError>{error}</FormError>
                            <div><Button variant="secondary" size="sm" onClick={retry}>Try again</Button></div>
                        </div>
                    )}

                    {loading ? (
                        <SkeletonRows />
                    ) : documents.length === 0 ? (
                        !error && <EmptyLibrary />
                    ) : (
                        <>
                            <div className={`${ROW_GRID} hidden border-b border-rule pb-3 font-mono text-[11px] uppercase tracking-[0.14em] text-ink-faint md:grid`}>
                                <span>Name</span>
                                <span>Pages</span>
                                <span>Highlights</span>
                                <span>Added</span>
                                <span className="sr-only">Actions</span>
                            </div>
                            <ul className="divide-y divide-rule">
                                {documents.map((doc, i) => (
                                    <DocumentRow key={doc._id} doc={doc} index={i} onDelete={handleDelete} />
                                ))}
                            </ul>
                        </>
                    )}
                </div>
            </main>
        </div>
    );
}

export default Dashboard;

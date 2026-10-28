import { useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import { ArrowLeft, DownloadSimple, CaretDown } from '@phosphor-icons/react';
import { useApi } from '../hooks/useApi';
import { formatDate, plural } from '../lib/format';
import AppBar from '../components/AppBar';
import Button from '../components/Button';
import FormError from '../components/FormError';
import HighlightList from '../components/viewer/HighlightList';
import PdfPages, { PageSkeleton } from '../components/viewer/PdfPages';

const downloadName = (filename) => `${filename.replace(/\.pdf$/i, '')} (highlighted).pdf`;

function DocumentDetails({ doc }) {
    return (
        <div>
            <h1 className="break-words text-xl font-semibold leading-snug tracking-tight text-ink">{doc.filename}</h1>
            <p className="mt-1.5 font-mono text-xs text-ink-faint tabular-nums">
                {[doc.pageCount ? plural(doc.pageCount, 'page') : null, plural(doc.highlightCount || 0, 'highlight'), formatDate(doc.createdAt)]
                    .filter(Boolean)
                    .join(' · ')}
            </p>
        </div>
    );
}

function Viewer() {
    const { id } = useParams();
    const api = useApi();
    const pagesRef = useRef(null);

    const [doc, setDoc] = useState(null);
    const [highlights, setHighlights] = useState([]);
    const [fileUrl, setFileUrl] = useState(null);
    const [error, setError] = useState('');

    // details and the PDF itself load in parallel
    useEffect(() => {
        let ignore = false;
        let objectUrl = null;

        api(`/api/documents/${id}`)
            .then(data => {
                if (ignore) return;
                setDoc(data.document);
                setHighlights(data.highlights);
            })
            .catch(err => {
                if (!ignore && err.status !== 401) setError(err.status === 404 ? 'This document is not in your library.' : err.message);
            });

        api(`/api/documents/${id}/pdf`, { raw: true })
            .then(res => res.blob())
            .then(blob => {
                objectUrl = URL.createObjectURL(blob);
                if (ignore) {
                    URL.revokeObjectURL(objectUrl);
                    return;
                }
                setFileUrl(objectUrl);
            })
            .catch(err => {
                if (!ignore && err.status !== 401 && err.status !== 404) setError(err.message);
            });

        return () => {
            ignore = true;
            if (objectUrl) URL.revokeObjectURL(objectUrl);
        };
    }, [api, id]);

    const handlePick = (highlight) => {
        pagesRef.current?.goToPage(highlight.page);
    };

    const download = fileUrl && doc ? (
        <Button href={fileUrl} download={downloadName(doc.filename)} size="sm">
            <DownloadSimple size={16} weight="bold" aria-hidden="true" />
            <span className="hidden sm:inline">Download PDF</span>
            <span className="sm:hidden">Download</span>
        </Button>
    ) : null;

    return (
        <div className="min-h-[100dvh]">
            <AppBar wide>
                <Button to="/dashboard" variant="ghost" size="sm">
                    <ArrowLeft size={16} aria-hidden="true" />
                    Library
                </Button>
                {download}
            </AppBar>

            {error ? (
                <main className="mx-auto max-w-xl px-4 py-16 sm:px-6">
                    <FormError>{error}</FormError>
                    <Button to="/dashboard" variant="secondary" className="mt-6">Back to library</Button>
                </main>
            ) : (
                <main className="mx-auto grid max-w-[1400px] gap-8 px-4 pb-[max(4rem,env(safe-area-inset-bottom))] pt-6 sm:px-6 lg:grid-cols-[minmax(0,1fr)_23rem] lg:gap-10 lg:pt-8">
                    {/* highlights: collapsible above the pages on small screens, sticky sidebar on large */}
                    <aside className="lg:order-2">
                        <div className="lg:sticky lg:top-24 lg:max-h-[calc(100dvh-7rem)] lg:overflow-y-auto lg:pr-1">
                            {doc ? (
                                <>
                                    <DocumentDetails doc={doc} />

                                    <details className="group mt-6 lg:hidden">
                                        <summary className="flex h-12 cursor-pointer list-none items-center justify-between rounded-[var(--radius-control)] border border-rule-strong bg-paper-raised px-4 text-[15px] font-medium text-ink [&::-webkit-details-marker]:hidden">
                                            {plural(highlights.length, 'highlight')}
                                            <CaretDown size={16} className="transition-transform duration-200 group-open:rotate-180" aria-hidden="true" />
                                        </summary>
                                        <div className="pt-5">
                                            <HighlightList highlights={highlights} onPick={handlePick} />
                                        </div>
                                    </details>

                                    <div className="mt-7 hidden lg:block">
                                        <HighlightList highlights={highlights} onPick={handlePick} />
                                    </div>
                                </>
                            ) : (
                                <div aria-hidden="true" className="space-y-3">
                                    <div className="h-6 w-3/4 rounded bg-paper-sunken animate-pulse" />
                                    <div className="h-3 w-1/2 rounded-full bg-paper-sunken" />
                                </div>
                            )}
                        </div>
                    </aside>

                    <section aria-label="Highlighted PDF" className="min-w-0 rounded-[var(--radius-sheet)] bg-paper-sunken/70 px-3 py-6 sm:px-8 sm:py-10 lg:order-1">
                        {fileUrl ? (
                            <PdfPages
                                ref={pagesRef}
                                file={fileUrl}
                                onError={() => setError("This PDF couldn't be displayed. Try downloading it instead.")}
                            />
                        ) : (
                            <PageSkeleton />
                        )}
                    </section>
                </main>
            )}
        </div>
    );
}

export default Viewer;

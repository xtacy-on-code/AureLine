import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import workerSrc from 'pdfjs-dist/build/pdf.worker.min.mjs?url';
import 'react-pdf/dist/Page/TextLayer.css';

// bundled with the app instead of fetched from unpkg at runtime
pdfjs.GlobalWorkerOptions.workerSrc = workerSrc;

const FLASH_MS = 1400;

// one page; renders only once it comes near the viewport, then stays rendered
function LazyPage({ pageNumber, width, ratio, flashing }) {
    const ref = useRef(null);
    const [visible, setVisible] = useState(pageNumber <= 2);

    useEffect(() => {
        if (visible || !ref.current) return;
        const observer = new IntersectionObserver(([entry]) => {
            if (entry.isIntersecting) {
                setVisible(true);
                observer.disconnect();
            }
        }, { rootMargin: '1200px 0px' });
        observer.observe(ref.current);
        return () => observer.disconnect();
    }, [visible]);

    return (
        <div
            ref={ref}
            id={`page-${pageNumber}`}
            data-page={pageNumber}
            className={[
                'relative scroll-mt-24 overflow-hidden rounded-[4px] bg-white shadow-[var(--shadow-sheet)] ring-2 ring-ink',
                'transition-[box-shadow] duration-300',
                flashing ? 'ring-[5px] ring-mark-yellow' : '',
            ].join(' ')}
            style={{ width, height: width * ratio }}
        >
            {visible && (
                <Page
                    pageNumber={pageNumber}
                    width={width}
                    renderAnnotationLayer={false}
                    loading=""
                />
            )}
            <span className="pointer-events-none absolute bottom-2 right-3 text-[11px] text-ink-faint">
                {pageNumber}
            </span>
        </div>
    );
}

// the whole document as a column of pages that fits its container's width
const PdfPages = forwardRef(function PdfPages({ file, onError }, ref) {
    const containerRef = useRef(null);
    const [width, setWidth] = useState(0);
    const [numPages, setNumPages] = useState(0);
    const [ratio, setRatio] = useState(1.414);
    const [flashPage, setFlashPage] = useState(null);

    useEffect(() => {
        if (!containerRef.current) return;
        const observer = new ResizeObserver(([entry]) => {
            setWidth(Math.min(Math.floor(entry.contentRect.width), 860));
        });
        observer.observe(containerRef.current);
        return () => observer.disconnect();
    }, []);

    useEffect(() => {
        if (flashPage === null) return;
        const timer = setTimeout(() => setFlashPage(null), FLASH_MS);
        return () => clearTimeout(timer);
    }, [flashPage]);

    // parent calls this when a highlight in the sidebar is picked
    useImperativeHandle(ref, () => ({
        goToPage(pageNumber) {
            const el = document.getElementById(`page-${pageNumber}`);
            if (!el) return;
            const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
            el.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' });
            setFlashPage(pageNumber);
        },
    }), []);

    const handleLoad = async (pdf) => {
        setNumPages(pdf.numPages);
        // size placeholders from the first page so the scrollbar doesn't jump
        const first = await pdf.getPage(1);
        const viewport = first.getViewport({ scale: 1 });
        setRatio(viewport.height / viewport.width);
    };

    return (
        <div ref={containerRef} className="w-full">
            {width > 0 && (
                <Document
                    file={file}
                    onLoadSuccess={handleLoad}
                    onLoadError={onError}
                    loading={<PageSkeleton width={width} />}
                    error=""
                    className="flex flex-col items-center gap-6"
                >
                    {Array.from({ length: numPages }, (_, i) => (
                        <LazyPage
                            key={i + 1}
                            pageNumber={i + 1}
                            width={width}
                            ratio={ratio}
                            flashing={flashPage === i + 1}
                        />
                    ))}
                </Document>
            )}
        </div>
    );
});

export function PageSkeleton({ width }) {
    return (
        <div
            aria-hidden="true"
            className="mx-auto rounded-[4px] bg-paper-raised p-[8%] ring-2 ring-ink/20"
            style={{ width: width || '100%', aspectRatio: '1 / 1.414' }}
        >
            <div className="space-y-3">
                <div className="h-5 w-1/2 rounded bg-paper-sunken" />
                {[96, 88, 100, 72, 94, 85, 60].map((w, i) => (
                    <div key={i} className="h-2.5 rounded-full bg-paper-sunken animate-pulse" style={{ width: `${w}%` }} />
                ))}
            </div>
        </div>
    );
}

export default PdfPages;

import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

function Viewer() {
    const { state } = useLocation();
    const navigate = useNavigate();

    const [numPages, setNumPages] = useState(null);
    const [pageLoading, setPageLoading] = useState(false);

    const { highlightedPDF, highlights } = state || {};

    const [fileUrl] = useState(() => {
        const bytes = atob(highlightedPDF);
        const buffer = new Uint8Array(bytes.length);

        for (let i=0; i<bytes.length; i++) {
            buffer[i] = bytes.charCodeAt(i);
        }

        const blob = new Blob([buffer], { type: 'application/pdf '});
        return URL.createObjectURL(blob);
    });

    return (
        <div className="min-h-screen bg-[#0a0a0a]">
            {/* navbar */}
            <nav className="border-b border-[#222222] px-6 py-4 flex items-center justify-between">
                <h1 className="text-white font-bold text-lg">✦ AureLine</h1>
                <button
                    onClick={() => navigate('/upload')}
                    className="text-[#888888] hover:text-white text-sm transition-colors"
                >
                    ← Back
                </button>
            </nav>

            {/* PDF viewer */}
            <div className="flex justify-center p-6 overflow-auto">
                {pageLoading && (
                    <p className="text-[#888888] text-sm">Loading PDF...</p>
                )}
                <Document
                    file={fileUrl}
                    onLoadSuccess={({ numPages }) => {
                        setNumPages(numPages);
                        setPageLoading(false);
                    }}
                    onLoadError={(err) => console.log('PDF load error:', err)}
                >
                    {Array.from({ length: numPages || 0 }, (_, i) => (
                        <Page
                            key={i + 1}
                            pageNumber={i + 1}
                            width={600}
                            className="mb-4"
                        />
                    ))}
                </Document>
            </div>
        </div>
    )
}

export default Viewer
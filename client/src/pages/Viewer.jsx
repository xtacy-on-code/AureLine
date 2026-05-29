import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Document, Page, pdfjs } from 'react-pdf';
import GrainBg from '../components/GrainBg';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

function Viewer() {
    const { state } = useLocation();
    const navigate = useNavigate();

    const [numPages, setNumPages] = useState(null);
    const [pageLoading, setPageLoading] = useState(true);

    const { highlightedPDF, highlights } = state || {};

    const [fileUrl] = useState(() => {
        if (!highlightedPDF) return null;
        const bytes = atob(highlightedPDF);
        const buffer = new Uint8Array(bytes.length);

        for (let i = 0; i < bytes.length; i++) {
            buffer[i] = bytes.charCodeAt(i);
        }

        const blob = new Blob([buffer], { type: 'application/pdf' });
        return URL.createObjectURL(blob);
    });

    const handleDownload = () => {
        if (!fileUrl) return;
        const link = document.createElement('a');
        link.href = fileUrl;
        link.download = 'highlighted.pdf';
        link.click();
    };

    return (
        <div className="min-h-screen bg-[#09090f] relative flex flex-col">
            <GrainBg />

            {/* Navbar */}
            <nav className="relative z-10 border-b border-white/[0.06] px-6 py-4 flex items-center justify-between shrink-0">
                <span className="text-white font-semibold text-base tracking-tight">
                    ✦ Aure<span className="text-indigo-400">Line</span>
                </span>

                <div className="flex items-center gap-3">
                    <button
                        onClick={handleDownload}
                        disabled={!fileUrl}
                        className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-medium px-4 py-2 rounded-xl transition-colors"
                    >
                        ⬇ Download PDF
                    </button>
                    <button
                        onClick={() => navigate('/upload')}
                        className="border border-white/[0.1] hover:border-white/[0.2] text-white/50 hover:text-white/80 text-sm px-4 py-2 rounded-xl transition-colors font-medium"
                    >
                        ← Back
                    </button>
                </div>
            </nav>

            {/* PDF View Workspace */}
            <div className="relative z-10 flex-1 overflow-y-auto p-6 flex flex-col items-center custom-scrollbar">
                {pageLoading && fileUrl && (
                    <div className="text-center my-auto space-y-3">
                        <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
                        <p className="text-white/40 text-sm">Rendering highlights...</p>
                    </div>
                )}

                {!fileUrl && (
                    <div className="text-center my-auto">
                        <p className="text-red-400 text-sm">No PDF data found. Please try re-uploading.</p>
                    </div>
                )}

                {fileUrl && (
                    <div className="w-full max-w-2xl bg-white/[0.01] border border-white/[0.06] rounded-2xl p-4 md:p-8 flex justify-center backdrop-blur-sm shadow-2xl">
                        <Document
                            file={fileUrl}
                            onLoadSuccess={({ numPages }) => {
                                setNumPages(numPages);
                                setPageLoading(false);
                            }}
                            onLoadError={(err) => {
                                console.error('PDF load error:', err);
                                setPageLoading(false);
                            }}
                        >
                            {Array.from({ length: numPages || 0 }, (_, i) => (
                                <div key={i + 1} className="mb-6 last:mb-0 shadow-lg rounded-md overflow-hidden border border-white/[0.04]">
                                    <Page
                                        pageNumber={i + 1}
                                        width={Math.min(window.innerWidth - 64, 600)}
                                        renderProvider={false}
                                    />
                                </div>
                            ))}
                        </Document>
                    </div>
                )}
            </div>
        </div>
    );
}

export default Viewer;
import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import API_URL from '../config';
import GrainBg from '../components/GrainBg';

function Upload() {
    const [file, setFile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [isDragging, setIsDragging] = useState(false);
    const [highlights, setHighlights] = useState([]);

    const { token } = useAuth();
    const navigate = useNavigate();
    
    // Create a reference to target the hidden file picker input
    const fileInputRef = useRef(null);

    const handleDragOver = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(true);
    };

    const handleDragLeave = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
        
        // Target dataTransfer items directly
        const droppedFiles = e.dataTransfer?.files;
        if (droppedFiles && droppedFiles.length > 0) {
            const selectedFile = droppedFiles[0];
            
            // Check file type or extension matching
            if (selectedFile.type === 'application/pdf' || selectedFile.name.toLowerCase().endsWith('.pdf')) {
                setFile(selectedFile);
                setError(''); 
            } else {
                setError('Please drop a valid PDF file.');
            }
        }
    };

    // Trigger the file selection input click gracefully
    const handleBoxClick = () => {
        if (fileInputRef.current) {
            fileInputRef.current.click();
        }
    };

    const handleFileChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
            setError('');
        }
    };

    const handleUpload = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const formData = new FormData();
            formData.append('pdf', file);

            const res = await fetch(`${API_URL}/api/upload`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` },
                body: formData
            });

            const data = await res.json();
            if (!res.ok) {
                setError(data.error || 'Upload failed');
                return;
            }

            setHighlights(data.highlights);

            navigate('/viewer', {
                state: {
                    highlightedPDF: data.highlightedPDF,
                    highlights: data.highlights,
                }
            });

        } catch (err) {
            setError('An error occurred while uploading the file');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#09090f] relative">
            <GrainBg />

            {/* Navbar */}
            <nav className="relative z-10 border-b border-white/[0.06] px-6 py-4 flex items-center justify-between">
                <span className="text-white font-semibold text-base tracking-tight">
                    ✦ Aure<span className="text-indigo-400">Line</span>
                </span>
                <button 
                    onClick={() => navigate('/dashboard')}
                    className="border border-white/[0.1] hover:border-white/[0.2] active:scale-[0.98] text-white/50 hover:text-white/80 text-sm px-4 py-2 rounded-xl transition-all"
                >
                    ← Back to Dashboard
                </button>
            </nav>

            {/* Content */}
            <div className="relative z-10 max-w-2xl mx-auto px-6 py-10">
                <div className="mb-8">
                    <h2 className="text-2xl font-semibold text-white tracking-tight">Upload your PDF</h2>
                    <p className="text-white/30 text-sm mt-1">Drop a PDF and get instant AI-powered highlights</p>
                </div>

                {error && (
                    <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm rounded-xl px-4 py-3 mb-6">
                        {error}
                    </div>
                )}

                <form onSubmit={handleUpload}>
                    {/* Hidden Native Input controlled cleanly via ref */}
                    <input 
                        type="file"
                        accept=".pdf"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        className="hidden"
                    />

                    {/* Pure structural Div container for seamless drag drop tracking */}
                    <div 
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                        onClick={handleBoxClick}
                        className={`block w-full bg-white/[0.01] border-2 border-dashed rounded-2xl p-16 text-center cursor-pointer transition-all duration-200 mb-5 group backdrop-blur-sm ${
                            isDragging ? 'border-indigo-500 bg-indigo-500/[0.04] scale-[1.01]' : 'border-white/[0.08] hover:border-indigo-500/50'
                        }`}
                    >
                        <div className="pointer-events-none select-none">
                            <p className="text-4xl mb-4 opacity-80 group-hover:scale-110 transition-transform duration-200">📄</p>
                            <p className="text-white/80 text-sm font-medium">Drop your PDF here</p>
                            <p className="text-white/30 text-xs mt-1">or click to browse local files</p>
                        </div>
                    </div>

                    {/* Selected file info card */}
                    {file && (
                        <div className="bg-indigo-500/5 border border-indigo-500/10 rounded-xl px-4 py-3 mb-5 flex items-center gap-2">
                            <span className="text-emerald-400 text-xs font-bold">✓</span>
                            <p className="text-indigo-300 text-sm font-medium truncate">
                                {file.name}
                            </p>
                        </div>
                    )}

                    {/* Submit button */}
                    <button
                        type="submit"
                        disabled={!file || loading}
                        className="w-full bg-indigo-600 hover:bg-indigo-500 active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed text-white font-medium rounded-xl py-3 text-sm transition-all"
                    >
                        {loading ? 'Analyzing your PDF...' : 'Highlight my PDF'}
                    </button>
                </form>
            </div>
        </div>
    );
}

export default Upload;
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import API_URL from '../config';

function Upload() {
    const [file, setFile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [highlights, setHighlights] = useState([]);

    const { token } = useAuth();
    const navigate = useNavigate();

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
            })
            

        } catch (err) {
            setError('An error occurred while uploading the file');
        
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="min-h-screen bg-[#0a0a0a]">
            {/* navbar */}
            <nav className="border-b border-[#222222] px-6 py-4 flex items-center justify-between">
                <h1 className="text-white font-bold text-xl">✦ AureLine</h1>
                <button 
                    onClick={() => navigate('/dashboard')}
                    className="text-[#888888] hover:text-white text-sm transition-colors"
                    >
                    ← Back
                </button>
            </nav>

            <div className="max-w-2xl mx-auto px-6 py-10">
                {/* heading */}
                <h2 className="text-white text-2xl font-bold mb-1">Upload your PDF</h2>
                <p className="text-[#888888] text-sm mb-8">Drop a PDF and get instant highlights.</p>

                {/* error */}
                {error && (
                    <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm px-4 py-3 rounded-lg mb-6">
                        {error}
                    </div>
                )}

                {/* upload form */}
                <form onSubmit={handleUpload}>
                    {/* drop zone */}
                    <label className="block w-full border-2 border-dashed border-gray-700 hover:border-indigo-500 rounded-2xl p-16 text-center cursor-pointer transition-colors mb-4 bg-[#111111] hover:bg-[#222222]">
                        <input 
                            type="file"
                            accept=".pdf"
                            onChange={(e) => setFile(e.target.files[0])}
                            className="hidden"
                            style={{ display: 'none' }}
                        />
                        <p className="text-5xl mb-3">📄</p>
                        <p className="text-white text-sm font-medium">Drop your PDF here</p>
                        <p className="text-[#888888] text-xs mt-1">or click to browse</p>
                    </label>

                    {/* selected file name */}
                    {file && (
                        <p className="text-indigo-400 text-sm mb-4">
                            ✓ {file.name} selected
                        </p>
                    )}

                    {/* submit button */}
                    <button
                        type="submit"
                        disabled={!file || loading}
                        className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium rounded-lg py-3 text-sm transition-colors"
                    >
                        {loading ? 'Analysing your PDF...' : 'Highlight my PDF'}
                    </button>

                    

                </form>
            </div>
        </div>
    )
}

export default Upload
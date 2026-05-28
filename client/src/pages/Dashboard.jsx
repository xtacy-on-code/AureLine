import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import API_URL from '../config';

function Dashboard() {
    const [documents, setDocuments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const { token, logout } = useAuth()
    const navigate = useNavigate();

    useEffect(() => {
        const fetchDocuments = async () => {
            try {
                const res = await fetch(`${API_URL}/api/history`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });

                const data = await res.json();
                if (!res.ok) {
                    setError('Failed to fetch documents');
                    return;
                }

                setDocuments(data.documents);

            } catch (err) {
                setError('Failed to fetch documents');
            } finally {
                setLoading(false);
            }
        }

        fetchDocuments();
    }, []); // empty array = run once when page loads
    
    const handleLogout = () => {
        logout();
        navigate('/login');
    }

    return (
        <div className="min-h-screen bg-[#0a0a0a]">
            {/* navbar */}
            <nav className="border-b border-[#222222] px-6 py-4 flex items-center justify-between">
                {/* logo */}
                <h1 className="text-white font-bold text-xl">✦ AureLine</h1>

                {/* logout button */}
                <button onClick={handleLogout} className="text-[#888888] hover:text-white transition-colors">
                    Logout
                </button>
            </nav>

            {/* main content */}
            <div className="max-w-4xl mx-auto px-6 py-10">
                {/* header */}
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h2 className="text-white text-2xl font-bold">Your Documents</h2>
                        <p className="text-[#888888] text-sm mt-1">Upload a pdf to get AI highlight.</p>
                    </div>

                    {/* upload button */}
                    <button 
                        onClick={() => navigate('/upload')}
                        className="bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
                    >
                        + Upload PDF
                    </button>
                </div>

                {/* loading state */}
                    {loading && (
                        <p className="text-[#888888] text-sm">Loading your docs...</p>
                    )}

                    {/* error state */}
                    {error && (
                        <div className="text-red-400 text-sm">{error}</div>
                    )}

                    {/* empty state */}
                    {!loading && documents.length === 0 && (
                        <div className="border border-dashed border-[#222222] rounded-2xl p-16 text-center">
                            <p className="text-[#888888] text-sm">No documents yet.</p>
                            <p className="text-[#888888] text-sm mt-1">Upload your first document to get started.</p>
                        </div>
                    )}

                    {/* document list */}
                    {!loading && documents.length > 0 && (
                        <div className="space-y-3">
                            {documents.map(doc => (
                                <div
                                    key={doc._id}
                                    className="bg-[#111111] border border-[#222222] rounded-xl px-4 py-4 flex items-center justify-between hover:border-[#333333] transition-colors curson-pointer"
                                >
                                    {/* filename + date */}
                                    <div>
                                        <p className="text-white text-sm font-medium">{doc.filename}</p>
                                        <p className="text-[#888888] text-xs mt-0.5">
                                            {new Date(doc.createdAt).toLocaleDateString()}
                                        </p>
                                    </div>

                                    {/* view button */}
                                    {/* <span className="text-indigo-400 text-xs hover:text-indigo-300" onClick={() => navigate(`/viewer/${doc._id}`)}>
                                        View →
                                    </span> */}
                                </div>
                            ))}
                        </div>
                    )}
            </div>

        </div>
    )
}

export default Dashboard
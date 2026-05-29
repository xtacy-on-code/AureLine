import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import API_URL from '../config';
import GrainBg from '../components/GrainBg';

function Dashboard() {
    const [documents, setDocuments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const { token, logout } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        const fetchDocuments = async () => {
            try {
                const res = await fetch(`${API_URL}/api/history`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                const data = await res.json();
                if (!res.ok) { setError('Failed to fetch documents'); return; }
                setDocuments(data.documents);
            } catch (err) {
                setError('Something went wrong');
            } finally {
                setLoading(false);
            }
        };
        fetchDocuments();
    }, []);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <div className="min-h-screen bg-[#09090f] relative">
            <GrainBg />

            {/* Navbar */}
            <nav className="relative z-10 border-b border-white/[0.06] px-6 py-4 flex items-center justify-between">
                <span className="text-white font-semibold text-base tracking-tight">
                    ✦ Aure<span className="text-indigo-400">Line</span>
                </span>
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => navigate('/upload')}
                        className="bg-indigo-600 hover:bg-indigo-500 active:scale-[0.98] text-white text-sm font-medium px-4 py-2 rounded-xl transition-all"
                    >
                        + Upload PDF
                    </button>
                    <button
                        onClick={handleLogout}
                        className="border border-white/[0.1] hover:border-white/[0.2] active:scale-[0.98] text-white/50 hover:text-white/80 text-sm px-4 py-2 rounded-xl transition-all"
                    >
                        Logout
                    </button>
                </div>
            </nav>

            {/* Content */}
            <div className="relative z-10 max-w-3xl mx-auto px-6 py-10">
                <div className="mb-8">
                    <h2 className="text-2xl font-semibold text-white tracking-tight">Your Documents</h2>
                    <p className="text-white/30 text-sm mt-1">Upload a PDF to get AI-powered highlights</p>
                </div>

                {loading && (
                    <div className="space-y-3">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="bg-white/[0.02] border border-white/[0.06] rounded-2xl px-5 py-4 animate-pulse">
                                <div className="h-3.5 bg-white/[0.06] rounded w-1/3 mb-2"></div>
                                <div className="h-2.5 bg-white/[0.04] rounded w-1/5"></div>
                            </div>
                        ))}
                    </div>
                )}

                {error && (
                    <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm rounded-xl px-4 py-3">
                        {error}
                    </div>
                )}

                {!loading && documents.length === 0 && (
                    <div className="border border-dashed border-white/[0.08] rounded-2xl p-16 text-center backdrop-blur-sm">
                        <div className="text-4xl mb-4">📄</div>
                        <p className="text-white/40 text-sm font-medium">No documents yet</p>
                        <p className="text-white/20 text-xs mt-1 mb-6">Upload your first PDF to get started</p>
                        <button
                            onClick={() => navigate('/upload')}
                            className="bg-indigo-600 hover:bg-indigo-500 active:scale-[0.98] text-white text-sm font-medium px-6 py-2.5 rounded-xl transition-all"
                        >
                            Upload your first PDF
                        </button>
                    </div>
                )}

                {!loading && documents.length > 0 && (
                    <div className="space-y-2">
                        {documents.map((doc) => (
                            <div
                                key={doc._id}
                                className="bg-white/[0.02] hover:bg-white/[0.04] border border-white/[0.06] hover:border-indigo-500/30 rounded-2xl px-5 py-4 flex items-center justify-between transition-all duration-300 hover:-translate-y-[2px] hover:shadow-[0_8px_30px_rgb(99,102,241,0.04)] group cursor-pointer"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="w-9 h-9 bg-indigo-500/10 border border-indigo-500/20 group-hover:border-indigo-500/40 rounded-xl flex items-center justify-center text-base transition-colors">
                                        📄
                                    </div>
                                    <div>
                                        <p className="text-white/85 text-sm font-medium group-hover:text-white transition-colors">{doc.filename}</p>
                                        <p className="text-white/25 text-xs mt-0.5">
                                            {new Date(doc.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="text-xs px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-medium">
                                        Highlighted
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

export default Dashboard;
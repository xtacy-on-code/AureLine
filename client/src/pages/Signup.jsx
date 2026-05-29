import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import API_URL from '../config';
import GrainBg from '../components/GrainBg';

function Signup() {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }
        setError('');
        setLoading(true);
        try {
            const res = await fetch(`${API_URL}/api/auth/signup`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, email, password })
            });
            const data = await res.json();
            if (!res.ok) {
                setError(data.error || 'Signup failed');
                return;
            }
            navigate('/login');
        } catch (err) {
            setError('Something went wrong. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#09090f] flex items-center justify-center px-4 relative">
            <GrainBg />

            <div className="w-full max-w-sm relative z-10">
                {/* Logo */}
                <div className="text-center mb-8">
                    <span className="text-2xl font-semibold text-white tracking-tight">
                        ✦ Aure<span className="text-indigo-400">Line</span>
                    </span>
                </div>

                {/* Card */}
                <div className="bg-white/[0.02] border border-white/[0.08] rounded-2xl p-8">
                    <h2 className="text-lg font-semibold text-white mb-1 tracking-tight">Create an account</h2>
                    <p className="text-white/40 text-sm mb-6">Start highlighting smarter</p>

                    {error && (
                        <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm rounded-xl px-4 py-3 mb-5">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="text-xs text-white/40 block mb-1.5 font-medium uppercase tracking-wider">Name</label>
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="Vedant Zala"
                                required
                                className="w-full bg-white/[0.03] border border-white/[0.08] text-white rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-indigo-500/60 transition-colors placeholder:text-white/20"
                            />
                        </div>

                        <div>
                            <label className="text-xs text-white/40 block mb-1.5 font-medium uppercase tracking-wider">Email</label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="you@example.com"
                                required
                                className="w-full bg-white/[0.03] border border-white/[0.08] text-white rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-indigo-500/60 transition-colors placeholder:text-white/20"
                            />
                        </div>

                        <div>
                            <label className="text-xs text-white/40 block mb-1.5 font-medium uppercase tracking-wider">Password</label>
                            <div className="relative">
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    required
                                    className="w-full bg-white/[0.03] border border-white/[0.08] text-white rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-indigo-500/60 transition-colors placeholder:text-white/20 pr-16"
                                />
                                {password && (
                                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 text-xs transition-colors">
                                        {showPassword ? 'Hide' : 'Show'}
                                    </button>
                                )}
                            </div>
                        </div>

                        <div>
                            <label className="text-xs text-white/40 block mb-1.5 font-medium uppercase tracking-wider">Confirm Password</label>
                            <div className="relative">
                                <input
                                    type={showConfirm ? 'text' : 'password'}
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    placeholder="••••••••"
                                    required
                                    className="w-full bg-white/[0.03] border border-white/[0.08] text-white rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-indigo-500/60 transition-colors placeholder:text-white/20 pr-16"
                                />
                                {confirmPassword && (
                                    <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 text-xs transition-colors">
                                        {showConfirm ? 'Hide' : 'Show'}
                                    </button>
                                )}
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-medium rounded-xl py-2.5 text-sm transition-colors mt-2"
                        >
                            {loading ? 'Creating account...' : 'Create account'}
                        </button>
                    </form>

                    <p className="text-white/30 text-sm text-center mt-6">
                        Already have an account?{' '}
                        <Link to="/login" className="text-indigo-400 hover:text-indigo-300 transition-colors">
                            Sign in
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}

export default Signup;
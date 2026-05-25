import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function Login() {
  // state for form inputs
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    // prevent default form submission
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
        // call backend API to login
        const res = await fetch('http://localhost:5000/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        })

        const data = await res.json();

        if (!res.ok) {
            // backend returned an error
            setError(data.error || 'Login failed');
            return;
        }

        // save token to context and localStorage
        login(data.token);

        //redirect to dashboard
        navigate('/dashboard');

    } catch (err) {
        setError('Something went wrong. PLease try again.');

    } finally {
        // always runs no matter success or error
        setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center px-4">
        <div className="w-full max-w-md">
            
            {/* logo */}
            <h1 className="text-2xl font-bold text-white text-center mb-8">
                ✦ AureLine
            </h1>

            {/* card */}
            <div className="bg-[#111111] border border-[#222222] rounded-2xl p-8" >
                
                {/* heading */} 
                <h2 className="text-xl font-semibold text-white mb-1">Welcome back</h2>
                <p className="text-[#888888] text-sm mb-6">Sign in to your account.</p>

                {/* error message */}
                { error && (
                    <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm rounded-lg px-4 py-3 mb-4">
                        {error}
                    </div>
                )}

                {/* form */}
                <form onSubmit={handleSubmit} className="space-y-4">

                    {/* email */}
                    <div>
                        <label className="text-sm text-[#888888] block mb-1">Email</label>
                        <input 
                            type = "email"
                            value = {email}
                            onChange = {(e) => setEmail(e.target.value)}
                            placeholder="you@example.com"
                            required
                            className="w-full bg-[#0a0a0a] border border-[#222222] text-white rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-indigo-500 transition-colors"
                        />
                    </div> 

                    {/* password */}
                    <div>
                        <label className="text-sm text-[#888888] block mb-1">Password</label>
                        <input 
                            type = "password"
                            value = {password}
                            onChange = {(e) => setPassword(e.target.value)}
                            placeholder="••••••••"
                            required
                            className="w-full bg-[#0a0a0a] border border-[#222222] text-white rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-indigo-500 transition-colors"
                        />
                    </div> 

                    {/* submit button */}
                    <button
                        type = "submit"
                        disabled={loading}
                        className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium rounded-lg py-2.5 text-sm transition-colors mt-2"

                    >
                        {loading ? 'Logging in...' : 'Login'}
                    </button>
                </form>

                {/* signup link */}
                <p className = "text-[#888888] text-sm text-center mt-6" >
                    Don't have an account?{' '}
                    <Link to="/signup" className="text-indigo-400 hover:text-indigo-300">
                        Sign up
                    </Link>
                </p>

            </div>

        </div>
    </div>
  )
}

export default Login
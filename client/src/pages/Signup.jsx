import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function Signup() {
    // state for form inputs
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPass, setShowPass] = useState(false);
    const [showConfirmPass, setShowConfirmPass] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    
    const navigate = useNavigate();

    const handleSubmit = async (e) => {

        e.preventDefault();
        if (password !== confirmPassword) {
            setError('Passwords do not match');
            setLoading(false);
            return;
        }
        setError('');
        setLoading(true);



        try {
        // call backend API to signup
        const res = await fetch('http://localhost:5000/api/auth/signup', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, email, password })
        })

        const data = await res.json();

        if (!res.ok) {
            // backend returned an error
            setError(data.error || 'Signup failed');
            return;
        }

        //redirect to dashboard
        navigate('/login');

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
                <h2 className="text-xl font-semibold text-white mb-1">Create an account</h2>
                <p className="text-[#888888] text-sm mb-6">Sign up to start highlighting smarter.</p>

                {/* error message */}
                { error && (
                    <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm rounded-lg px-4 py-3 mb-4">
                        {error}
                    </div>
                )}

                {/* form */}
                <form onSubmit={handleSubmit} className="space-y-4">

                    {/* username */}
                    <div>
                        <label className="text-sm text-[#888888] block mb-1">User Name</label>
                        <input 
                            type = "text"
                            value = {name}
                            onChange = {(e) => setName(e.target.value)}
                            placeholder="your name goes here..."
                            required
                            className="w-full bg-[#0a0a0a] border border-[#222222] text-white rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-indigo-500 transition-colors"
                        />
                    </div> 

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
                    <div className="relative">
                        <label className="text-sm text-[#888888] block mb-1">Password</label>
                        <input 
                            type = {showPass ? "text" : "password"}
                            value = {password}
                            onChange = {(e) => setPassword(e.target.value)}
                            placeholder="••••••••"
                            required
                            className="w-full bg-[#0a0a0a] border border-[#222222] text-white rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-indigo-500 transition-colors"
                        />

                        {/* toggle button */}
                        {password && (
                            <button 
                            type="button"
                            onClick = {() => setShowPass(!showPass)}
                            className="absolute right-3 top-9 text-[#888888] hover:text-white text-xs"
                            > 
                                {showPass ? 'Hide' : 'Show'}
                            </button>
                        )}
                        
                    </div> 

                    {/* confirm password */}
                    <div className="relative">
                        <label className="text-sm text-[#888888] block mb-1">Confirm Password</label>
                        <input 
                            type = {showConfirmPass ? "text" : "password"}
                            value = {confirmPassword}
                            onChange = {(e) => setConfirmPassword(e.target.value)}
                            placeholder="••••••••"
                            required
                            className="w-full bg-[#0a0a0a] border border-[#222222] text-white rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-indigo-500 transition-colors"
                        />
                        {confirmPassword && (
                            <button 
                                type="button"
                                onClick = {() => setShowConfirmPass(!showConfirmPass)}
                                className="absolute right-3 top-9 text-[#888888] hover:text-white text-xs"
                            > 
                                {showConfirmPass ? 'Hide' : 'Show'}
                            </button>
                        )}
                    </div> 

                    {/* submit button */}
                    <button
                        type = "submit"
                        disabled={loading}
                        className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium rounded-lg py-2.5 text-sm transition-colors mt-2"

                    >
                        {loading ? 'Signing up...' : 'Sign Up'}
                    </button>
                </form>

                {/* signup link */}
                <p className = "text-[#888888] text-sm text-center mt-6" >
                    Already have an account?{' '}
                    <Link to="/login" className="text-indigo-400 hover:text-indigo-300">
                        Log in
                    </Link>
                </p>

            </div>

        </div>
    </div>
  )
}

export default Signup
import { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../context/auth';
import { apiRequest } from '../lib/api';
import AuthLayout from '../components/AuthLayout';
import Field from '../components/Field';
import Button from '../components/Button';
import FormError from '../components/FormError';

function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const { login } = useAuth();
    const navigate = useNavigate();
    const { state } = useLocation();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            const data = await apiRequest('/api/auth/login', { method: 'POST', body: { email, password } });
            login(data.token);
            navigate('/dashboard');
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <AuthLayout
            title="Welcome back"
            subtitle="Log in to see your highlighted PDFs."
            footer={<>New here? <Link to="/signup" className="font-medium text-ink underline decoration-rule-strong underline-offset-4 hover-fine:decoration-ink">Create an account</Link></>}
        >
            <form onSubmit={handleSubmit} className="flex flex-col gap-5" noValidate>
                {state?.expired && !error && (
                    <p role="status" className="rounded-[var(--radius-control)] bg-mark-yellow/40 px-4 py-3 text-sm text-ink">
                        Your session expired. Please log in again.
                    </p>
                )}
                <FormError>{error}</FormError>

                <Field
                    label="Email"
                    type="email"
                    name="email"
                    autoComplete="email"
                    inputMode="email"
                    spellCheck={false}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@college.edu"
                    required
                />
                <Field
                    label="Password"
                    type="password"
                    name="password"
                    autoComplete="current-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                />

                <Button type="submit" size="lg" className="mt-2 w-full" disabled={loading || !email || !password}>
                    {loading ? 'Logging in…' : 'Log in'}
                </Button>
            </form>
        </AuthLayout>
    );
}

export default Login;

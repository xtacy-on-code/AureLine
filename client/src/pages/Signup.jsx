import { useRef, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/auth';
import { apiRequest } from '../lib/api';
import AuthLayout from '../components/AuthLayout';
import Field from '../components/Field';
import Button from '../components/Button';
import FormError from '../components/FormError';

const MIN_PASSWORD_LENGTH = 8;

// same rules as the server, checked on submit so nothing nags while typing
const validate = ({ name, email, password }) => {
    const errors = {};
    if (!name.trim()) errors.name = 'Please enter your name';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) errors.email = 'Please enter a valid email';
    if (password.length < MIN_PASSWORD_LENGTH) errors.password = `Use at least ${MIN_PASSWORD_LENGTH} characters`;
    return errors;
};

function Signup() {
    const [form, setForm] = useState({ name: '', email: '', password: '' });
    const [fieldErrors, setFieldErrors] = useState({});
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const { login } = useAuth();
    const navigate = useNavigate();
    const formRef = useRef(null);

    const update = (key) => (e) => {
        setForm(f => ({ ...f, [key]: e.target.value }));
        if (fieldErrors[key]) setFieldErrors(fe => ({ ...fe, [key]: undefined }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        const errors = validate(form);
        setFieldErrors(errors);
        if (Object.keys(errors).length) {
            // move focus to the first field that needs fixing
            requestAnimationFrame(() => formRef.current?.querySelector('[aria-invalid="true"]')?.focus());
            return;
        }

        setLoading(true);
        try {
            const data = await apiRequest('/api/auth/signup', { method: 'POST', body: form });
            // signup logs the user in, straight to their first upload
            login(data.token);
            navigate('/upload');
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <AuthLayout
            title="Start highlighting"
            subtitle="Free account. Your PDFs stay private to you."
            footer={<>Already have an account? <Link to="/login" className="font-medium text-ink underline decoration-rule-strong underline-offset-4 hover-fine:decoration-ink">Log in</Link></>}
        >
            <form ref={formRef} onSubmit={handleSubmit} className="flex flex-col gap-5" noValidate>
                <FormError>{error}</FormError>

                <Field
                    label="Name"
                    name="name"
                    autoComplete="name"
                    value={form.name}
                    onChange={update('name')}
                    placeholder="Riya Sharma"
                    error={fieldErrors.name}
                />
                <Field
                    label="Email"
                    type="email"
                    name="email"
                    autoComplete="email"
                    inputMode="email"
                    spellCheck={false}
                    value={form.email}
                    onChange={update('email')}
                    placeholder="you@college.edu"
                    error={fieldErrors.email}
                />
                <Field
                    label="Password"
                    type="password"
                    name="password"
                    autoComplete="new-password"
                    value={form.password}
                    onChange={update('password')}
                    hint={`At least ${MIN_PASSWORD_LENGTH} characters`}
                    error={fieldErrors.password}
                />

                <Button type="submit" size="lg" className="mt-2 w-full" disabled={loading}>
                    {loading ? 'Creating your account…' : 'Create account'}
                </Button>
            </form>
        </AuthLayout>
    );
}

export default Signup;

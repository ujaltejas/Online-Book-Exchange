import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useAuthStore from '../../store/useAuthStore';
import { validateEmail } from '../../utils/validation';

const Login = () => {

    const { login } = useAuthStore();

    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });
    const [error, setError] = useState('');
    const [emailError, setEmailError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value
        });

        if (name === 'email') {
            setEmailError('');
        }
    };

    const handleEmailBlur = () => {
        if (formData.email && !validateEmail(formData.email)) {
            setEmailError('Please enter a valid email address (e.g., example@gmail.com)');
        } else {
            setEmailError('');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            // Validate email format
            if (!validateEmail(formData.email)) {
                throw new Error("Please enter a valid email address (e.g., example@gmail.com)");
            }

            if (!formData.password.trim()) {
                throw new Error("Password is required");
            }

            const response = await login(formData);
            if (response.user) {
                navigate('/');
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex min-h-[calc(100vh-80px)] items-center justify-center px-4 py-10">
            <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-lg">
                <div className="mb-6 text-center">
                    <h2 className="text-2xl font-bold text-slate-800">Welcome Back</h2>
                    <p className="mt-1 text-sm text-slate-500">Sign in to access your account</p>
                </div>

                {error && <div className="mb-4 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">{error}</div>}

                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-slate-700">Email</label>
                        <input
                            type="email"
                            id="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            onBlur={handleEmailBlur}
                            required
                            placeholder="Enter your email"
                            className={`w-full rounded-lg border px-3 py-2.5 text-sm focus:outline-none focus:ring-2 ${emailError ? 'border-red-400 ring-red-200' : 'border-slate-300 focus:border-violet-500 focus:ring-violet-200'}`}
                        />
                        {emailError && <div className="mt-1 text-xs text-red-500">{emailError}</div>}
                    </div>

                    <div className="mb-5">
                        <label htmlFor="password" className="mb-1.5 block text-sm font-medium text-slate-700">Password</label>
                        <input
                            type="password"
                            id="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            required
                            placeholder="Enter your password"
                            className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-200"
                        />
                    </div>

                    <button
                        type="submit"
                        className="flex w-full items-center justify-center rounded-lg bg-gradient-to-r from-violet-500 to-violet-600 px-4 py-2.5 font-semibold text-white transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-70"
                        disabled={loading}
                    >
                        {loading ? (
                            <span className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white"></span>
                        ) : (
                            'Sign In'
                        )}
                    </button>
                </form>

                <div className="mt-5 text-center text-sm text-slate-600">
                    <p>
                        Don't have an account?
                        <Link to="/register" className="ml-1 font-semibold text-violet-600 hover:underline">
                            Sign Up
                        </Link>
                    </p>
                </div>

                <div className="mt-4 text-center">
                    <Link to="/" className="text-sm text-slate-500 hover:text-violet-600">
                        <i className="fas fa-home"></i> Back to Home
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default Login;

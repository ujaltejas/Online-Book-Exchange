import { useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useAuthStore from '../../store/useAuthStore';
import { validateEmail } from '../../utils/validation';
import axiosInstance from '../../utils/axios';

const Register = () => {
    const { register } = useAuthStore();
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        confirmPassword: '',
        role: 'user',
    });
    const [avatar, setAvatar] = useState(null);
    const [avatarPreview, setAvatarPreview] = useState(null);
    const [error, setError] = useState('');
    const [emailError, setEmailError] = useState('');
    const [loading, setLoading] = useState(false);
    const fileInputRef = useRef(null);
    const navigate = useNavigate();

    const checkEmailExists = async (email) => {
        try {
            const response = await axiosInstance.post("/auth/check-email", { email });
            return response.data.exists;
        } catch (error) {
            console.error("Error checking email:", error);
            return false;
        }
    };

    const handleEmailBlur = async () => {
        if (!formData.email) return;

        if (!validateEmail(formData.email)) {
            setEmailError('Please enter a valid email address (e.g., example@gmail.com)');
            return;
        }

        try {
            const exists = await checkEmailExists(formData.email);
            if (exists) {
                setEmailError('This email is already registered. Please use a different email address.');
            } else {
                setEmailError('');
            }
        } catch (err) {
            console.error("Error checking email:", err);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value
        });

        // Clear email error when user starts typing again
        if (name === 'email') {
            setEmailError('');
        }
    };

    const handleImageClick = () => {
        fileInputRef.current.click();
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) { // 5MB limit
                setError('Image size should be less than 5MB');
                return;
            }

            if (!file.type.startsWith('image/')) {
                setError('Please upload an image file');
                return;
            }

            setAvatar(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setAvatarPreview(reader.result);
            };
            reader.readAsDataURL(file);
            setError('');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            if (!avatar) {
                throw new Error("Please upload a profile picture");
            }

            if (formData.password !== formData.confirmPassword) {
                throw new Error("Passwords don't match");
            }

            // Validate email format
            if (!validateEmail(formData.email)) {
                throw new Error("Please enter a valid email address (e.g., example@gmail.com)");
            }

            // Check if email is already in use
            const emailExists = await checkEmailExists(formData.email);
            if (emailExists) {
                throw new Error("This email is already registered. Please use a different email address.");
            }

            const formDataToSend = new FormData();
            formDataToSend.append('username', formData.username);
            formDataToSend.append('email', formData.email);
            formDataToSend.append('password', formData.password);
            formDataToSend.append('image', avatar);
            

            await register(formDataToSend);

            // If successful, redirect to login page
            navigate('/login');
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
                    <h2 className="text-2xl font-bold text-slate-800">Create Account</h2>
                    <p className="mt-1 text-sm text-slate-500">Join us and start your journey</p>
                </div>

                {error && <div className="mb-4 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">{error}</div>}

                <form onSubmit={handleSubmit}>
                    <div className="mb-4 flex justify-center" onClick={handleImageClick}>
                        <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleImageChange}
                            accept="image/*"
                            style={{ display: 'none' }}
                        />
                        <div className="h-24 w-24 overflow-hidden rounded-full border-2 border-dashed border-violet-300 bg-violet-50">
                            {avatarPreview ? (
                                <img src={avatarPreview} alt="Avatar preview" className="h-full w-full object-cover" />
                            ) : (
                                <div className="flex h-full w-full flex-col items-center justify-center text-violet-600">
                                    <i className="fas fa-user"></i>
                                    <span className="mt-1 text-xs">Add Avatar</span>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="mb-4">
                        <label htmlFor="username" className="mb-1.5 block text-sm font-medium text-slate-700">Username</label>
                        <input
                            type="text"
                            id="username"
                            name="username"
                            value={formData.username}
                            onChange={handleChange}
                            required
                            placeholder="Choose a username"
                            className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-200"
                        />
                    </div>

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


                    <div className="mb-4">
                        <label htmlFor="password" className="mb-1.5 block text-sm font-medium text-slate-700">Password</label>
                        <input
                            type="password"
                            id="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            required
                            placeholder="Create a password"
                            minLength="6"
                            className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-200"
                        />
                    </div>

                    <div className="mb-5">
                        <label htmlFor="confirmPassword" className="mb-1.5 block text-sm font-medium text-slate-700">Confirm Password</label>
                        <input
                            type="password"
                            id="confirmPassword"
                            name="confirmPassword"
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            required
                            placeholder="Confirm your password"
                            minLength="6"
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
                            'Create Account'
                        )}
                    </button>
                </form>

                <div className="mt-5 text-center text-sm text-slate-600">
                    <p>
                        Already have an account?
                        <Link to="/login" className="ml-1 font-semibold text-violet-600 hover:underline">
                            Sign In
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

export default Register; 
import { useState, useRef, useEffect } from 'react';
import useAuthStore from '../../store/useAuthStore';
import useBookStore from '../../store/useBookStore';
import { useNavigate } from 'react-router-dom';
import { validateEmail } from '../../utils/validation';
import { formatDateDDMMYYYY } from '../../utils/dateFormat';

function Profile() {
    const { user, logout, updateProfile } = useAuthStore();
    const { userBooks, getUserBooks, loading: bookLoading, error: bookError } = useBookStore();
    const [activeTab, setActiveTab] = useState('info');
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({
        username: user?.username || '',
        email: user?.email || '',
    });
    const [imagePreview, setImagePreview] = useState(user?.avatar || '');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [emailError, setEmailError] = useState('');
    const [success, setSuccess] = useState('');
    const fileInputRef = useRef(null);
    const navigate = useNavigate();

    // Fetch user properties when the component mounts or when the user changes
    useEffect(() => {
        if (user && activeTab === 'listings') {
            const fetchBooks = async () => {
                try {
                    await getUserBooks();
                } catch (err) {
                    console.error("Failed to fetch listings:", err);
                }
            };

            fetchBooks();
        }
    }, [user, activeTab, getUserBooks]);

    const handleLogout = async () => {
        await logout();
        navigate('/login');
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

    // Validate email when user finishes typing
    const handleEmailBlur = () => {
        if (formData.email && !validateEmail(formData.email)) {
            setEmailError('Please enter a valid email address (e.g., example@gmail.com)');
        } else {
            setEmailError('');
        }
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setFormData({
                ...formData,
                image: file
            });

            // Create preview URL
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess('');

        try {
            // Validate email format
            if (!validateEmail(formData.email)) {
                throw new Error("Please enter a valid email address (e.g., example@gmail.com)");
            }

            await updateProfile(formData);
            setSuccess('Profile updated successfully!');
            setIsEditing(false);
        } catch (err) {
            setError(err.message || err.response?.data?.message || 'Failed to update profile');
        } finally {
            setLoading(false);
        }
    };

    const triggerFileInput = () => {
        fileInputRef.current.click();
    };

    const handleAddBook = () => {
        navigate('/add-book');
    };

    const inputClass =
        "w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-200";

    if (!user) {
        return (
            <div className="mx-auto max-w-5xl px-4 py-10 md:px-6">
                <div className="rounded-lg bg-white p-8 text-center shadow-sm">
                    <h2 className="text-xl font-semibold text-slate-700">Please login to view your profile</h2>
                </div>
            </div>
        );
    }

    return (
        <div className="mx-auto max-w-6xl px-4 py-8 md:px-6">
            <div className="overflow-hidden rounded-2xl bg-white shadow-sm">
                <div className="h-28 bg-gradient-to-r from-violet-500 to-indigo-500"></div>
                <div className="-mt-12 flex flex-col gap-4 px-5 pb-6 md:flex-row md:items-end md:justify-between md:px-8">
                    <div className="flex items-center gap-4">
                    <div
                        className={`h-24 w-24 overflow-hidden rounded-full border-4 border-white bg-violet-100 ${isEditing ? 'cursor-pointer' : ''}`}
                        onClick={isEditing ? triggerFileInput : null}
                    >
                        {isEditing && (
                            <input
                                type="file"
                                ref={fileInputRef}
                                onChange={handleImageChange}
                                accept="image/*"
                                style={{ display: 'none' }}
                            />
                        )}
                        {imagePreview ? (
                            <img src={imagePreview} alt="Profile" className="h-full w-full object-cover" />
                        ) : (
                            <div className="flex h-full w-full items-center justify-center text-3xl font-bold text-violet-700">
                                {user.username ? user.username[0].toUpperCase() : 'U'}
                            </div>
                        )}
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-slate-800">{user.username || 'User'}</h1>
                        <p className="text-slate-500">{user.email}</p>
                    </div>
                    </div>
                    <button
                        className="rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm font-medium text-red-600 transition hover:bg-red-100"
                        onClick={handleLogout}>
                        Logout
                    </button>
                </div>
            </div>

            <div className="mt-6 rounded-2xl bg-white p-5 shadow-sm md:p-8">
                <div className="mb-6 flex gap-2 border-b border-slate-200 pb-3">
                    <button
                        className={`rounded-lg px-4 py-2 text-sm font-medium transition ${activeTab === 'info' ? 'bg-violet-100 text-violet-700' : 'text-slate-600 hover:bg-slate-100'}`}
                        onClick={() => setActiveTab('info')}
                    >
                        Personal Info
                    </button>
                    <button
                        className={`rounded-lg px-4 py-2 text-sm font-medium transition ${activeTab === 'listings' ? 'bg-violet-100 text-violet-700' : 'text-slate-600 hover:bg-slate-100'}`}
                        onClick={() => setActiveTab('listings')}
                    >
                        My Listings
                    </button>
                </div>

                <div>
                    {activeTab === 'info' && (
                        <div>
                            {error && <div className="mb-4 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">{error}</div>}
                            {success && <div className="mb-4 rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-600">{success}</div>}

                            {isEditing ? (
                                <form onSubmit={handleSubmit} className="space-y-4">
                                    <div>
                                        <label htmlFor="username" className="mb-1.5 block text-sm font-medium text-slate-700">Username</label>
                                        <input
                                            type="text"
                                            id="username"
                                            name="username"
                                            value={formData.username}
                                            onChange={handleChange}
                                            required
                                            className={inputClass}
                                        />
                                    </div>
                                    <div>
                                        <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-slate-700">Email</label>
                                        <input
                                            type="email"
                                            id="email"
                                            name="email"
                                            value={formData.email}
                                            onChange={handleChange}
                                            onBlur={handleEmailBlur}
                                            required
                                            className={`${inputClass} ${emailError ? 'border-red-400 ring-red-200' : ''}`}
                                        />
                                        {emailError && <div className="mt-1 text-xs text-red-500">{emailError}</div>}
                                    </div>
                                    <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
                                        <button
                                            type="button"
                                            className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
                                            onClick={() => {
                                                setIsEditing(false);
                                                setFormData({
                                                    username: user.username || '',
                                                    email: user.email || ''
                                                });
                                                setImagePreview(user.avatar || '');
                                                setError('');
                                                setSuccess('');
                                            }}
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type="submit"
                                            className="rounded-lg bg-violet-600 px-4 py-2 text-sm font-semibold text-white hover:bg-violet-700 disabled:cursor-not-allowed disabled:bg-violet-300"
                                            disabled={loading}
                                        >
                                            {loading ? 'Saving...' : 'Save Changes'}
                                        </button>
                                    </div>
                                </form>
                            ) : (
                                <>
                                    <div className="mb-4 rounded-xl border border-slate-200 p-5">
                                        <div className="mb-3 flex items-center justify-between gap-3">
                                            <h3 className="text-lg font-semibold text-slate-800">Contact Information</h3>
                                            <button
                                                className="rounded-lg bg-violet-100 px-3 py-1.5 text-sm font-medium text-violet-700 hover:bg-violet-200"
                                                onClick={() => setIsEditing(true)}
                                            >
                                                Edit Profile
                                            </button>
                                        </div>
                                        <div className="mb-2 flex items-center justify-between border-b border-slate-100 pb-2">
                                            <span className="text-sm text-slate-500">Username:</span>
                                            <span className="font-medium text-slate-800">{user.username}</span>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm text-slate-500">Email:</span>
                                            <span className="font-medium text-slate-800">{user.email}</span>
                                        </div>

                                    </div>

                                    <div className="rounded-xl border border-slate-200 p-5">
                                        <h3 className="mb-3 text-lg font-semibold text-slate-800">Account Information</h3>
                                        <div className="mb-2 flex items-center justify-between border-b border-slate-100 pb-2">
                                            <span className="text-sm text-slate-500">Member Since:</span>
                                            <span className="font-medium text-slate-800">
                                                {user.createdAt ? formatDateDDMMYYYY(user.createdAt) : 'N/A'}
                                            </span>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm text-slate-500">Account Type:</span>
                                            <span className="font-medium capitalize text-slate-800">{user.role || 'Regular User'}</span>
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>
                    )}

                    {activeTab === 'listings' && (
                        <div>
                            <div className="mb-5 flex items-center justify-between">
                                <h3 className="text-xl font-semibold text-slate-800">My listings</h3>
                                <button
                                    className="rounded-lg bg-violet-600 px-4 py-2 text-sm font-semibold text-white hover:bg-violet-700"
                                    onClick={handleAddBook}
                                >
                                    Add book
                                </button>
                            </div>
                            <div className="grid gap-4 md:grid-cols-2">
                                {bookLoading ? (
                                    <div className="col-span-full rounded-lg border border-slate-200 bg-slate-50 p-4 text-slate-600">Loading your listings…</div>
                                ) : bookError ? (
                                    <div className="col-span-full rounded-lg border border-red-200 bg-red-50 p-4">
                                        <p className="text-sm text-red-600">Error loading listings: {bookError}</p>
                                        <button
                                            className="mt-3 rounded-lg bg-red-600 px-3 py-2 text-sm font-medium text-white"
                                            onClick={() => getUserBooks()}
                                        >
                                            Retry
                                        </button>
                                    </div>
                                ) : userBooks && userBooks.length > 0 ? (
                                    userBooks.map((book) => (
                                        <div key={book._id} className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
                                            <div className="h-44 bg-slate-100">
                                                {book.images && book.images.length > 0 ? (
                                                    <img src={book.images[0].url || book.images[0]} alt={book.title} className="h-full w-full object-cover" />
                                                ) : (
                                                    <div className="flex h-full items-center justify-center text-slate-500">No cover</div>
                                                )}
                                            </div>
                                            <div className="p-4">
                                                <h4 className="text-lg font-semibold text-slate-800">{book.title}</h4>
                                                <p className="mt-1 text-violet-600">{book.author}</p>
                                                <p className="mt-1 text-sm text-slate-600">
                                                    {book.university && book.college
                                                      ? `${book.university} · ${book.college}`
                                                      : book.university || book.college || '—'}
                                                </p>
                                                <p className="mt-1 text-sm text-slate-500">
                                                    {book.category} · {book.condition} · {book.exchangeType === 'free' ? 'Free' : 'Exchange'}
                                                </p>
                                                <div className="mt-2">
                                                    <span className="rounded bg-violet-100 px-2 py-1 text-xs text-violet-700">{book.exchangeType === 'free' ? 'Donate' : 'Swap'}</span>
                                                </div>
                                                <div className="mt-4 flex gap-2">
                                                    <button
                                                        className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-100"
                                                        onClick={() => navigate(`/edit-book/${book._id}`)}
                                                    >
                                                        Edit
                                                    </button>
                                                    <button
                                                        className="rounded-lg bg-violet-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-violet-700"
                                                        onClick={() => navigate(`/my-book/${book._id}`)}
                                                    >
                                                        View
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="col-span-full rounded-lg border border-slate-200 bg-slate-50 p-5 text-slate-600">
                                        No listings yet. Click &quot;Add book&quot; to list your first title.
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default Profile; 
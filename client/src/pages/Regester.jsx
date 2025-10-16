import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAppContext } from "../context/context";
import { FaUser, FaEnvelope, FaLock, FaGoogle } from "react-icons/fa";

const Register = () => {
    const navigate = useNavigate();
    const { authAPI, loading } = useAppContext();

    const [formData, setFormData] = useState({
        username: "",
        email: "",
        password: "",
    });

    const [errors, setErrors] = useState({});
    const [apiError, setApiError] = useState("");

    const { username, email, password } = formData;

    // Handle input changes
    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
        // Clear error when user starts typing
        if (errors[e.target.name]) {
            setErrors({
                ...errors,
                [e.target.name]: "",
            });
        }
        setApiError("");
    };

    // Frontend validation
    const validateForm = () => {
        const newErrors = {};

        // Username validation (3-30 characters)
        if (!username.trim()) {
            newErrors.username = "Username is required";
        } else if (username.length < 3) {
            newErrors.username = "Username must be at least 3 characters";
        } else if (username.length > 30) {
            newErrors.username = "Username cannot exceed 30 characters";
        }

        // Email validation
        const emailRegex = /^\S+@\S+\.\S+$/;
        if (!email.trim()) {
            newErrors.email = "Email is required";
        } else if (!emailRegex.test(email)) {
            newErrors.email = "Please provide a valid email";
        }

        // Password validation (minimum 6 characters)
        if (!password) {
            newErrors.password = "Password is required";
        } else if (password.length < 6) {
            newErrors.password = "Password must be at least 6 characters";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // Handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault();
        setApiError("");

        // Validate form
        if (!validateForm()) {
            return;
        }

        try {
            const response = await authAPI.register({
                username: username.trim(),
                email: email.trim().toLowerCase(),
                password,
            });

            if (response.success) {
                // Registration successful, navigate to home or dashboard
                navigate("/");
            }
        } catch (error) {
            console.error("Registration error:", error);

            // Handle validation errors from backend
            if (error.errors && Array.isArray(error.errors)) {
                const backendErrors = {};
                error.errors.forEach((err) => {
                    backendErrors[err.path || err.param] = err.msg;
                });
                setErrors(backendErrors);
            } else {
                // Handle general error messages
                setApiError(error.message || "Registration failed. Please try again.");
            }
        }
    };

    // Handle Google Sign Up (placeholder)
    const handleGoogleSignUp = () => {
        // TODO: Implement Google OAuth
        alert("Google Sign Up - Coming Soon!");
    };

    return (
        <div className="min-h-screen bg-black flex items-center justify-center px-4 py-8">
            <div className="w-full max-w-md">
                {/* Registration Card */}
                <div className="bg-gradient-to-b from-gray-900 to-black border border-gray-800 rounded-2xl p-8 shadow-2xl">
                    {/* Header */}
                    <div className="text-center mb-8">
                        <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-600 bg-clip-text text-transparent mb-2">
                            Join Rhyme Rivals
                        </h1>
                        <p className="text-gray-400 text-sm">
                            Unleash your lyrical flow and battle AI opponents.
                        </p>
                    </div>

                    {/* Error Message */}
                    {apiError && (
                        <div className="mb-6 p-3 bg-red-500/10 border border-red-500/50 rounded-lg text-red-400 text-sm">
                            {apiError}
                        </div>
                    )}

                    {/* Registration Form */}
                    <form onSubmit={handleSubmit} className="space-y-5">
                        {/* Username Field */}
                        <div>
                            <label htmlFor="username" className="block text-sm font-medium text-gray-300 mb-2">
                                Username
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <FaUser className="text-gray-500" />
                                </div>
                                <input
                                    type="text"
                                    id="username"
                                    name="username"
                                    value={username}
                                    onChange={handleChange}
                                    placeholder="Enter your unique battle tag"
                                    className={`w-full bg-gray-800/50 border ${errors.username ? "border-red-500" : "border-gray-700"
                                        } rounded-lg py-3 px-10 text-white placeholder-gray-500 focus:outline-none focus:ring-2 ${errors.username ? "focus:ring-red-500" : "focus:ring-purple-500"
                                        } transition-all`}
                                />
                            </div>
                            {errors.username && (
                                <p className="mt-1 text-xs text-red-400">{errors.username}</p>
                            )}
                        </div>

                        {/* Email Field */}
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                                Email Address
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <FaEnvelope className="text-gray-500" />
                                </div>
                                <input
                                    type="email"
                                    id="email"
                                    name="email"
                                    value={email}
                                    onChange={handleChange}
                                    placeholder="name@example.com"
                                    className={`w-full bg-gray-800/50 border ${errors.email ? "border-red-500" : "border-gray-700"
                                        } rounded-lg py-3 px-10 text-white placeholder-gray-500 focus:outline-none focus:ring-2 ${errors.email ? "focus:ring-red-500" : "focus:ring-purple-500"
                                        } transition-all`}
                                />
                            </div>
                            {errors.email && (
                                <p className="mt-1 text-xs text-red-400">{errors.email}</p>
                            )}
                        </div>

                        {/* Password Field */}
                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
                                Password
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <FaLock className="text-gray-500" />
                                </div>
                                <input
                                    type="password"
                                    id="password"
                                    name="password"
                                    value={password}
                                    onChange={handleChange}
                                    placeholder="Create a strong password"
                                    className={`w-full bg-gray-800/50 border ${errors.password ? "border-red-500" : "border-gray-700"
                                        } rounded-lg py-3 px-10 text-white placeholder-gray-500 focus:outline-none focus:ring-2 ${errors.password ? "focus:ring-red-500" : "focus:ring-purple-500"
                                        } transition-all`}
                                />
                            </div>
                            {errors.password && (
                                <p className="mt-1 text-xs text-red-400">{errors.password}</p>
                            )}
                        </div>

                        {/* Register Button */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-gradient-to-r from-cyan-400 to-cyan-600 hover:from-cyan-500 hover:to-cyan-700 text-black font-bold py-3 px-4 rounded-lg transition-all duration-200 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                        >
                            {loading ? (
                                <span className="flex items-center justify-center">
                                    <svg className="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24">
                                        <circle
                                            className="opacity-25"
                                            cx="12"
                                            cy="12"
                                            r="10"
                                            stroke="currentColor"
                                            strokeWidth="4"
                                            fill="none"
                                        />
                                        <path
                                            className="opacity-75"
                                            fill="currentColor"
                                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                        />
                                    </svg>
                                    Registering...
                                </span>
                            ) : (
                                "Register Now"
                            )}
                        </button>

                        {/* Divider */}
                        <div className="relative my-6">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-gray-700"></div>
                            </div>
                            <div className="relative flex justify-center text-sm">
                                <span className="px-2 bg-gradient-to-b from-gray-900 to-black text-gray-400">
                                    or
                                </span>
                            </div>
                        </div>

                        {/* Google Sign Up Button */}
                        <button
                            type="button"
                            onClick={handleGoogleSignUp}
                            className="w-full bg-gray-800/50 hover:bg-gray-800 border border-gray-700 text-white font-medium py-3 px-4 rounded-lg transition-all duration-200 flex items-center justify-center gap-2"
                        >
                            <FaGoogle className="text-lg" />
                            Sign up with Google
                        </button>
                    </form>

                    {/* Footer */}
                    <div className="mt-6 text-center text-sm">
                        <span className="text-gray-400">Already have an account? </span>
                        <Link
                            to="/login"
                            className="text-cyan-400 hover:text-cyan-300 font-medium transition-colors"
                        >
                            Log in
                        </Link>
                    </div>

                    {/* Terms & Privacy */}
                    <p className="mt-6 text-center text-xs text-gray-500">
                        By registering you agree to Rhyme Rivals'{" "}
                        <Link to="/terms" className="text-cyan-400 hover:underline">
                            Terms of Service
                        </Link>{" "}
                        and{" "}
                        <Link to="/privacy" className="text-cyan-400 hover:underline">
                            Privacy Policy
                        </Link>
                        .
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Register;

import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAppContext } from "../context/context";
import { FaEnvelope, FaLock } from "react-icons/fa";

const Login = () => {
    const navigate = useNavigate();
    const { authAPI, loading } = useAppContext();

    const [formData, setFormData] = useState({
        email: "",
        password: "",
    });

    const [errors, setErrors] = useState({});
    const [apiError, setApiError] = useState("");

    const { email, password } = formData;

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

        // Email validation
        const emailRegex = /^\S+@\S+\.\S+$/;
        if (!email.trim()) {
            newErrors.email = "Email is required";
        } else if (!emailRegex.test(email)) {
            newErrors.email = "Please provide a valid email";
        }

        // Password validation
        if (!password) {
            newErrors.password = "Password is required";
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
            const response = await authAPI.login({
                email: email.trim().toLowerCase(),
                password,
            });

            if (response.success) {
                // Login successful, navigate to home or dashboard
                navigate("/");
            }
        } catch (error) {
            console.error("Login error:", error);
            setApiError(error.message || "Invalid credentials. Please try again.");
        }
    };

    return (
        <div className="min-h-screen bg-black flex items-center justify-center px-4 py-8 relative overflow-hidden">
            {/* Background Decorative Circles */}
            <div className="absolute top-0 left-0 w-64 h-64 bg-purple-900/20 rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 right-0 w-96 h-96 bg-teal-900/20 rounded-full blur-3xl"></div>
            <div className="absolute top-1/2 left-1/4 w-48 h-48 bg-teal-800/20 rounded-full blur-3xl"></div>

            <div className="w-full max-w-md relative z-10">
                {/* Login Card */}
                <div className="bg-gradient-to-b from-gray-900/90 to-black/90 backdrop-blur-sm border border-gray-800 rounded-2xl p-8 shadow-2xl">
                    {/* Header */}
                    <div className="text-center mb-8">
                        <h1 className="text-3xl font-bold text-white mb-2">
                            Login to Rhyme Rivals
                        </h1>
                        <p className="text-gray-400 text-sm">
                            Unleash your lyrical prowess.
                        </p>
                    </div>

                    {/* Error Message */}
                    {apiError && (
                        <div className="mb-6 p-3 bg-red-500/10 border border-red-500/50 rounded-lg text-red-400 text-sm">
                            {apiError}
                        </div>
                    )}

                    {/* Login Form */}
                    <form onSubmit={handleSubmit} className="space-y-5">
                        {/* Email Field */}
                        <div>
                            <label
                                htmlFor="email"
                                className="block text-sm font-medium text-gray-300 mb-2"
                            >
                                Email
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
                                    placeholder="Enter your username or email"
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
                            <div className="flex items-center justify-between mb-2">
                                <label
                                    htmlFor="password"
                                    className="block text-sm font-medium text-gray-300"
                                >
                                    Password
                                </label>
                                <Link
                                    to="/forgot-password"
                                    className="text-xs text-cyan-400 hover:text-cyan-300 transition-colors"
                                >
                                    Forgot Password?
                                </Link>
                            </div>
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
                                    placeholder="Enter your password"
                                    className={`w-full bg-gray-800/50 border ${errors.password ? "border-red-500" : "border-gray-700"
                                        } rounded-lg py-3 px-10 text-white placeholder-gray-500 focus:outline-none focus:ring-2 ${errors.password ? "focus:ring-red-500" : "focus:ring-purple-500"
                                        } transition-all`}
                                />
                            </div>
                            {errors.password && (
                                <p className="mt-1 text-xs text-red-400">{errors.password}</p>
                            )}
                        </div>

                        {/* Login Button */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-gradient-to-r from-purple-500 to-purple-700 hover:from-purple-600 hover:to-purple-800 text-white font-bold py-3 px-4 rounded-lg transition-all duration-200 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 shadow-lg shadow-purple-500/30"
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
                                    Logging in...
                                </span>
                            ) : (
                                "Login"
                            )}
                        </button>
                    </form>

                    {/* Footer */}
                    <div className="mt-6 text-center text-sm">
                        <span className="text-gray-400">Don't have an account? </span>
                        <Link
                            to="/register"
                            className="text-cyan-400 hover:text-cyan-300 font-medium transition-colors"
                        >
                            Register Here
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;

import React from "react";
import { useState } from "react";
import { Alert } from "@material-tailwind/react";
import { WarningCircle, Eye, EyeClosed } from "iconoir-react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function Register() {
    const navigate = useNavigate();
    const [res, setRes] = useState();
    const [loading, setLoading] = useState(false);
    // Add these state declarations at the top with other states
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [formData, setFormData] = useState({
        userName: "",
        email: "",
        phone: "",
        address: "",
        password: "",
        confirmPassword: ""
    });

    const [errors, setErrors] = useState({});

    const validateForm = () => {
        const newErrors = {};
        if (!formData.userName) newErrors.userName = "Name is required";
        if (!formData.email) newErrors.email = "Email is required";
        else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = "Email is invalid";
        if (!formData.phone) newErrors.phone = "Phone number is required";
        if (!formData.password) newErrors.password = "Password is required";
        else if (formData.password.length < 6) newErrors.password = "Password must be at least 6 characters";
        if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = "Passwords do not match";

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!validateForm()) return;
        
        setLoading(true);
        try {
            const response = await axios.post('http://localhost:3000/auth/register', {
                userName: formData.userName,
                email: formData.email,
                phone: formData.phone,
                address: formData.address,
                password: formData.password
            });
            
            if (response.data.status === 200) {
                setRes({
                    type: 'success',
                    message: 'Registration successful! Please check your email for verification.'
                });
                navigate('/verify-email', { state: { email: formData.email } });
            }
        } catch (error) {
            setRes({
                type: 'error',
                message: error.response?.data?.message || 'Registration failed'
            });
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        // Clear error when user starts typing
        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: ''
            }));
        }
    };

    return (
        <div>
            <div className="max-w-4xl max-sm:max-w-lg mx-auto font-[sans-serif] px-16 py-5 w-2/5 my-5 border-red-200 border-spacing-1 border rounded-3xl">
                {res && (
                    <Alert 
                        color={res.type === 'success' ? "green" : "red"}
                        className="mb-4"
                    >
                        {res.message}
                    </Alert>
                )}

                <div className="text-center mb-2 sm:mb-6">
                    <h4 className="text-gray-800 mt-3 text-left text-2xl/9 font-bold tracking-tight">
                        Create an account
                    </h4>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="grid sm:grid-cols-1 gap-6">
                        <div>
                            <label className="text-gray-600 text-sm mb-2 block text-left">
                                Full Name
                            </label>
                            <input
                                name="userName"
                                type="text"
                                className={`bg-gray-100 w-full text-gray-800 text-sm px-4 py-3 rounded focus:bg-transparent outline-blue-500 transition-all border ${
                                    errors.userName ? 'border-red-500' : ''
                                }`}
                                placeholder="Enter full name"
                                value={formData.userName}
                                onChange={handleChange}
                            />
                            {errors.userName && (
                                <p className="text-red-500 text-xs mt-1">{errors.userName}</p>
                            )}
                        </div>

                        <div className="flex">
                            <div className="w-1/2 mr-3">
                                <label className="text-gray-600 text-sm mb-2 block text-left">
                                    Email
                                </label>
                                <input
                                    name="email"
                                    type="email"
                                    className={`bg-gray-100 w-full text-gray-800 text-sm px-4 py-3 rounded focus:bg-transparent outline-blue-500 transition-all border ${
                                        errors.email ? 'border-red-500' : ''
                                    }`}
                                    placeholder="Enter email"
                                    value={formData.email}
                                    onChange={handleChange}
                                />
                                {errors.email && (
                                    <p className="text-red-500 text-xs mt-1">{errors.email}</p>
                                )}
                            </div>
                            <div className="w-1/2">
                                <label className="text-gray-600 text-sm mb-2 block text-left">
                                    Phone Number
                                </label>
                                <input
                                    name="phone"
                                    type="tel"
                                    className={`bg-gray-100 w-full text-gray-800 text-sm px-4 py-3 rounded focus:bg-transparent outline-blue-500 transition-all border ${
                                        errors.phone ? 'border-red-500' : ''
                                    }`}
                                    placeholder="Enter phone number"
                                    value={formData.phone}
                                    onChange={handleChange}
                                />
                                {errors.phone && (
                                    <p className="text-red-500 text-xs mt-1">{errors.phone}</p>
                                )}
                            </div>
                        </div>

                        <div>
                            <label className="text-gray-600 text-sm mb-2 block text-left">
                                Address
                            </label>
                            <input
                                name="address"
                                type="text"
                                className="bg-gray-100 w-full text-gray-800 text-sm px-4 py-3 rounded focus:bg-transparent outline-blue-500 transition-all border"
                                placeholder="Enter address"
                                value={formData.address}
                                onChange={handleChange}
                            />
                        </div>

                        <div>
                            <label className="text-gray-600 text-sm mb-2 block text-left">
                                Password
                            </label>
                            <div className="relative">
                                <input
                                    name="password"
                                    type={showPassword ? "text" : "password"}
                                    className={`bg-gray-100 w-full text-gray-800 text-sm px-4 py-3 rounded focus:bg-transparent outline-blue-500 transition-all border ${
                                        errors.password ? 'border-red-500' : ''
                                    } pr-10`}
                                    placeholder="Enter password"
                                    value={formData.password}
                                    onChange={handleChange}
                                />
                                <button
                                    type="button"
                                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                                    onClick={() => setShowPassword(!showPassword)}
                                >
                                    {showPassword ? (
                                        <EyeClosed className="h-5 w-5 text-gray-400" />
                                    ) : (
                                        <Eye className="h-5 w-5 text-gray-400" />
                                    )}
                                </button>
                            </div>
                            {errors.password && (
                                <p className="text-red-500 text-xs mt-1">{errors.password}</p>
                            )}
                        </div>

                        <div>
                            <label className="text-gray-600 text-sm mb-2 block text-left">
                                Confirm Password
                            </label>
                            <div className="relative">
                                <input
                                    name="confirmPassword"
                                    type={showConfirmPassword ? "text" : "password"}
                                    className={`bg-gray-100 w-full text-gray-800 text-sm px-4 py-3 rounded focus:bg-transparent outline-blue-500 transition-all border ${
                                        errors.confirmPassword ? 'border-red-500' : ''
                                    } pr-10`}
                                    placeholder="Confirm password"
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
                                />
                                <button
                                    type="button"
                                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                >
                                    {showConfirmPassword ? (
                                        <EyeClosed className="h-5 w-5 text-gray-400" />
                                    ) : (
                                        <Eye className="h-5 w-5 text-gray-400" />
                                    )}
                                </button>
                            </div>
                            {errors.confirmPassword && (
                                <p className="text-red-500 text-xs mt-1">{errors.confirmPassword}</p>
                            )}
                        </div>
                    </div>

                    <div className="mt-8">
                        <button
                            type="submit"
                            disabled={loading}
                            className="mx-auto block py-3 px-6 text-sm tracking-wider rounded text-white bg-blue-600 hover:bg-blue-700 focus:outline-none disabled:bg-blue-400 disabled:cursor-not-allowed"
                        >
                            {loading ? 'Signing up...' : 'Sign up'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default Register;

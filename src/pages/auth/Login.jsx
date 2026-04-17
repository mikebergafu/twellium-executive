import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { User, Lock, Eye, EyeOff, LogIn, AlertCircle } from 'lucide-react';

const Login = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [rememberMe, setRememberMe] = useState(true);
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [mounted, setMounted] = useState(false);

    const { login } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        document.body.classList.add('account-page', 'bg-white');
        setMounted(true);
        return () => {
            document.body.classList.remove('account-page', 'bg-white');
        };
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        const result = await login(username, password);

        if (result.success) {
            navigate('/mode-selection');
        } else {
            setError(result.message || 'Invalid credentials');
        }
        setIsLoading(false);
    };

    return (
        <div className="main-wrapper">
            <div className="overflow-hidden p-0 acc-vh">
                <div className="row vh-100 w-100 g-0">

                    {/* Left: Login Form */}
                    <div className="col-lg-6 vh-100 overflow-y-auto overflow-x-hidden bg-white">
                        <div className="row">
                            <div className="col-md-10 mx-auto">
                                <form
                                    onSubmit={handleSubmit}
                                    className="vh-100 d-flex justify-content-between flex-column p-5 pb-4"
                                    style={{
                                        opacity: mounted ? 1 : 0,
                                        transform: mounted ? 'translateY(0)' : 'translateY(20px)',
                                        transition: 'all 0.6s ease-out'
                                    }}
                                >
                                    {/* Logo */}
                                    <div className="text-center mb-5 auth-logo" style={{
                                        animation: mounted ? 'fadeInDown 0.8s ease-out' : 'none'
                                    }}>

                                        <img src="/logo.jpeg" className="img-fluid" alt="Logo" style={{ maxWidth: '160px' }} />
                                    </div>

                                    <div>
                                        {/* Heading */}
                                        <div className="mb-5" style={{
                                            animation: mounted ? 'fadeInUp 0.8s ease-out 0.2s both' : 'none'
                                        }}>
                                            <h1 className="mb-2 fw-bold text-slate-900" style={{ fontSize: '2rem' }}>Welcome Back</h1>
                                            <p className="mb-0 text-slate-500">Access the Twellium admin panel</p>
                                        </div>

                                        {/* Username */}
                                        <div className="mb-4" style={{
                                            animation: mounted ? 'fadeInUp 0.8s ease-out 0.3s both' : 'none'
                                        }}>
                                            <label className="form-label fw-semibold text-slate-700">Username</label>
                                            <div className="input-group input-group-lg">
                                                <span className="input-group-text bg-slate-50 border-slate-200 text-slate-400">
                                                    <User className="h-5 w-5" />
                                                </span>
                                                <input
                                                    type="text"
                                                    className="form-control border-slate-200"
                                                    placeholder="Enter your username"
                                                    value={username}
                                                    onChange={(e) => setUsername(e.target.value)}
                                                    required
                                                    style={{ transition: 'all 0.3s ease' }}
                                                />
                                            </div>
                                        </div>

                                        {/* Password */}
                                        <div className="mb-4" style={{
                                            animation: mounted ? 'fadeInUp 0.8s ease-out 0.4s both' : 'none'
                                        }}>
                                            <label className="form-label fw-semibold text-slate-700">Password</label>
                                            <div className="input-group input-group-lg">
                                                <span className="input-group-text bg-slate-50 border-slate-200 text-slate-400">
                                                    <Lock className="h-5 w-5" />
                                                </span>
                                                <input
                                                    type={showPassword ? 'text' : 'password'}
                                                    className="form-control border-slate-200"
                                                    placeholder="Enter your password"
                                                    value={password}
                                                    onChange={(e) => setPassword(e.target.value)}
                                                    required
                                                    style={{ transition: 'all 0.3s ease' }}
                                                />
                                                <button
                                                    type="button"
                                                    className="input-group-text bg-slate-50 border-slate-200 text-slate-400 hover:text-slate-600"
                                                    onClick={() => setShowPassword(!showPassword)}
                                                    style={{ cursor: 'pointer', transition: 'all 0.2s ease' }}
                                                >
                                                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                                </button>
                                            </div>
                                        </div>

                                        {/* Remember / Forgot */}
                                        <div className="d-flex align-items-center justify-content-between mb-4" style={{
                                            animation: mounted ? 'fadeInUp 0.8s ease-out 0.5s both' : 'none'
                                        }}>
                                            <div className="form-check form-check-md d-flex align-items-center">
                                                <input
                                                    className="form-check-input mt-0"
                                                    type="checkbox"
                                                    id="rememberMe"
                                                    checked={rememberMe}
                                                    onChange={(e) => setRememberMe(e.target.checked)}
                                                />
                                                <label className="form-check-label text-slate-700 ms-2" htmlFor="rememberMe">
                                                    Remember Me
                                                </label>
                                            </div>
                                            <div className="text-end">
                                                <a href="#" className="text-primary fw-medium text-decoration-none hover-underline">Forgot Password?</a>
                                            </div>
                                        </div>

                                        {/* Error Alert */}
                                        {error && (
                                            <div className="alert alert-danger py-3 mb-4 d-flex align-items-center gap-3" role="alert" style={{
                                                animation: 'shake 0.5s ease-in-out',
                                                borderLeft: '4px solid #dc2626',
                                                backgroundColor: '#fef2f2'
                                            }}>
                                                <AlertCircle className="h-5 w-5 flex-shrink-0" />
                                                <span>{error}</span>
                                            </div>
                                        )}

                                        {/* Submit */}
                                        <div className="mb-3" style={{
                                            animation: mounted ? 'fadeInUp 0.8s ease-out 0.6s both' : 'none'
                                        }}>
                                            <button
                                                type="submit"
                                                className="btn btn-primary btn-lg w-100 py-3 fw-semibold"
                                                disabled={isLoading}
                                                style={{
                                                    transition: 'all 0.3s ease',
                                                    transform: isLoading ? 'scale(0.98)' : 'scale(1)',
                                                    boxShadow: '0 4px 14px rgba(37, 99, 235, 0.3)'
                                                }}
                                            >
                                                {isLoading ? (
                                                    <>
                                                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                                        Signing In...
                                                    </>
                                                ) : (
                                                    <>
                                                        <LogIn className="h-5 w-5 me-2 d-inline-block" />
                                                        Sign In
                                                    </>
                                                )}
                                            </button>
                                        </div>
                                    </div>

                                    {/* Footer */}
                                    <div className="text-center pb-3" style={{
                                        animation: mounted ? 'fadeIn 1s ease-out 0.8s both' : 'none'
                                    }}>
                                        <p className="text-slate-400 mb-0" style={{ fontSize: '0.875rem' }}>
                                            Copyright © {new Date().getFullYear()} Twellium. All rights reserved.
                                        </p>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>

                    {/* Right: Background Image */}
                    <div className="col-lg-6 d-none d-lg-block vh-100" style={{
                                        backgroundImage: 'url(/twellium-all-products.jpg)',
                                        backgroundSize: 'cover',
                                        backgroundPosition: 'center bottom',
                                        backgroundRepeat: 'no-repeat',
                                        opacity: mounted ? 1 : 0,
                                        transition: 'opacity 1s ease-out 0.3s',
                                        position: 'relative',
                                        overflow: 'hidden'
                                    }}>
                                    </div>

                </div>
            </div>
        </div>
    );
};

export default Login;

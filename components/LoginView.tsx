
import React, { useState, useEffect, useRef } from 'react';
import { login, loginWithGoogle } from '../services/authService';
import type { User } from '../types';
import { AppLogo, AtSymbolIcon, KeyIcon } from './icons';

interface LoginViewProps {
    onLoginSuccess: (user: User) => void;
}

declare global {
    interface Window {
        google: any;
    }
}

const LoginView: React.FC<LoginViewProps> = ({ onLoginSuccess }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const googleButtonRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const initializeGoogleSignIn = () => {
            if (window.google && googleButtonRef.current) {
                window.google.accounts.id.initialize({
                    client_id: "972968175079-imdg0c4am5a2m0popckvgmbtrof1r0qm.apps.googleusercontent.com",
                    callback: handleGoogleCallback
                });
                window.google.accounts.id.renderButton(
                    googleButtonRef.current,
                    { theme: "filled_black", size: "large", width: 340, text: "continue_with" }
                );
            }
        };

        // Check if script is already loaded
        if (window.google) {
            initializeGoogleSignIn();
        } else {
            // Check interval in case script loads late
            const intervalId = setInterval(() => {
                if (window.google) {
                    initializeGoogleSignIn();
                    clearInterval(intervalId);
                }
            }, 100);
            return () => clearInterval(intervalId);
        }
    }, []);

    const handleGoogleCallback = async (response: any) => {
        setIsLoading(true);
        try {
            const user = await loginWithGoogle(response.credential);
            onLoginSuccess(user);
        } catch (e) {
            setError('Google sign-in failed. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        if (!email || !password) {
            setError('Please enter both email and password.');
            return;
        }
        setIsLoading(true);
        const user = await login(email, password);
        setIsLoading(false);
        if (user) {
            onLoginSuccess(user);
        } else {
            setError('Invalid email or password. Please try again.');
        }
    };

    const handleSignUp = () => {
        alert('Account creation is not implemented in this demo.');
    };

    return (
        <div className="bg-zinc-900 text-white min-h-screen flex flex-col items-center justify-center p-4">
            <div className="w-full max-w-sm">
                <div className="flex flex-col items-center mb-8">
                    <AppLogo />
                    <h1 className="text-3xl font-bold mt-4">Planify</h1>
                    <p className="text-zinc-400 mt-1">Sign in to access your study plans.</p>
                </div>

                <form onSubmit={handleLogin} className="space-y-6">
                    <div>
                        <label htmlFor="email" className="text-sm font-medium text-zinc-300 block mb-2">Email Address</label>
                        <div className="relative">
                            <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                                <AtSymbolIcon className="h-5 w-5 text-zinc-400" />
                            </span>
                            <input
                                id="email"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="robert.wilson@msl.com"
                                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg p-3 pl-10 text-sm text-white placeholder-zinc-500 focus:ring-blue-500 focus:border-blue-500"
                                disabled={isLoading}
                                autoComplete="email"
                            />
                        </div>
                    </div>
                    <div>
                        <label htmlFor="password" className="text-sm font-medium text-zinc-300 block mb-2">Password</label>
                         <div className="relative">
                            <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                                <KeyIcon className="h-5 w-5 text-zinc-400" />
                            </span>
                            <input
                                id="password"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••"
                                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg p-3 pl-10 text-sm text-white placeholder-zinc-500 focus:ring-blue-500 focus:border-blue-500"
                                disabled={isLoading}
                                autoComplete="current-password"
                            />
                        </div>
                    </div>

                    {error && <p className="text-red-400 text-sm text-center">{error}</p>}
                    
                    <button type="submit" disabled={isLoading} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg transition-colors disabled:bg-zinc-600 disabled:cursor-not-allowed flex items-center justify-center">
                        {isLoading ? (
                           <>
                             <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                               <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                               <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                             </svg>
                             Signing In...
                           </>
                        ) : 'Sign In'}
                    </button>
                </form>

                <div className="text-center text-sm mt-6">
                    <span className="text-zinc-400">Don't have an account? </span>
                    <button onClick={handleSignUp} className="font-semibold text-blue-500 hover:text-blue-400">
                        Sign up
                    </button>
                </div>

                <div className="relative flex py-5 items-center">
                    <div className="flex-grow border-t border-zinc-700"></div>
                    <span className="flex-shrink mx-4 text-zinc-500 text-xs uppercase">Or</span>
                    <div className="flex-grow border-t border-zinc-700"></div>
                </div>

                <div className="w-full flex justify-center">
                    <div ref={googleButtonRef} className="w-full flex justify-center"></div>
                </div>
                
                <p className="text-center text-xs text-zinc-500 mt-8">
                    For demonstration: use email `robert.wilson@msl.com` and password `password123`.
                </p>
            </div>
        </div>
    );
};

export default LoginView;
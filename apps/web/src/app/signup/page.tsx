'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { FileText, Mail, Lock, User, ArrowLeft, Loader2, CheckCircle } from 'lucide-react';
import { api } from '@/lib/api';
import { useAuthStore } from '@/store/auth';

const signupSchema = z.object({
    name: z.string().min(1, 'Name is required'),
    email: z.string().email('Please enter a valid email'),
    password: z
        .string()
        .min(8, 'Password must be at least 8 characters')
        .regex(/[A-Z]/, 'Include at least one uppercase letter')
        .regex(/[a-z]/, 'Include at least one lowercase letter')
        .regex(/[0-9]/, 'Include at least one number'),
});

type SignupForm = z.infer<typeof signupSchema>;

export default function SignupPage() {
    const router = useRouter();
    const setAuth = useAuthStore((s) => s.setAuth);
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const {
        register,
        handleSubmit,
        watch,
        formState: { errors },
    } = useForm<SignupForm>({
        resolver: zodResolver(signupSchema),
    });

    const password = watch('password', '');

    const onSubmit = async (data: SignupForm) => {
        setIsLoading(true);
        setError(null);

        const response = await api.signup(data.email, data.password, data.name);

        if (response.success && response.data) {
            setAuth(response.data.user, response.data.accessToken);
            router.push('/dashboard');
        } else {
            setError(response.error?.message ?? 'Signup failed');
        }

        setIsLoading(false);
    };

    const passwordChecks = [
        { label: '8+ characters', valid: password.length >= 8 },
        { label: 'Uppercase letter', valid: /[A-Z]/.test(password) },
        { label: 'Lowercase letter', valid: /[a-z]/.test(password) },
        { label: 'Number', valid: /[0-9]/.test(password) },
    ];

    return (
        <div className="min-h-screen flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                <Link
                    href="/"
                    className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-primary-600 transition-colors mb-8"
                >
                    <ArrowLeft className="h-4 w-4" />
                    Back to home
                </Link>

                <div className="flex justify-center">
                    <div className="flex items-center gap-2">
                        <FileText className="h-10 w-10 text-primary-600" />
                        <span className="text-2xl font-bold text-slate-900 dark:text-white">ATS Resume</span>
                    </div>
                </div>

                <h2 className="mt-6 text-center text-3xl font-bold text-slate-900 dark:text-white">
                    Create your account
                </h2>
                <p className="mt-2 text-center text-sm text-slate-600 dark:text-slate-400">
                    Already have an account?{' '}
                    <Link href="/login" className="text-primary-600 hover:text-primary-500 font-medium">
                        Sign in
                    </Link>
                </p>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                <div className="bg-white dark:bg-slate-800 py-8 px-6 shadow-xl rounded-2xl border border-slate-100 dark:border-slate-700">
                    <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
                        {error && (
                            <div className="p-3 bg-danger-50 dark:bg-danger-500/10 text-danger-600 dark:text-danger-400 text-sm rounded-lg">
                                {error}
                            </div>
                        )}

                        <div>
                            <label htmlFor="name" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                Full name
                            </label>
                            <div className="relative">
                                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                                <input
                                    {...register('name')}
                                    type="text"
                                    className="block w-full pl-10 pr-4 py-3 border border-slate-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                                    placeholder="Jane Doe"
                                />
                            </div>
                            {errors.name && (
                                <p className="mt-1 text-sm text-danger-500">{errors.name.message}</p>
                            )}
                        </div>

                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                Email address
                            </label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                                <input
                                    {...register('email')}
                                    type="email"
                                    className="block w-full pl-10 pr-4 py-3 border border-slate-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                                    placeholder="you@example.com"
                                />
                            </div>
                            {errors.email && (
                                <p className="mt-1 text-sm text-danger-500">{errors.email.message}</p>
                            )}
                        </div>

                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                Password
                            </label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                                <input
                                    {...register('password')}
                                    type="password"
                                    className="block w-full pl-10 pr-4 py-3 border border-slate-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                                    placeholder="Create a strong password"
                                />
                            </div>

                            {/* Password strength indicators */}
                            <div className="mt-3 grid grid-cols-2 gap-2">
                                {passwordChecks.map((check) => (
                                    <div
                                        key={check.label}
                                        className={`flex items-center gap-1 text-xs ${check.valid ? 'text-success-600' : 'text-slate-400'
                                            }`}
                                    >
                                        <CheckCircle className={`h-3 w-3 ${check.valid ? 'opacity-100' : 'opacity-30'}`} />
                                        {check.label}
                                    </div>
                                ))}
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-primary-600 text-white rounded-lg hover:bg-primary-700 focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="h-5 w-5 animate-spin" />
                                    Creating account...
                                </>
                            ) : (
                                'Create account'
                            )}
                        </button>

                        <p className="text-xs text-slate-500 dark:text-slate-400 text-center">
                            By signing up, you agree to our Terms of Service and Privacy Policy.
                        </p>
                    </form>
                </div>
            </div>
        </div>
    );
}

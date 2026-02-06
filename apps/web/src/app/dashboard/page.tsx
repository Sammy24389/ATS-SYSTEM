'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
    FileText,
    Plus,
    Target,
    TrendingUp,
    Clock,
    LogOut,
    Menu,
    X,
} from 'lucide-react';
import { useAuthStore } from '@/store/auth';
import { api } from '@/lib/api';

interface Resume {
    id: string;
    title: string;
    status: string;
    createdAt: string;
    updatedAt: string;
}

export default function DashboardPage() {
    const router = useRouter();
    const { user, isAuthenticated, clearAuth, isLoading: authLoading } = useAuthStore();
    const [resumes, setResumes] = useState<Resume[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [sidebarOpen, setSidebarOpen] = useState(false);

    useEffect(() => {
        if (!authLoading && !isAuthenticated) {
            router.push('/login');
        }
    }, [authLoading, isAuthenticated, router]);

    useEffect(() => {
        const loadResumes = async () => {
            const response = await api.getResumes();
            if (response.success && response.data) {
                setResumes(response.data.resumes);
            }
            setIsLoading(false);
        };

        if (isAuthenticated) {
            loadResumes();
        }
    }, [isAuthenticated]);

    const handleLogout = () => {
        clearAuth();
        router.push('/');
    };

    if (authLoading || !isAuthenticated) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
            {/* Sidebar */}
            <aside
                className={`fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 transform transition-transform lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'
                    }`}
            >
                <div className="flex flex-col h-full">
                    <div className="flex items-center justify-between h-16 px-4 border-b border-slate-200 dark:border-slate-800">
                        <div className="flex items-center gap-2">
                            <FileText className="h-7 w-7 text-primary-600" />
                            <span className="text-lg font-bold text-slate-900 dark:text-white">ATS Resume</span>
                        </div>
                        <button
                            onClick={() => setSidebarOpen(false)}
                            className="lg:hidden p-2 text-slate-400 hover:text-slate-600"
                        >
                            <X className="h-5 w-5" />
                        </button>
                    </div>

                    <nav className="flex-1 px-3 py-4 space-y-1">
                        <Link
                            href="/dashboard"
                            className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-primary-600 bg-primary-50 dark:bg-primary-900/20 rounded-lg"
                        >
                            <FileText className="h-5 w-5" />
                            My Resumes
                        </Link>
                        <Link
                            href="/dashboard/analyze"
                            className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                        >
                            <Target className="h-5 w-5" />
                            Analyze Job
                        </Link>
                    </nav>

                    <div className="p-4 border-t border-slate-200 dark:border-slate-800">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 bg-primary-100 dark:bg-primary-900/50 rounded-full flex items-center justify-center text-primary-600 font-semibold">
                                {user?.name?.[0]?.toUpperCase() ?? user?.email?.[0]?.toUpperCase()}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-slate-900 dark:text-white truncate">
                                    {user?.name ?? 'User'}
                                </p>
                                <p className="text-xs text-slate-500 truncate">{user?.email}</p>
                            </div>
                        </div>
                        <button
                            onClick={handleLogout}
                            className="flex items-center gap-2 w-full px-3 py-2 text-sm text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                        >
                            <LogOut className="h-4 w-4" />
                            Sign out
                        </button>
                    </div>
                </div>
            </aside>

            {/* Main content */}
            <div className="lg:pl-64">
                {/* Header */}
                <header className="sticky top-0 z-40 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800">
                    <div className="flex items-center justify-between h-16 px-4 sm:px-6 lg:px-8">
                        <button
                            onClick={() => setSidebarOpen(true)}
                            className="lg:hidden p-2 text-slate-400 hover:text-slate-600"
                        >
                            <Menu className="h-6 w-6" />
                        </button>
                        <h1 className="text-xl font-semibold text-slate-900 dark:text-white">Dashboard</h1>
                        <Link
                            href="/dashboard/resume/new"
                            className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors text-sm font-medium"
                        >
                            <Plus className="h-4 w-4" />
                            New Resume
                        </Link>
                    </div>
                </header>

                {/* Dashboard content */}
                <main className="p-4 sm:p-6 lg:p-8">
                    {/* Stats */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                        <StatCard
                            icon={<FileText className="h-6 w-6" />}
                            label="Total Resumes"
                            value={resumes.length.toString()}
                            color="primary"
                        />
                        <StatCard
                            icon={<TrendingUp className="h-6 w-6" />}
                            label="Avg ATS Score"
                            value="--"
                            color="success"
                        />
                        <StatCard
                            icon={<Clock className="h-6 w-6" />}
                            label="Last Updated"
                            value={resumes[0] ? formatDate(resumes[0].updatedAt) : '--'}
                            color="warning"
                        />
                    </div>

                    {/* Resume list */}
                    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
                        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800">
                            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Your Resumes</h2>
                        </div>

                        {isLoading ? (
                            <div className="p-8 text-center">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto" />
                            </div>
                        ) : resumes.length === 0 ? (
                            <div className="p-12 text-center">
                                <FileText className="h-12 w-12 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
                                <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-2">
                                    No resumes yet
                                </h3>
                                <p className="text-slate-500 dark:text-slate-400 mb-6">
                                    Create your first ATS-optimized resume to get started.
                                </p>
                                <Link
                                    href="/dashboard/resume/new"
                                    className="inline-flex items-center gap-2 px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium"
                                >
                                    <Plus className="h-5 w-5" />
                                    Create Resume
                                </Link>
                            </div>
                        ) : (
                            <div className="divide-y divide-slate-200 dark:divide-slate-800">
                                {resumes.map((resume) => (
                                    <Link
                                        key={resume.id}
                                        href={`/dashboard/resume/${resume.id}`}
                                        className="flex items-center justify-between px-6 py-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 bg-primary-100 dark:bg-primary-900/50 rounded-lg flex items-center justify-center">
                                                <FileText className="h-5 w-5 text-primary-600" />
                                            </div>
                                            <div>
                                                <h3 className="font-medium text-slate-900 dark:text-white">{resume.title}</h3>
                                                <p className="text-sm text-slate-500">Updated {formatDate(resume.updatedAt)}</p>
                                            </div>
                                        </div>
                                        <span
                                            className={`px-3 py-1 rounded-full text-xs font-medium ${resume.status === 'COMPLETE'
                                                    ? 'bg-success-50 text-success-600'
                                                    : 'bg-warning-50 text-warning-600'
                                                }`}
                                        >
                                            {resume.status === 'COMPLETE' ? 'Complete' : 'Draft'}
                                        </span>
                                    </Link>
                                ))}
                            </div>
                        )}
                    </div>
                </main>
            </div>
        </div>
    );
}

function StatCard({
    icon,
    label,
    value,
    color,
}: {
    icon: React.ReactNode;
    label: string;
    value: string;
    color: 'primary' | 'success' | 'warning';
}) {
    const colorClasses = {
        primary: 'bg-primary-50 dark:bg-primary-900/20 text-primary-600',
        success: 'bg-success-50 dark:bg-success-500/10 text-success-600',
        warning: 'bg-warning-50 dark:bg-warning-500/10 text-warning-600',
    };

    return (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${colorClasses[color]}`}>
                {icon}
            </div>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">{label}</p>
            <p className="text-2xl font-bold text-slate-900 dark:text-white">{value}</p>
        </div>
    );
}

function formatDate(dateStr: string): string {
    const date = new Date(dateStr);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) return 'Today';
    if (days === 1) return 'Yesterday';
    if (days < 7) return `${days} days ago`;
    return date.toLocaleDateString();
}

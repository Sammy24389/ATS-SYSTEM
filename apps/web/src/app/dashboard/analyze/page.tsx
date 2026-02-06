'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
    Target,
    ArrowLeft,
    Loader2,
    CheckCircle,
    XCircle,
    AlertTriangle,
    FileText,
    Lightbulb,
    TrendingUp,
    Copy,
    Check,
} from 'lucide-react';
import { api } from '@/lib/api';

interface ScoreResult {
    id: string;
    overallScore: number;
    classification: string;
    matchedKeywords: string[];
    missingKeywords: string[];
    suggestions: Array<{
        priority: string;
        issue: string;
        action: string;
    }>;
}

interface Resume {
    id: string;
    title: string;
}

export default function AnalyzePage() {
    const [step, setStep] = useState<'select' | 'input' | 'results'>('select');
    const [selectedResume, setSelectedResume] = useState<Resume | null>(null);
    const [resumes, setResumes] = useState<Resume[]>([]);
    const [jobDescription, setJobDescription] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isLoadingResumes, setIsLoadingResumes] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [result, setResult] = useState<ScoreResult | null>(null);
    const [copied, setCopied] = useState<string | null>(null);

    // Load resumes on mount
    useState(() => {
        const loadResumes = async () => {
            const response = await api.getResumes();
            if (response.success && response.data) {
                setResumes(response.data.resumes);
            }
            setIsLoadingResumes(false);
        };
        loadResumes();
    });

    const handleAnalyze = async () => {
        if (!selectedResume || !jobDescription.trim()) return;

        setIsLoading(true);
        setError(null);

        const response = await api.analyzeResume(selectedResume.id, jobDescription);

        if (response.success && response.data) {
            setResult(response.data);
            setStep('results');
        } else {
            setError(response.error?.message ?? 'Analysis failed');
        }

        setIsLoading(false);
    };

    const copyKeywords = (keywords: string[]) => {
        navigator.clipboard.writeText(keywords.join(', '));
        setCopied('keywords');
        setTimeout(() => setCopied(null), 2000);
    };

    const getScoreColor = (score: number) => {
        if (score >= 90) return 'text-success-600';
        if (score >= 75) return 'text-lime-600';
        if (score >= 60) return 'text-warning-600';
        if (score >= 40) return 'text-orange-500';
        return 'text-danger-600';
    };

    const getScoreLabel = (classification: string) => {
        const labels: Record<string, { text: string; color: string }> = {
            excellent: { text: 'Excellent Match', color: 'bg-success-50 text-success-700' },
            good: { text: 'Good Match', color: 'bg-lime-50 text-lime-700' },
            fair: { text: 'Fair Match', color: 'bg-warning-50 text-warning-700' },
            poor: { text: 'Needs Work', color: 'bg-orange-50 text-orange-700' },
            critical: { text: 'Low Match', color: 'bg-danger-50 text-danger-700' },
        };
        return labels[classification] ?? labels.fair;
    };

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
            {/* Header */}
            <header className="sticky top-0 z-40 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800">
                <div className="flex items-center h-16 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
                    <Link
                        href="/dashboard"
                        className="p-2 text-slate-400 hover:text-slate-600 transition-colors"
                    >
                        <ArrowLeft className="h-5 w-5" />
                    </Link>
                    <h1 className="ml-4 text-xl font-semibold text-slate-900 dark:text-white">
                        ATS Score Analysis
                    </h1>
                </div>
            </header>

            <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Step Indicator */}
                <div className="flex items-center justify-center mb-8">
                    {['Select Resume', 'Paste Job', 'View Results'].map((label, index) => (
                        <div key={label} className="flex items-center">
                            <div
                                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${index === ['select', 'input', 'results'].indexOf(step)
                                        ? 'bg-primary-600 text-white'
                                        : index < ['select', 'input', 'results'].indexOf(step)
                                            ? 'bg-success-500 text-white'
                                            : 'bg-slate-200 dark:bg-slate-700 text-slate-500'
                                    }`}
                            >
                                {index < ['select', 'input', 'results'].indexOf(step) ? (
                                    <CheckCircle className="h-5 w-5" />
                                ) : (
                                    index + 1
                                )}
                            </div>
                            <span className="ml-2 text-sm text-slate-600 dark:text-slate-400 hidden sm:block">
                                {label}
                            </span>
                            {index < 2 && (
                                <div className="w-12 sm:w-20 h-0.5 bg-slate-200 dark:bg-slate-700 mx-3" />
                            )}
                        </div>
                    ))}
                </div>

                {error && (
                    <div className="mb-6 p-4 bg-danger-50 dark:bg-danger-500/10 text-danger-600 rounded-lg flex items-center gap-2">
                        <XCircle className="h-5 w-5 flex-shrink-0" />
                        {error}
                    </div>
                )}

                {/* Step 1: Select Resume */}
                {step === 'select' && (
                    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
                        <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
                            Select a Resume to Analyze
                        </h2>

                        {isLoadingResumes ? (
                            <div className="py-12 text-center">
                                <Loader2 className="h-8 w-8 animate-spin text-primary-600 mx-auto" />
                            </div>
                        ) : resumes.length === 0 ? (
                            <div className="py-12 text-center">
                                <FileText className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                                <p className="text-slate-500 mb-4">No resumes found</p>
                                <Link
                                    href="/dashboard/resume/new"
                                    className="text-primary-600 hover:text-primary-700 font-medium"
                                >
                                    Create your first resume →
                                </Link>
                            </div>
                        ) : (
                            <div className="space-y-2">
                                {resumes.map((resume) => (
                                    <button
                                        key={resume.id}
                                        onClick={() => {
                                            setSelectedResume(resume);
                                            setStep('input');
                                        }}
                                        className={`w-full flex items-center gap-4 p-4 rounded-lg border transition-all ${selectedResume?.id === resume.id
                                                ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                                                : 'border-slate-200 dark:border-slate-700 hover:border-primary-300'
                                            }`}
                                    >
                                        <FileText className="h-5 w-5 text-primary-600" />
                                        <span className="font-medium text-slate-900 dark:text-white">
                                            {resume.title}
                                        </span>
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* Step 2: Paste Job Description */}
                {step === 'input' && (
                    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                                Paste Job Description
                            </h2>
                            <span className="text-sm text-slate-500">
                                Analyzing: <strong>{selectedResume?.title}</strong>
                            </span>
                        </div>

                        <textarea
                            value={jobDescription}
                            onChange={(e) => setJobDescription(e.target.value)}
                            rows={12}
                            className="w-full px-4 py-3 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
                            placeholder="Paste the full job description here...

Include:
- Job title
- Required skills
- Preferred qualifications
- Responsibilities"
                        />

                        <div className="flex justify-between mt-6">
                            <button
                                onClick={() => setStep('select')}
                                className="px-4 py-2 text-slate-600 hover:text-slate-900 transition-colors"
                            >
                                ← Back
                            </button>
                            <button
                                onClick={handleAnalyze}
                                disabled={!jobDescription.trim() || isLoading}
                                className="flex items-center gap-2 px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 font-medium"
                            >
                                {isLoading ? (
                                    <>
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                        Analyzing...
                                    </>
                                ) : (
                                    <>
                                        <Target className="h-4 w-4" />
                                        Analyze Match
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                )}

                {/* Step 3: Results */}
                {step === 'results' && result && (
                    <div className="space-y-6">
                        {/* Score Card */}
                        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-8 text-center">
                            <div className={`text-6xl font-bold mb-2 ${getScoreColor(result.overallScore)}`}>
                                {result.overallScore}
                            </div>
                            <div className="text-slate-500 mb-4">ATS Compatibility Score</div>
                            <span
                                className={`inline-block px-4 py-1 rounded-full text-sm font-medium ${getScoreLabel(result.classification).color
                                    }`}
                            >
                                {getScoreLabel(result.classification).text}
                            </span>
                        </div>

                        {/* Keywords */}
                        <div className="grid md:grid-cols-2 gap-6">
                            {/* Matched Keywords */}
                            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center gap-2">
                                        <CheckCircle className="h-5 w-5 text-success-600" />
                                        <h3 className="font-semibold text-slate-900 dark:text-white">
                                            Matched Keywords
                                        </h3>
                                    </div>
                                    <span className="text-sm text-success-600 font-medium">
                                        {result.matchedKeywords.length} found
                                    </span>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {result.matchedKeywords.slice(0, 15).map((kw, i) => (
                                        <span
                                            key={i}
                                            className="px-2 py-1 bg-success-50 dark:bg-success-500/10 text-success-700 dark:text-success-400 rounded text-sm"
                                        >
                                            {kw}
                                        </span>
                                    ))}
                                </div>
                            </div>

                            {/* Missing Keywords */}
                            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center gap-2">
                                        <AlertTriangle className="h-5 w-5 text-warning-600" />
                                        <h3 className="font-semibold text-slate-900 dark:text-white">
                                            Missing Keywords
                                        </h3>
                                    </div>
                                    <button
                                        onClick={() => copyKeywords(result.missingKeywords)}
                                        className="flex items-center gap-1 text-sm text-slate-500 hover:text-primary-600"
                                    >
                                        {copied === 'keywords' ? (
                                            <Check className="h-4 w-4" />
                                        ) : (
                                            <Copy className="h-4 w-4" />
                                        )}
                                        Copy
                                    </button>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {result.missingKeywords.slice(0, 15).map((kw, i) => (
                                        <span
                                            key={i}
                                            className="px-2 py-1 bg-warning-50 dark:bg-warning-500/10 text-warning-700 dark:text-warning-400 rounded text-sm"
                                        >
                                            {kw}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Suggestions */}
                        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
                            <div className="flex items-center gap-2 mb-4">
                                <Lightbulb className="h-5 w-5 text-primary-600" />
                                <h3 className="font-semibold text-slate-900 dark:text-white">
                                    Improvement Suggestions
                                </h3>
                            </div>
                            <div className="space-y-3">
                                {result.suggestions.map((suggestion, i) => (
                                    <div
                                        key={i}
                                        className="flex items-start gap-3 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg"
                                    >
                                        <TrendingUp className="h-5 w-5 text-primary-600 mt-0.5" />
                                        <div>
                                            <p className="text-sm font-medium text-slate-900 dark:text-white">
                                                {suggestion.issue}
                                            </p>
                                            <p className="text-sm text-slate-600 dark:text-slate-400">
                                                {suggestion.action}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex justify-between">
                            <button
                                onClick={() => {
                                    setStep('input');
                                    setResult(null);
                                }}
                                className="px-4 py-2 text-slate-600 hover:text-slate-900 transition-colors"
                            >
                                ← Analyze Another Job
                            </button>
                            <Link
                                href={`/dashboard/resume/${selectedResume?.id}`}
                                className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 font-medium"
                            >
                                Edit Resume
                            </Link>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}

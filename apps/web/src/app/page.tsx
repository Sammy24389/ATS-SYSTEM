import Link from 'next/link';
import { FileText, Target, Zap, CheckCircle, ArrowRight } from 'lucide-react';

export default function HomePage() {
    return (
        <div className="flex flex-col min-h-screen">
            {/* Navigation */}
            <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <div className="flex items-center gap-2">
                            <FileText className="h-8 w-8 text-primary-600" />
                            <span className="text-xl font-bold bg-gradient-to-r from-primary-600 to-primary-400 bg-clip-text text-transparent">
                                ATS Resume
                            </span>
                        </div>
                        <div className="flex items-center gap-4">
                            <Link
                                href="/login"
                                className="text-slate-600 dark:text-slate-300 hover:text-primary-600 transition-colors"
                            >
                                Sign In
                            </Link>
                            <Link
                                href="/signup"
                                className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium"
                            >
                                Get Started
                            </Link>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="pt-32 pb-20 px-4">
                <div className="max-w-7xl mx-auto text-center">
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary-50 dark:bg-primary-950 text-primary-700 dark:text-primary-300 rounded-full text-sm font-medium mb-8">
                        <Zap className="h-4 w-4" />
                        AI-Powered Resume Optimization
                    </div>

                    <h1 className="text-5xl md:text-6xl font-bold text-slate-900 dark:text-white mb-6 leading-tight">
                        Get Past the ATS.
                        <br />
                        <span className="bg-gradient-to-r from-primary-600 to-primary-400 bg-clip-text text-transparent">
                            Land More Interviews.
                        </span>
                    </h1>

                    <p className="text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto mb-10">
                        Build resumes that applicant tracking systems love. Analyze job descriptions,
                        match keywords, and get actionable feedback to boost your score.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link
                            href="/signup"
                            className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition-all font-semibold text-lg shadow-lg shadow-primary-600/25 hover:shadow-xl hover:shadow-primary-600/30"
                        >
                            Start Building Free
                            <ArrowRight className="h-5 w-5" />
                        </Link>
                        <Link
                            href="#features"
                            className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 transition-all font-semibold text-lg border border-slate-200 dark:border-slate-700"
                        >
                            See How It Works
                        </Link>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section id="features" className="py-20 px-4 bg-white dark:bg-slate-900/50">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-4">
                            Everything You Need to Beat the ATS
                        </h2>
                        <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
                            Our intelligent platform analyzes your resume against job requirements and provides actionable improvements.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        <FeatureCard
                            icon={<Target className="h-8 w-8" />}
                            title="Keyword Matching"
                            description="Automatically extract keywords from job descriptions and see which ones you're missing from your resume."
                        />
                        <FeatureCard
                            icon={<Zap className="h-8 w-8" />}
                            title="Real-Time Scoring"
                            description="Get an instant ATS compatibility score with detailed breakdowns and improvement suggestions."
                        />
                        <FeatureCard
                            icon={<CheckCircle className="h-8 w-8" />}
                            title="AI-Powered Rewrites"
                            description="Enhance your bullet points with AI suggestions that preserve your experience while boosting impact."
                        />
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-20 px-4">
                <div className="max-w-4xl mx-auto text-center bg-gradient-to-br from-primary-600 to-primary-700 rounded-3xl p-12 shadow-2xl">
                    <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                        Ready to Land Your Dream Job?
                    </h2>
                    <p className="text-lg text-primary-100 mb-8 max-w-xl mx-auto">
                        Join thousands of job seekers who have improved their resume scores and landed more interviews.
                    </p>
                    <Link
                        href="/signup"
                        className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white text-primary-700 rounded-xl hover:bg-slate-50 transition-all font-semibold text-lg"
                    >
                        Get Started for Free
                        <ArrowRight className="h-5 w-5" />
                    </Link>
                </div>
            </section>

            {/* Footer */}
            <footer className="py-8 px-4 border-t border-slate-200 dark:border-slate-800">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
                    <div className="flex items-center gap-2">
                        <FileText className="h-6 w-6 text-primary-600" />
                        <span className="font-semibold text-slate-700 dark:text-slate-300">ATS Resume</span>
                    </div>
                    <p className="text-slate-500 dark:text-slate-400 text-sm">
                        © {new Date().getFullYear()} ATS Resume Platform. All rights reserved.
                    </p>
                </div>
            </footer>
        </div>
    );
}

function FeatureCard({
    icon,
    title,
    description,
}: {
    icon: React.ReactNode;
    title: string;
    description: string;
}) {
    return (
        <div className="p-8 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-700 hover:border-primary-200 dark:hover:border-primary-800 transition-all group">
            <div className="w-14 h-14 bg-primary-100 dark:bg-primary-900/50 rounded-xl flex items-center justify-center text-primary-600 dark:text-primary-400 mb-6 group-hover:scale-110 transition-transform">
                {icon}
            </div>
            <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-3">{title}</h3>
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed">{description}</p>
        </div>
    );
}

import type { Metadata } from 'next';
import { Inter, Fira_Code } from 'next/font/google';
import './globals.css';

const inter = Inter({
    subsets: ['latin'],
    variable: '--font-inter',
    display: 'swap',
});

const firaCode = Fira_Code({
    subsets: ['latin'],
    variable: '--font-fira-code',
    display: 'swap',
});

export const metadata: Metadata = {
    title: 'ATS Resume Builder - Optimize Your Resume',
    description: 'Build ATS-friendly resumes that get past applicant tracking systems. Analyze job descriptions and maximize your interview chances.',
    keywords: ['resume builder', 'ATS', 'job search', 'career', 'resume optimization'],
    authors: [{ name: 'ATS Resume Platform' }],
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en" className={`${inter.variable} ${firaCode.variable}`}>
            <body className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
                <div className="relative flex min-h-screen flex-col">
                    <main className="flex-1">{children}</main>
                </div>
            </body>
        </html>
    );
}

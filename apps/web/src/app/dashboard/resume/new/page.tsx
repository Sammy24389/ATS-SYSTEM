'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
    FileText,
    ArrowLeft,
    Plus,
    Trash2,
    Save,
    Loader2,
    User,
    Mail,
    Phone,
    MapPin,
    Linkedin,
    Globe,
    Briefcase,
    GraduationCap,
    Code,
    Award,
} from 'lucide-react';
import Link from 'next/link';
import { api } from '@/lib/api';

// ====================
// Schema
// ====================

const resumeSchema = z.object({
    title: z.string().min(1, 'Resume title is required'),
    content: z.object({
        contactInfo: z.object({
            fullName: z.string().min(1, 'Name is required'),
            email: z.string().email('Valid email required'),
            phone: z.string().optional(),
            location: z.string().optional(),
            linkedin: z.string().optional(),
            website: z.string().optional(),
        }),
        summary: z.string().optional(),
        experience: z.array(z.object({
            company: z.string().min(1),
            title: z.string().min(1),
            location: z.string().optional(),
            startDate: z.string(),
            endDate: z.string().optional(),
            current: z.boolean().optional(),
            bullets: z.array(z.string()),
        })).optional(),
        education: z.array(z.object({
            institution: z.string().min(1),
            degree: z.string().min(1),
            field: z.string().optional(),
            graduationDate: z.string().optional(),
        })).optional(),
        skills: z.array(z.string()).optional(),
        certifications: z.array(z.object({
            name: z.string(),
            issuer: z.string().optional(),
            date: z.string().optional(),
        })).optional(),
    }),
});

type ResumeFormData = z.infer<typeof resumeSchema>;

const defaultValues: ResumeFormData = {
    title: '',
    content: {
        contactInfo: {
            fullName: '',
            email: '',
            phone: '',
            location: '',
            linkedin: '',
            website: '',
        },
        summary: '',
        experience: [],
        education: [],
        skills: [],
        certifications: [],
    },
};

export default function NewResumePage() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [activeSection, setActiveSection] = useState<string>('contact');
    const [skillInput, setSkillInput] = useState('');

    const {
        register,
        handleSubmit,
        control,
        watch,
        setValue,
        formState: { errors },
    } = useForm<ResumeFormData>({
        resolver: zodResolver(resumeSchema),
        defaultValues,
    });

    const {
        fields: experienceFields,
        append: addExperience,
        remove: removeExperience,
    } = useFieldArray({ control, name: 'content.experience' });

    const {
        fields: educationFields,
        append: addEducation,
        remove: removeEducation,
    } = useFieldArray({ control, name: 'content.education' });

    const skills = watch('content.skills') ?? [];

    const addSkill = () => {
        if (skillInput.trim() && !skills.includes(skillInput.trim())) {
            setValue('content.skills', [...skills, skillInput.trim()]);
            setSkillInput('');
        }
    };

    const removeSkill = (index: number) => {
        setValue('content.skills', skills.filter((_, i) => i !== index));
    };

    const onSubmit = async (data: ResumeFormData) => {
        setIsLoading(true);
        setError(null);

        const response = await api.createResume(data);

        if (response.success && response.data) {
            router.push(`/dashboard/resume/${response.data.id}`);
        } else {
            setError(response.error?.message ?? 'Failed to create resume');
        }

        setIsLoading(false);
    };

    const sections = [
        { id: 'contact', label: 'Contact', icon: User },
        { id: 'summary', label: 'Summary', icon: FileText },
        { id: 'experience', label: 'Experience', icon: Briefcase },
        { id: 'education', label: 'Education', icon: GraduationCap },
        { id: 'skills', label: 'Skills', icon: Code },
        { id: 'certifications', label: 'Certifications', icon: Award },
    ];

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
            {/* Header */}
            <header className="sticky top-0 z-40 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800">
                <div className="flex items-center justify-between h-16 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
                    <div className="flex items-center gap-4">
                        <Link
                            href="/dashboard"
                            className="p-2 text-slate-400 hover:text-slate-600 transition-colors"
                        >
                            <ArrowLeft className="h-5 w-5" />
                        </Link>
                        <input
                            {...register('title')}
                            placeholder="Untitled Resume"
                            className="text-xl font-semibold bg-transparent border-none focus:outline-none text-slate-900 dark:text-white placeholder-slate-400"
                        />
                    </div>
                    <button
                        onClick={handleSubmit(onSubmit)}
                        disabled={isLoading}
                        className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors text-sm font-medium disabled:opacity-50"
                    >
                        {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                        Save Resume
                    </button>
                </div>
            </header>

            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {error && (
                    <div className="mb-6 p-4 bg-danger-50 dark:bg-danger-500/10 text-danger-600 rounded-lg">
                        {error}
                    </div>
                )}

                <div className="flex gap-8">
                    {/* Section Navigation */}
                    <nav className="hidden md:block w-48 flex-shrink-0">
                        <div className="sticky top-24 space-y-1">
                            {sections.map((section) => (
                                <button
                                    key={section.id}
                                    onClick={() => setActiveSection(section.id)}
                                    className={`w-full flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg transition-colors ${activeSection === section.id
                                            ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-600'
                                            : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                                        }`}
                                >
                                    <section.icon className="h-4 w-4" />
                                    {section.label}
                                </button>
                            ))}
                        </div>
                    </nav>

                    {/* Form Sections */}
                    <div className="flex-1 space-y-8">
                        {/* Contact Section */}
                        <FormSection
                            title="Contact Information"
                            description="Your professional contact details"
                            isActive={activeSection === 'contact'}
                        >
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <InputField
                                    icon={<User className="h-4 w-4" />}
                                    label="Full Name"
                                    {...register('content.contactInfo.fullName')}
                                    error={errors.content?.contactInfo?.fullName?.message}
                                    required
                                />
                                <InputField
                                    icon={<Mail className="h-4 w-4" />}
                                    label="Email"
                                    type="email"
                                    {...register('content.contactInfo.email')}
                                    error={errors.content?.contactInfo?.email?.message}
                                    required
                                />
                                <InputField
                                    icon={<Phone className="h-4 w-4" />}
                                    label="Phone"
                                    {...register('content.contactInfo.phone')}
                                />
                                <InputField
                                    icon={<MapPin className="h-4 w-4" />}
                                    label="Location"
                                    placeholder="City, State"
                                    {...register('content.contactInfo.location')}
                                />
                                <InputField
                                    icon={<Linkedin className="h-4 w-4" />}
                                    label="LinkedIn"
                                    placeholder="linkedin.com/in/yourprofile"
                                    {...register('content.contactInfo.linkedin')}
                                />
                                <InputField
                                    icon={<Globe className="h-4 w-4" />}
                                    label="Website"
                                    placeholder="yourwebsite.com"
                                    {...register('content.contactInfo.website')}
                                />
                            </div>
                        </FormSection>

                        {/* Summary Section */}
                        <FormSection
                            title="Professional Summary"
                            description="A brief overview of your experience and goals"
                            isActive={activeSection === 'summary'}
                        >
                            <textarea
                                {...register('content.summary')}
                                rows={4}
                                className="w-full px-4 py-3 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
                                placeholder="Experienced professional with 5+ years in..."
                            />
                        </FormSection>

                        {/* Experience Section */}
                        <FormSection
                            title="Work Experience"
                            description="Your professional work history"
                            isActive={activeSection === 'experience'}
                        >
                            <div className="space-y-6">
                                {experienceFields.map((field, index) => (
                                    <div
                                        key={field.id}
                                        className="p-4 border border-slate-200 dark:border-slate-700 rounded-lg space-y-4"
                                    >
                                        <div className="flex justify-between items-start">
                                            <h4 className="font-medium text-slate-900 dark:text-white">Position {index + 1}</h4>
                                            <button
                                                type="button"
                                                onClick={() => removeExperience(index)}
                                                className="p-1 text-danger-500 hover:bg-danger-50 rounded"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </button>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <input
                                                {...register(`content.experience.${index}.title`)}
                                                placeholder="Job Title"
                                                className="input-field"
                                            />
                                            <input
                                                {...register(`content.experience.${index}.company`)}
                                                placeholder="Company Name"
                                                className="input-field"
                                            />
                                            <input
                                                {...register(`content.experience.${index}.startDate`)}
                                                placeholder="Start Date (e.g., Jan 2020)"
                                                className="input-field"
                                            />
                                            <input
                                                {...register(`content.experience.${index}.endDate`)}
                                                placeholder="End Date or Present"
                                                className="input-field"
                                            />
                                        </div>
                                        <textarea
                                            {...register(`content.experience.${index}.bullets.0`)}
                                            placeholder="Describe your responsibilities and achievements..."
                                            rows={3}
                                            className="w-full input-field"
                                        />
                                    </div>
                                ))}
                                <button
                                    type="button"
                                    onClick={() => addExperience({ company: '', title: '', startDate: '', bullets: [''] })}
                                    className="flex items-center gap-2 px-4 py-2 border border-dashed border-slate-300 dark:border-slate-600 rounded-lg text-slate-600 dark:text-slate-400 hover:border-primary-500 hover:text-primary-600 transition-colors"
                                >
                                    <Plus className="h-4 w-4" />
                                    Add Experience
                                </button>
                            </div>
                        </FormSection>

                        {/* Education Section */}
                        <FormSection
                            title="Education"
                            description="Your academic background"
                            isActive={activeSection === 'education'}
                        >
                            <div className="space-y-6">
                                {educationFields.map((field, index) => (
                                    <div
                                        key={field.id}
                                        className="p-4 border border-slate-200 dark:border-slate-700 rounded-lg space-y-4"
                                    >
                                        <div className="flex justify-between items-start">
                                            <h4 className="font-medium text-slate-900 dark:text-white">Education {index + 1}</h4>
                                            <button
                                                type="button"
                                                onClick={() => removeEducation(index)}
                                                className="p-1 text-danger-500 hover:bg-danger-50 rounded"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </button>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <input
                                                {...register(`content.education.${index}.institution`)}
                                                placeholder="Institution Name"
                                                className="input-field"
                                            />
                                            <input
                                                {...register(`content.education.${index}.degree`)}
                                                placeholder="Degree (e.g., Bachelor of Science)"
                                                className="input-field"
                                            />
                                            <input
                                                {...register(`content.education.${index}.field`)}
                                                placeholder="Field of Study"
                                                className="input-field"
                                            />
                                            <input
                                                {...register(`content.education.${index}.graduationDate`)}
                                                placeholder="Graduation Date"
                                                className="input-field"
                                            />
                                        </div>
                                    </div>
                                ))}
                                <button
                                    type="button"
                                    onClick={() => addEducation({ institution: '', degree: '' })}
                                    className="flex items-center gap-2 px-4 py-2 border border-dashed border-slate-300 dark:border-slate-600 rounded-lg text-slate-600 dark:text-slate-400 hover:border-primary-500 hover:text-primary-600 transition-colors"
                                >
                                    <Plus className="h-4 w-4" />
                                    Add Education
                                </button>
                            </div>
                        </FormSection>

                        {/* Skills Section */}
                        <FormSection
                            title="Skills"
                            description="Technical and soft skills relevant to your career"
                            isActive={activeSection === 'skills'}
                        >
                            <div className="space-y-4">
                                <div className="flex gap-2">
                                    <input
                                        value={skillInput}
                                        onChange={(e) => setSkillInput(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
                                        placeholder="Type a skill and press Enter"
                                        className="flex-1 input-field"
                                    />
                                    <button
                                        type="button"
                                        onClick={addSkill}
                                        className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
                                    >
                                        Add
                                    </button>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {skills.map((skill, index) => (
                                        <span
                                            key={index}
                                            className="inline-flex items-center gap-1 px-3 py-1 bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 rounded-full text-sm"
                                        >
                                            {skill}
                                            <button
                                                type="button"
                                                onClick={() => removeSkill(index)}
                                                className="hover:text-primary-900"
                                            >
                                                ×
                                            </button>
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </FormSection>
                    </div>
                </div>
            </div>

            <style jsx global>{`
        .input-field {
          @apply px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent;
        }
      `}</style>
        </div>
    );
}

function FormSection({
    title,
    description,
    isActive,
    children,
}: {
    title: string;
    description: string;
    isActive: boolean;
    children: React.ReactNode;
}) {
    return (
        <section className={`bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 ${isActive ? 'ring-2 ring-primary-500' : ''}`}>
            <div className="mb-6">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white">{title}</h3>
                <p className="text-sm text-slate-500">{description}</p>
            </div>
            {children}
        </section>
    );
}

function InputField({
    icon,
    label,
    error,
    required,
    ...props
}: {
    icon?: React.ReactNode;
    label: string;
    error?: string;
    required?: boolean;
} & React.InputHTMLAttributes<HTMLInputElement>) {
    return (
        <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                {label} {required && <span className="text-danger-500">*</span>}
            </label>
            <div className="relative">
                {icon && (
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">{icon}</span>
                )}
                <input
                    {...props}
                    className={`w-full ${icon ? 'pl-10' : 'pl-4'} pr-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent`}
                />
            </div>
            {error && <p className="mt-1 text-sm text-danger-500">{error}</p>}
        </div>
    );
}

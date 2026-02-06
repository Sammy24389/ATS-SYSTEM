// ATS-Friendly Resume Templates
// Version: 1.0.0

export interface TemplateMetadata {
    id: string;
    name: string;
    description: string;
    atsScore: number; // Base ATS compatibility score
    features: string[];
}

export interface TemplateStyle {
    fontFamily: string;
    fontSize: {
        name: number;
        heading: number;
        body: number;
    };
    margins: {
        top: number;
        right: number;
        bottom: number;
        left: number;
    };
    lineHeight: number;
    sectionSpacing: number;
}

export interface Template {
    metadata: TemplateMetadata;
    style: TemplateStyle;
}

// ====================
// Template Definitions
// ====================

const TEMPLATES: Map<string, Template> = new Map([
    [
        'classic',
        {
            metadata: {
                id: 'classic',
                name: 'Classic Professional',
                description: 'Traditional single-column layout optimized for ATS parsing',
                atsScore: 95,
                features: [
                    'Single column layout',
                    'Standard section headers',
                    'ATS-safe fonts',
                    'Clean formatting',
                ],
            },
            style: {
                fontFamily: 'Arial, sans-serif',
                fontSize: {
                    name: 24,
                    heading: 14,
                    body: 11,
                },
                margins: {
                    top: 50,
                    right: 50,
                    bottom: 50,
                    left: 50,
                },
                lineHeight: 1.4,
                sectionSpacing: 16,
            },
        },
    ],
    [
        'modern',
        {
            metadata: {
                id: 'modern',
                name: 'Modern Clean',
                description: 'Contemporary design with improved readability',
                atsScore: 92,
                features: [
                    'Single column layout',
                    'Subtle section dividers',
                    'Calibri font',
                    'Optimal whitespace',
                ],
            },
            style: {
                fontFamily: 'Calibri, sans-serif',
                fontSize: {
                    name: 22,
                    heading: 13,
                    body: 11,
                },
                margins: {
                    top: 40,
                    right: 45,
                    bottom: 40,
                    left: 45,
                },
                lineHeight: 1.5,
                sectionSpacing: 14,
            },
        },
    ],
    [
        'minimal',
        {
            metadata: {
                id: 'minimal',
                name: 'Minimal Executive',
                description: 'Streamlined layout for senior professionals',
                atsScore: 98,
                features: [
                    'Maximum ATS compatibility',
                    'No decorative elements',
                    'Times New Roman',
                    'Dense information layout',
                ],
            },
            style: {
                fontFamily: 'Times New Roman, serif',
                fontSize: {
                    name: 20,
                    heading: 12,
                    body: 11,
                },
                margins: {
                    top: 45,
                    right: 50,
                    bottom: 45,
                    left: 50,
                },
                lineHeight: 1.3,
                sectionSpacing: 12,
            },
        },
    ],
]);

// ====================
// Template Service
// ====================

export function getAllTemplates(): TemplateMetadata[] {
    return Array.from(TEMPLATES.values()).map((t) => t.metadata);
}

export function getTemplateById(id: string): Template | null {
    return TEMPLATES.get(id) ?? null;
}

export function getDefaultTemplate(): Template {
    return TEMPLATES.get('classic')!;
}

export function getTemplateStyle(templateId: string): TemplateStyle {
    const template = TEMPLATES.get(templateId);
    return template?.style ?? getDefaultTemplate().style;
}

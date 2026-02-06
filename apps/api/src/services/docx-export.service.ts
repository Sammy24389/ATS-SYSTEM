// DOCX Export Service
// Generates ATS-friendly DOCX resumes using docx library

import {
    Document,
    Paragraph,
    TextRun,
    HeadingLevel,
    AlignmentType,
    BorderStyle,
    Packer,
    SectionType,
} from 'docx';
import type { ResumeContent } from './resume.service.js';

// ====================
// DOCX Generation
// ====================

export async function generateDOCX(content: ResumeContent): Promise<Buffer> {
    const { contactInfo, summary, experience, education, skills, certifications } = content;

    const children: Paragraph[] = [];

    // Header - Name
    children.push(
        new Paragraph({
            children: [
                new TextRun({
                    text: contactInfo.fullName,
                    bold: true,
                    size: 48, // 24pt
                    font: 'Calibri',
                }),
            ],
            alignment: AlignmentType.CENTER,
            spacing: { after: 100 },
        })
    );

    // Contact info line
    const contactParts = [
        contactInfo.email,
        contactInfo.phone,
        contactInfo.location,
        contactInfo.linkedin,
    ].filter(Boolean);

    children.push(
        new Paragraph({
            children: [
                new TextRun({
                    text: contactParts.join(' | '),
                    size: 20, // 10pt
                    font: 'Calibri',
                }),
            ],
            alignment: AlignmentType.CENTER,
            spacing: { after: 200 },
            border: {
                bottom: { style: BorderStyle.SINGLE, size: 6, color: '333333' },
            },
        })
    );

    // Summary
    if (summary) {
        children.push(createSectionHeader('PROFESSIONAL SUMMARY'));
        children.push(
            new Paragraph({
                children: [new TextRun({ text: summary, size: 22, font: 'Calibri' })],
                spacing: { after: 200 },
            })
        );
    }

    // Experience
    if (experience && experience.length > 0) {
        children.push(createSectionHeader('PROFESSIONAL EXPERIENCE'));

        for (const exp of experience) {
            // Job title and company
            children.push(
                new Paragraph({
                    children: [
                        new TextRun({ text: exp.title, bold: true, size: 22, font: 'Calibri' }),
                        new TextRun({ text: ' - ', size: 22, font: 'Calibri' }),
                        new TextRun({ text: exp.company, italics: true, size: 22, font: 'Calibri' }),
                    ],
                    spacing: { before: 100 },
                })
            );

            // Date range
            children.push(
                new Paragraph({
                    children: [
                        new TextRun({
                            text: `${exp.startDate} - ${exp.current ? 'Present' : exp.endDate ?? ''}`,
                            size: 20,
                            color: '666666',
                            font: 'Calibri',
                        }),
                    ],
                    spacing: { after: 80 },
                })
            );

            // Bullets
            if (exp.bullets && exp.bullets.length > 0) {
                for (const bullet of exp.bullets) {
                    if (bullet.trim()) {
                        children.push(
                            new Paragraph({
                                children: [new TextRun({ text: bullet, size: 22, font: 'Calibri' })],
                                bullet: { level: 0 },
                                spacing: { after: 40 },
                            })
                        );
                    }
                }
            }
        }
    }

    // Education
    if (education && education.length > 0) {
        children.push(createSectionHeader('EDUCATION'));

        for (const edu of education) {
            children.push(
                new Paragraph({
                    children: [
                        new TextRun({ text: edu.degree, bold: true, size: 22, font: 'Calibri' }),
                        edu.field ? new TextRun({ text: ` in ${edu.field}`, size: 22, font: 'Calibri' }) : new TextRun(''),
                    ],
                    spacing: { before: 100 },
                })
            );

            children.push(
                new Paragraph({
                    children: [
                        new TextRun({ text: edu.institution, italics: true, size: 22, font: 'Calibri' }),
                        edu.graduationDate ? new TextRun({ text: ` - ${edu.graduationDate}`, size: 20, color: '666666', font: 'Calibri' }) : new TextRun(''),
                    ],
                    spacing: { after: 100 },
                })
            );
        }
    }

    // Skills
    if (skills && skills.length > 0) {
        children.push(createSectionHeader('SKILLS'));
        children.push(
            new Paragraph({
                children: [
                    new TextRun({
                        text: skills.join(' • '),
                        size: 22,
                        font: 'Calibri',
                    }),
                ],
                spacing: { after: 200 },
            })
        );
    }

    // Certifications
    if (certifications && certifications.length > 0) {
        children.push(createSectionHeader('CERTIFICATIONS'));

        for (const cert of certifications) {
            children.push(
                new Paragraph({
                    children: [
                        new TextRun({ text: cert.name, bold: true, size: 22, font: 'Calibri' }),
                        cert.issuer ? new TextRun({ text: ` - ${cert.issuer}`, size: 22, font: 'Calibri' }) : new TextRun(''),
                        cert.date ? new TextRun({ text: ` (${cert.date})`, size: 20, color: '666666', font: 'Calibri' }) : new TextRun(''),
                    ],
                    spacing: { after: 60 },
                })
            );
        }
    }

    // Create document
    const doc = new Document({
        sections: [
            {
                properties: {
                    type: SectionType.CONTINUOUS,
                },
                children,
            },
        ],
        styles: {
            default: {
                document: {
                    run: {
                        font: 'Calibri',
                    },
                },
            },
        },
    });

    // Generate buffer
    const buffer = await Packer.toBuffer(doc);
    return Buffer.from(buffer);
}

function createSectionHeader(title: string): Paragraph {
    return new Paragraph({
        children: [
            new TextRun({
                text: title,
                bold: true,
                size: 24, // 12pt
                font: 'Calibri',
                allCaps: true,
            }),
        ],
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 240, after: 80 },
        border: {
            bottom: { style: BorderStyle.SINGLE, size: 4, color: '666666' },
        },
    });
}

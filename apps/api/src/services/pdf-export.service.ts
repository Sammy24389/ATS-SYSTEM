// PDF Export Service
// Generates ATS-friendly PDF resumes using Puppeteer

import puppeteer from 'puppeteer';
import type { ResumeContent } from './resume.service.js';

// ====================
// HTML Templates
// ====================

function generateResumeHTML(content: ResumeContent, templateName: string = 'classic'): string {
    const templates: Record<string, (c: ResumeContent) => string> = {
        classic: generateClassicTemplate,
        modern: generateModernTemplate,
        minimal: generateMinimalTemplate,
    };

    const generator = templates[templateName] ?? templates.classic;
    return generator(content);
}

function generateClassicTemplate(content: ResumeContent): string {
    const { contactInfo, summary, experience, education, skills, certifications } = content;

    return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${contactInfo.fullName} - Resume</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    
    body {
      font-family: 'Georgia', 'Times New Roman', serif;
      font-size: 11pt;
      line-height: 1.5;
      color: #333;
      max-width: 8.5in;
      margin: 0 auto;
      padding: 0.75in;
    }
    
    /* Header */
    .header {
      text-align: center;
      border-bottom: 2px solid #333;
      padding-bottom: 12px;
      margin-bottom: 16px;
    }
    
    .name {
      font-size: 24pt;
      font-weight: bold;
      text-transform: uppercase;
      letter-spacing: 2px;
      margin-bottom: 8px;
    }
    
    .contact-line {
      font-size: 10pt;
      color: #555;
    }
    
    .contact-line span:not(:last-child)::after {
      content: ' | ';
      color: #999;
    }
    
    /* Sections */
    .section {
      margin-bottom: 16px;
    }
    
    .section-title {
      font-size: 12pt;
      font-weight: bold;
      text-transform: uppercase;
      letter-spacing: 1px;
      border-bottom: 1px solid #666;
      padding-bottom: 4px;
      margin-bottom: 10px;
    }
    
    /* Experience */
    .experience-item {
      margin-bottom: 12px;
    }
    
    .job-header {
      display: flex;
      justify-content: space-between;
      margin-bottom: 4px;
    }
    
    .job-title {
      font-weight: bold;
    }
    
    .company {
      font-style: italic;
    }
    
    .date {
      color: #666;
      font-size: 10pt;
    }
    
    .bullets {
      list-style-type: disc;
      margin-left: 20px;
    }
    
    .bullets li {
      margin-bottom: 3px;
    }
    
    /* Education */
    .education-item {
      margin-bottom: 8px;
    }
    
    .degree {
      font-weight: bold;
    }
    
    .institution {
      font-style: italic;
    }
    
    /* Skills */
    .skills-list {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
    }
    
    .skill {
      background: #f5f5f5;
      padding: 2px 8px;
      border-radius: 3px;
      font-size: 10pt;
    }
    
    @media print {
      body { padding: 0.5in; }
      @page { margin: 0.5in; }
    }
  </style>
</head>
<body>
  <!-- Header -->
  <header class="header">
    <h1 class="name">${escapeHTML(contactInfo.fullName)}</h1>
    <div class="contact-line">
      ${contactInfo.email ? `<span>${escapeHTML(contactInfo.email)}</span>` : ''}
      ${contactInfo.phone ? `<span>${escapeHTML(contactInfo.phone)}</span>` : ''}
      ${contactInfo.location ? `<span>${escapeHTML(contactInfo.location)}</span>` : ''}
      ${contactInfo.linkedin ? `<span>${escapeHTML(contactInfo.linkedin)}</span>` : ''}
    </div>
  </header>

  ${summary ? `
  <!-- Summary -->
  <section class="section">
    <h2 class="section-title">Professional Summary</h2>
    <p>${escapeHTML(summary)}</p>
  </section>
  ` : ''}

  ${experience && experience.length > 0 ? `
  <!-- Experience -->
  <section class="section">
    <h2 class="section-title">Professional Experience</h2>
    ${experience.map(exp => `
    <div class="experience-item">
      <div class="job-header">
        <div>
          <span class="job-title">${escapeHTML(exp.title)}</span> - 
          <span class="company">${escapeHTML(exp.company)}</span>
        </div>
        <span class="date">${escapeHTML(exp.startDate)} - ${exp.current ? 'Present' : escapeHTML(exp.endDate ?? '')}</span>
      </div>
      ${exp.bullets && exp.bullets.length > 0 ? `
      <ul class="bullets">
        ${exp.bullets.map(b => `<li>${escapeHTML(b)}</li>`).join('')}
      </ul>
      ` : ''}
    </div>
    `).join('')}
  </section>
  ` : ''}

  ${education && education.length > 0 ? `
  <!-- Education -->
  <section class="section">
    <h2 class="section-title">Education</h2>
    ${education.map(edu => `
    <div class="education-item">
      <span class="degree">${escapeHTML(edu.degree)}</span>
      ${edu.field ? ` in ${escapeHTML(edu.field)}` : ''}<br>
      <span class="institution">${escapeHTML(edu.institution)}</span>
      ${edu.graduationDate ? ` - ${escapeHTML(edu.graduationDate)}` : ''}
    </div>
    `).join('')}
  </section>
  ` : ''}

  ${skills && skills.length > 0 ? `
  <!-- Skills -->
  <section class="section">
    <h2 class="section-title">Skills</h2>
    <div class="skills-list">
      ${skills.map(s => `<span class="skill">${escapeHTML(s)}</span>`).join('')}
    </div>
  </section>
  ` : ''}

  ${certifications && certifications.length > 0 ? `
  <!-- Certifications -->
  <section class="section">
    <h2 class="section-title">Certifications</h2>
    <ul class="bullets">
      ${certifications.map(c => `<li>${escapeHTML(c.name)}${c.issuer ? ` - ${escapeHTML(c.issuer)}` : ''}${c.date ? ` (${escapeHTML(c.date)})` : ''}</li>`).join('')}
    </ul>
  </section>
  ` : ''}
</body>
</html>
  `;
}

function generateModernTemplate(content: ResumeContent): string {
    // Simplified modern template with left sidebar
    return generateClassicTemplate(content); // Fallback for now
}

function generateMinimalTemplate(content: ResumeContent): string {
    // Clean minimal template
    return generateClassicTemplate(content); // Fallback for now
}

function escapeHTML(str: string): string {
    return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

// ====================
// PDF Generation
// ====================

let browserInstance: Awaited<ReturnType<typeof puppeteer.launch>> | null = null;

async function getBrowser() {
    if (!browserInstance) {
        browserInstance = await puppeteer.launch({
            headless: true,
            args: ['--no-sandbox', '--disable-setuid-sandbox'],
        });
    }
    return browserInstance;
}

export async function generatePDF(
    content: ResumeContent,
    options: {
        template?: string;
        format?: 'A4' | 'Letter';
    } = {}
): Promise<Buffer> {
    const html = generateResumeHTML(content, options.template);

    const browser = await getBrowser();
    const page = await browser.newPage();

    try {
        await page.setContent(html, { waitUntil: 'networkidle0' });

        const pdfBuffer = await page.pdf({
            format: options.format ?? 'Letter',
            printBackground: true,
            margin: {
                top: '0.5in',
                right: '0.5in',
                bottom: '0.5in',
                left: '0.5in',
            },
        });

        return Buffer.from(pdfBuffer);
    } finally {
        await page.close();
    }
}

export async function closeBrowser(): Promise<void> {
    if (browserInstance) {
        await browserInstance.close();
        browserInstance = null;
    }
}

// Export HTML for preview
export function generatePreviewHTML(content: ResumeContent, template?: string): string {
    return generateResumeHTML(content, template);
}

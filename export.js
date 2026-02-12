/**
 * Export functionality for resumes
 */

class ExportManager {
    constructor() {
        this.exportFormats = {
            pdf: { name: 'PDF', icon: 'fas fa-file-pdf', color: '#ef4444' },
            docx: { name: 'Word', icon: 'fas fa-file-word', color: '#2563eb' },
            txt: { name: 'Text', icon: 'fas fa-file-alt', color: '#6b7280' },
            json: { name: 'JSON', icon: 'fas fa-code', color: '#10b981' },
            html: { name: 'HTML', icon: 'fas fa-file-code', color: '#f59e0b' }
        };
        
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.setupExportButtons();
    }

    setupEventListeners() {
        // Export button in builder
        const exportBtn = document.getElementById('exportBtn');
        if (exportBtn) {
            exportBtn.addEventListener('click', () => this.showExportModal());
        }

        // Quick export buttons
        document.querySelectorAll('.quick-export').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const format = e.target.dataset.format;
                this.quickExport(format);
            });
        });
    }

    setupExportButtons() {
        const exportSection = document.querySelector('.export-options');
        if (!exportSection) return;

        exportSection.innerHTML = Object.entries(this.exportFormats)
            .map(([format, info]) => `
                <button class="export-format" data-format="${format}">
                    <i class="${info.icon}" style="color: ${info.color}"></i>
                    <span>${info.name}</span>
                    <small>Download as ${info.name}</small>
                </button>
            `).join('');

        // Add event listeners to format buttons
        document.querySelectorAll('.export-format').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const format = e.currentTarget.dataset.format;
                this.handleExport(format);
            });
        });
    }

    showExportModal() {
        const modal = document.createElement('div');
        modal.className = 'export-modal';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h2>Export Resume</h2>
                    <button class="close-modal">&times;</button>
                </div>
                <div class="modal-body">
                    <div class="export-options-grid">
                        ${Object.entries(this.exportFormats)
                            .map(([format, info]) => `
                                <div class="export-option" data-format="${format}">
                                    <div class="export-icon" style="background: ${info.color}20; border-color: ${info.color}">
                                        <i class="${info.icon}" style="color: ${info.color}"></i>
                                    </div>
                                    <h3>${info.name}</h3>
                                    <p>Export resume as ${info.name} file</p>
                                    <button class="btn-export" data-format="${format}">
                                        Export
                                    </button>
                                </div>
                            `).join('')}
                    </div>
                    
                    <div class="export-settings">
                        <h3>Export Settings</h3>
                        <div class="settings-grid">
                            <div class="setting">
                                <label>
                                    <input type="checkbox" id="includeContact" checked>
                                    Include Contact Information
                                </label>
                            </div>
                            <div class="setting">
                                <label>
                                    <input type="checkbox" id="includePhoto" checked>
                                    Include Profile Photo
                                </label>
                            </div>
                            <div class="setting">
                                <label>
                                    <input type="checkbox" id="includeLinks" checked>
                                    Include Social Links
                                </label>
                            </div>
                            <div class="setting">
                                <label>
                                    <input type="checkbox" id="optimizeForATS" checked>
                                    Optimize for ATS
                                </label>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        // Add event listeners
        const closeBtn = modal.querySelector('.close-modal');
        const exportBtns = modal.querySelectorAll('.btn-export');

        closeBtn.addEventListener('click', () => modal.remove());
        exportBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const format = e.target.dataset.format;
                modal.remove();
                this.handleExport(format);
            });
        });

        // Close on ESC and outside click
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') modal.remove();
        });

        modal.addEventListener('click', (e) => {
            if (e.target === modal) modal.remove();
        });
    }

    async handleExport(format) {
        try {
            this.showLoading(`Preparing ${format.toUpperCase()} export...`);
            
            const resumeData = this.getResumeData();
            const settings = this.getExportSettings();
            
            let result;
            
            switch(format) {
                case 'pdf':
                    result = await this.exportPDF(resumeData, settings);
                    break;
                case 'docx':
                    result = await this.exportDOCX(resumeData, settings);
                    break;
                case 'txt':
                    result = this.exportTXT(resumeData, settings);
                    break;
                case 'json':
                    result = this.exportJSON(resumeData, settings);
                    break;
                case 'html':
                    result = this.exportHTML(resumeData, settings);
                    break;
                default:
                    throw new Error('Unsupported format');
            }
            
            this.downloadFile(result, format);
            this.showSuccess(`Resume exported as ${format.toUpperCase()} successfully!`);
            
        } catch (error) {
            console.error('Export error:', error);
            this.showError(`Failed to export: ${error.message}`);
        } finally {
            this.hideLoading();
        }
    }

    getResumeData() {
        // Get resume data from builder or localStorage
        if (window.resumeData) {
            return window.resumeData;
        }
        
        const savedResume = localStorage.getItem('currentResume');
        if (savedResume) {
            return JSON.parse(savedResume);
        }
        
        // Fallback to form data
        return this.collectFormData();
    }

    collectFormData() {
        const data = {
            personal: {},
            experience: [],
            education: [],
            skills: [],
            projects: [],
            meta: {
                template: localStorage.getItem('selectedTemplate') || 'professional',
                exportedAt: new Date().toISOString()
            }
        };
        
        // Collect personal info
        document.querySelectorAll('[data-field]').forEach(input => {
            const field = input.dataset.field;
            const value = input.value || input.textContent;
            if (value) data.personal[field] = value;
        });
        
        return data;
    }

    getExportSettings() {
        return {
            includeContact: document.getElementById('includeContact')?.checked ?? true,
            includePhoto: document.getElementById('includePhoto')?.checked ?? true,
            includeLinks: document.getElementById('includeLinks')?.checked ?? true,
            optimizeForATS: document.getElementById('optimizeForATS')?.checked ?? true
        };
    }

    async exportPDF(resumeData, settings) {
        try {
            // Try server-side PDF generation first
            const response = await fetch('/api/export/pdf', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ resumeData, settings })
            });
            
            if (response.ok) {
                const blob = await response.blob();
                return { blob, filename: `resume_${Date.now()}.pdf` };
            }
            
            // Fallback to client-side PDF
            throw new Error('Server PDF generation failed');
            
        } catch (error) {
            console.log('Falling back to client-side PDF generation');
            return this.generateClientPDF(resumeData, settings);
        }
    }

    generateClientPDF(resumeData, settings) {
        // Using jsPDF or similar library
        // This is a simplified version - you'd need to implement actual PDF generation
        return new Promise((resolve) => {
            // Mock implementation - replace with actual PDF library
            const pdfContent = this.formatResumeForExport(resumeData, settings);
            const blob = new Blob([pdfContent], { type: 'application/pdf' });
            resolve({ blob, filename: `resume_${Date.now()}.pdf` });
        });
    }

    async exportDOCX(resumeData, settings) {
        const response = await fetch('/api/export/docx', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ resumeData, settings })
        });
        
        if (!response.ok) throw new Error('DOCX export failed');
        
        const blob = await response.blob();
        return { blob, filename: `resume_${Date.now()}.docx` };
    }

    exportTXT(resumeData, settings) {
        const content = this.formatResumeForExport(resumeData, settings);
        const blob = new Blob([content], { type: 'text/plain' });
        return { blob, filename: `resume_${Date.now()}.txt` };
    }

    exportJSON(resumeData, settings) {
        const content = JSON.stringify(resumeData, null, 2);
        const blob = new Blob([content], { type: 'application/json' });
        return { blob, filename: `resume_${Date.now()}.json` };
    }

    exportHTML(resumeData, settings) {
        const html = this.generateHTML(resumeData, settings);
        const blob = new Blob([html], { type: 'text/html' });
        return { blob, filename: `resume_${Date.now()}.html` };
    }

    formatResumeForExport(resumeData, settings) {
        let content = '';
        
        // Personal info
        if (settings.includeContact && resumeData.personal) {
            content += `${resumeData.personal.name || ''}\n`;
            content += `${resumeData.personal.title || ''}\n\n`;
            
            if (resumeData.personal.email) content += `Email: ${resumeData.personal.email}\n`;
            if (resumeData.personal.phone) content += `Phone: ${resumeData.personal.phone}\n`;
            if (resumeData.personal.location) content += `Location: ${resumeData.personal.location}\n`;
            
            if (settings.includeLinks) {
                if (resumeData.personal.linkedin) content += `LinkedIn: ${resumeData.personal.linkedin}\n`;
                if (resumeData.personal.github) content += `GitHub: ${resumeData.personal.github}\n`;
                if (resumeData.personal.portfolio) content += `Portfolio: ${resumeData.personal.portfolio}\n`;
            }
            
            content += '\n';
        }
        
        // Experience
        if (resumeData.experience?.length > 0) {
            content += 'EXPERIENCE\n';
            content += '='.repeat(50) + '\n';
            resumeData.experience.forEach(exp => {
                content += `${exp.title || ''} at ${exp.company || ''}\n`;
                content += `${exp.startDate || ''} - ${exp.endDate || 'Present'}\n`;
                content += `${exp.description || ''}\n\n`;
            });
        }
        
        // Education
        if (resumeData.education?.length > 0) {
            content += 'EDUCATION\n';
            content += '='.repeat(50) + '\n';
            resumeData.education.forEach(edu => {
                content += `${edu.degree || ''} in ${edu.field || ''}\n`;
                content += `${edu.school || ''}, ${edu.location || ''}\n`;
                content += `${edu.startDate || ''} - ${edu.endDate || 'Present'}\n`;
                if (edu.gpa) content += `GPA: ${edu.gpa}\n`;
                content += '\n';
            });
        }
        
        return content;
    }

    generateHTML(resumeData, settings) {
        return `
            <!DOCTYPE html>
            <html>
            <head>
                <title>${resumeData.personal?.name || 'Resume'}</title>
                <style>
                    body { font-family: Arial, sans-serif; margin: 40px; }
                    .resume { max-width: 800px; margin: 0 auto; }
                    .header { text-align: center; margin-bottom: 30px; }
                    .section { margin-bottom: 20px; }
                    .section h2 { border-bottom: 2px solid #333; padding-bottom: 5px; }
                </style>
            </head>
            <body>
                <div class="resume">
                    ${this.generateHTMLContent(resumeData, settings)}
                </div>
            </body>
            </html>
        `;
    }

    generateHTMLContent(resumeData, settings) {
        let html = '';
        
        // Personal info
        if (settings.includeContact && resumeData.personal) {
            html += `
                <div class="header">
                    <h1>${resumeData.personal.name || ''}</h1>
                    <p>${resumeData.personal.title || ''}</p>
                    <p>
                        ${resumeData.personal.email ? `${resumeData.personal.email} • ` : ''}
                        ${resumeData.personal.phone ? `${resumeData.personal.phone} • ` : ''}
                        ${resumeData.personal.location || ''}
                    </p>
                </div>
            `;
        }
        
        // Add other sections...
        
        return html;
    }

    downloadFile(result, format) {
        const url = URL.createObjectURL(result.blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = result.filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    quickExport(format) {
        const resumeData = this.getResumeData();
        const settings = this.getExportSettings();
        
        this.handleExport(format);
    }

    showLoading(message) {
        // Show loading overlay
        const loader = document.createElement('div');
        loader.className = 'export-loader';
        loader.innerHTML = `
            <div class="loader-content">
                <div class="spinner"></div>
                <p>${message}</p>
            </div>
        `;
        loader.id = 'exportLoader';
        document.body.appendChild(loader);
    }

    hideLoading() {
        const loader = document.getElementById('exportLoader');
        if (loader) loader.remove();
    }

    showSuccess(message) {
        this.showToast(message, 'success');
    }

    showError(message) {
        this.showToast(message, 'error');
    }

    showToast(message, type = 'info') {
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.innerHTML = `
            <i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-circle'}"></i>
            <span>${message}</span>
        `;
        
        document.body.appendChild(toast);
        
        setTimeout(() => {
            toast.classList.add('show');
        }, 10);
        
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }
}

// Initialize export manager
document.addEventListener('DOMContentLoaded', () => {
    if (document.querySelector('.builder-container') || document.querySelector('.export-options')) {
        window.exportManager = new ExportManager();
    }
});
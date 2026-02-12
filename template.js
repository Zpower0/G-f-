/**
 * Templates Gallery Functionality
 */

class TemplatesManager {
    constructor() {
        this.templates = [];
        this.filteredTemplates = [];
        this.currentFilter = 'all';
        this.init();
    }

    async init() {
        await this.loadTemplates();
        this.renderTemplates();
        this.setupEventListeners();
        this.setupSearch();
    }

    async loadTemplates() {
        try {
            const response = await fetch('/templates/templates.json');
            if (!response.ok) throw new Error('Failed to load templates');
            
            this.templates = await response.json();
            this.filteredTemplates = [...this.templates];
            
            console.log(`Loaded ${this.templates.length} templates`);
        } catch (error) {
            console.error('Error loading templates:', error);
            this.templates = this.getFallbackTemplates();
            this.filteredTemplates = [...this.templates];
        }
    }

    getFallbackTemplates() {
        return [
            {
                id: 'professional',
                name: 'Professional',
                category: 'professional',
                preview: '/assets/images/templates/professional.webp',
                description: 'Clean and professional design for corporate jobs',
                color: '#3b82f6',
                sections: ['personal', 'experience', 'education', 'skills', 'summary'],
                popular: true
            },
            {
                id: 'modern',
                name: 'Modern',
                category: 'creative',
                preview: '/assets/images/templates/modern.webp',
                description: 'Modern design with creative layout',
                color: '#8b5cf6',
                sections: ['personal', 'experience', 'projects', 'skills', 'certifications'],
                popular: true
            },
            {
                id: 'minimal',
                name: 'Minimal',
                category: 'minimal',
                preview: '/assets/images/templates/minimal.webp',
                description: 'Simple and clean minimalist design',
                color: '#10b981',
                sections: ['personal', 'experience', 'education', 'skills'],
                popular: false
            },
            {
                id: 'creative',
                name: 'Creative',
                category: 'creative',
                preview: '/assets/images/templates/creative.webp',
                description: 'Creative design for designers and artists',
                color: '#ef4444',
                sections: ['personal', 'projects', 'skills', 'education', 'languages'],
                popular: true
            },
            {
                id: 'ats',
                name: 'ATS Friendly',
                category: 'professional',
                preview: '/assets/images/templates/ats.webp',
                description: 'Optimized for Applicant Tracking Systems',
                color: '#f59e0b',
                sections: ['personal', 'experience', 'education', 'skills', 'certifications'],
                popular: false
            }
        ];
    }

    renderTemplates() {
        const container = document.getElementById('templatesGrid');
        if (!container) return;

        container.innerHTML = '';

        if (this.filteredTemplates.length === 0) {
            container.innerHTML = `
                <div class="no-templates">
                    <i class="fas fa-search"></i>
                    <h3>No templates found</h3>
                    <p>Try a different search or filter</p>
                </div>
            `;
            return;
        }

        this.filteredTemplates.forEach(template => {
            const templateCard = this.createTemplateCard(template);
            container.appendChild(templateCard);
        });
    }

    createTemplateCard(template) {
        const card = document.createElement('div');
        card.className = 'template-card';
        card.dataset.templateId = template.id;
        card.dataset.category = template.category;

        card.innerHTML = `
            <div class="template-preview">
                <div class="template-image" style="background: ${template.color}">
                    ${template.popular ? '<span class="popular-badge">Popular</span>' : ''}
                    <div class="template-placeholder">
                        <div class="placeholder-header"></div>
                        <div class="placeholder-content">
                            <div class="placeholder-line short"></div>
                            <div class="placeholder-line"></div>
                            <div class="placeholder-line short"></div>
                            <div class="placeholder-line"></div>
                        </div>
                    </div>
                </div>
                <div class="template-overlay">
                    <button class="btn-preview" data-template="${template.id}">
                        <i class="fas fa-eye"></i> Preview
                    </button>
                    <button class="btn-use" data-template="${template.id}">
                        <i class="fas fa-check"></i> Use Template
                    </button>
                </div>
            </div>
            <div class="template-info">
                <h3>${template.name}</h3>
                <p>${template.description}</p>
                <div class="template-meta">
                    <span class="category">${template.category}</span>
                    <span class="sections">
                        <i class="fas fa-layer-group"></i>
                        ${template.sections.length} sections
                    </span>
                </div>
            </div>
        `;

        // Add event listeners
        const useBtn = card.querySelector('.btn-use');
        const previewBtn = card.querySelector('.btn-preview');

        useBtn.addEventListener('click', () => this.useTemplate(template.id));
        previewBtn.addEventListener('click', () => this.previewTemplate(template));

        return card;
    }

    useTemplate(templateId) {
        // Save selected template to localStorage
        localStorage.setItem('selectedTemplate', templateId);
        
        // Redirect to builder page
        window.location.href = '/builder.html';
    }

    previewTemplate(template) {
        // Create modal preview
        const modal = document.createElement('div');
        modal.className = 'template-preview-modal';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h2>${template.name} - Preview</h2>
                    <button class="close-modal">&times;</button>
                </div>
                <div class="modal-body">
                    <div class="preview-container" style="border-color: ${template.color}">
                        <div class="preview-template">
                            <!-- Template preview rendering would go here -->
                            <div class="preview-header" style="background: ${template.color}">
                                <h3>${template.name} Template</h3>
                            </div>
                            <div class="preview-sections">
                                ${template.sections.map(section => `
                                    <div class="preview-section">
                                        <h4>${section.charAt(0).toUpperCase() + section.slice(1)}</h4>
                                        <div class="preview-content"></div>
                                    </div>
                                `).join('')}
                            </div>
                        </div>
                    </div>
                    <div class="modal-actions">
                        <button class="btn-secondary close-modal">Close</button>
                        <button class="btn-primary use-template" data-template="${template.id}">
                            Use This Template
                        </button>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        // Add event listeners
        const closeBtns = modal.querySelectorAll('.close-modal');
        const useBtn = modal.querySelector('.use-template');

        closeBtns.forEach(btn => {
            btn.addEventListener('click', () => modal.remove());
        });

        useBtn.addEventListener('click', () => {
            this.useTemplate(template.id);
            modal.remove();
        });

        // Close on ESC
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') modal.remove();
        });
    }

    filterTemplates(category) {
        this.currentFilter = category;
        
        if (category === 'all') {
            this.filteredTemplates = [...this.templates];
        } else {
            this.filteredTemplates = this.templates.filter(
                template => template.category === category
            );
        }
        
        this.renderTemplates();
        
        // Update active filter button
        document.querySelectorAll('.filter-btn').forEach(btn => {
            if (btn.dataset.filter === category) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });
    }

    searchTemplates(query) {
        if (!query.trim()) {
            this.filteredTemplates = [...this.templates];
        } else {
            const searchTerm = query.toLowerCase();
            this.filteredTemplates = this.templates.filter(template =>
                template.name.toLowerCase().includes(searchTerm) ||
                template.description.toLowerCase().includes(searchTerm) ||
                template.category.toLowerCase().includes(searchTerm)
            );
        }
        
        this.renderTemplates();
    }

    setupEventListeners() {
        // Filter buttons
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                this.filterTemplates(btn.dataset.filter);
            });
        });

        // Template category navigation
        document.querySelectorAll('.template-category').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const category = link.dataset.category;
                this.filterTemplates(category);
                
                // Scroll to templates section
                document.getElementById('templatesSection')?.scrollIntoView({
                    behavior: 'smooth'
                });
            });
        });
    }

    setupSearch() {
        const searchInput = document.getElementById('templateSearch');
        if (!searchInput) return;

        let searchTimeout;
        searchInput.addEventListener('input', (e) => {
            clearTimeout(searchTimeout);
            searchTimeout = setTimeout(() => {
                this.searchTemplates(e.target.value);
            }, 300);
        });
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    if (document.querySelector('.templates-page')) {
        window.templatesManager = new TemplatesManager();
    }
});

// Template loading for builder page
if (document.querySelector('.builder-container')) {
    document.addEventListener('DOMContentLoaded', async () => {
        const savedTemplate = localStorage.getItem('selectedTemplate') || 'professional';
        await loadTemplateData(savedTemplate);
    });
}

async function loadTemplateData(templateId) {
    try {
        const response = await fetch(`/templates/${templateId}.json`);
        if (response.ok) {
            const template = await response.json();
            applyTemplate(template);
        }
    } catch (error) {
        console.log('Using default template structure');
    }
}

function applyTemplate(template) {
    // Apply template styles and structure to builder
    const styleElement = document.getElementById('template-styles');
    if (styleElement && template.styles) {
        styleElement.textContent = template.styles;
    }
    
    // Update preview with template
    if (window.resumePreview) {
        window.resumePreview.updateTemplate(template);
    }
}
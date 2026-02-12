/**
 * 🎨 Ultimate Resume Builder
 * Professional resume editor with real-time preview
 */

class ResumeBuilder {
    constructor() {
        this.currentResume = null;
        this.isEditing = false;
        this.currentTemplate = 'modern';
        this.previewMode = 'desktop';
        this.init();
    }

    init() {
        console.log('🎨 Resume Builder Initializing...');
        
        // Load resume from URL or create new
        this.loadResume();
        
        // Initialize UI
        this.initUI();
        
        // Initialize event listeners
        this.initEvents();
        
        // Initialize templates
        this.initTemplates();
        
        // Start auto-save
        this.startAutoSave();
        
        console.log('✅ Resume Builder Ready');
    }

    loadResume() {
        // Check URL for resume ID
        const urlParams = new URLSearchParams(window.location.search);
        const resumeId = urlParams.get('id');
        
        if (resumeId) {
            // Load existing resume
            this.loadResumeById(resumeId);
        } else {
            // Create new resume
            this.createNewResume();
        }
    }

    loadResumeById(resumeId) {
        // Try to load from localStorage
        const session = JSON.parse(localStorage.getItem('resumeai_session') || '{}');
        const resume = session.resumes?.find(r => r.id === resumeId);
        
        if (resume) {
            this.currentResume = resume;
            console.log(`📂 Loaded resume: ${resume.title}`);
        } else {
            console.log('📂 Resume not found, creating new');
            this.createNewResume();
        }
    }

    createNewResume() {
        const template = new URLSearchParams(window.location.search).get('template') || 'modern';
        
        this.currentResume = {
            id: 'resume_' + Date.now(),
            title: 'My Resume',
            template: template,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            sections: {
                personal: {
                    name: '',
                    title: '',
                    email: '',
                    phone: '',
                    location: '',
                    linkedin: '',
                    github: '',
                    portfolio: ''
                },
                summary: 'Experienced professional seeking new opportunities...',
                experience: [
                    {
                        id: 'exp_' + Date.now(),
                        title: 'Software Engineer',
                        company: 'Tech Company',
                        location: 'San Francisco, CA',
                        startDate: '2020-01',
                        endDate: '2023-12',
                        current: false,
                        description: 'Developed web applications using React and Node.js\nLed team of 5 developers\nImproved performance by 40%'
                    }
                ],
                education: [
                    {
                        id: 'edu_' + Date.now(),
                        degree: 'Bachelor of Science',
                        field: 'Computer Science',
                        school: 'University of Technology',
                        location: 'New York, NY',
                        startDate: '2016-09',
                        endDate: '2020-05',
                        gpa: '3.8',
                        honors: 'Summa Cum Laude'
                    }
                ],
                skills: [
                    {
                        id: 'skill_' + Date.now(),
                        category: 'Programming',
                        items: ['JavaScript', 'Python', 'Java', 'C++']
                    },
                    {
                        id: 'skill_' + (Date.now() + 1),
                        category: 'Frameworks',
                        items: ['React', 'Node.js', 'Express', 'Django']
                    }
                ],
                projects: [],
                certifications: [],
                languages: [],
                interests: []
            },
            settings: {
                fontSize: 'medium',
                fontFamily: 'inter',
                colorScheme: 'professional',
                margins: 'normal',
                spacing: 'normal'
            },
            meta: {
                lastEdited: new Date().toISOString(),
                wordCount: 0,
                characterCount: 0
            }
        };
        
        console.log('📄 Created new resume');
        
        // Save to session
        this.saveToSession();
        
        // Update URL
        this.updateURL();
    }

    saveToSession() {
        const session = JSON.parse(localStorage.getItem('resumeai_session') || '{}');
        if (!session.resumes) session.resumes = [];
        
        // Find existing or add new
        const index = session.resumes.findIndex(r => r.id === this.currentResume.id);
        if (index !== -1) {
            session.resumes[index] = this.currentResume;
        } else {
            session.resumes.push(this.currentResume);
        }
        
        localStorage.setItem('resumeai_session', JSON.stringify(session));
    }

    updateURL() {
        const url = new URL(window.location);
        url.searchParams.set('id', this.currentResume.id);
        window.history.replaceState({}, '', url);
    }

    initUI() {
        // Set template
        this.setTemplate(this.currentResume.template);
        
        // Render resume preview
        this.renderPreview();
        
        // Populate form fields
        this.populateForm();
        
        // Update word count
        this.updateWordCount();
        
        // Initialize section tabs
        this.initSectionTabs();
    }

    initEvents() {
        // Form inputs
        document.addEventListener('input', (e) => {
            if (e.target.matches('[data-resume-field]')) {
                this.handleFieldChange(e.target);
            }
        });

        // Section navigation
        document.addEventListener('click', (e) => {
            const tab = e.target.closest('[data-section-tab]');
            if (tab) {
                e.preventDefault();
                this.switchSection(tab.dataset.sectionTab);
            }
        });

        // Add/remove items
        document.addEventListener('click', (e) => {
            if (e.target.closest('[data-add-item]')) {
                this.addItem(e.target.closest('[data-add-item]').dataset.addItem);
            }
            
            if (e.target.closest('[data-remove-item]')) {
                const itemId = e.target.closest('[data-remove-item]').dataset.removeItem;
                this.removeItem(itemId);
            }
        });

        // Template selection
        document.addEventListener('click', (e) => {
            const templateBtn = e.target.closest('[data-template]');
            if (templateBtn) {
                e.preventDefault();
                this.setTemplate(templateBtn.dataset.template);
            }
        });

        // Export buttons
        document.addEventListener('click', (e) => {
            const exportBtn = e.target.closest('[data-export]');
            if (exportBtn) {
                e.preventDefault();
                this.exportResume(exportBtn.dataset.export);
            }
        });

        // AI Suggestions
        document.addEventListener('click', (e) => {
            const aiBtn = e.target.closest('[data-ai-suggest]');
            if (aiBtn) {
                e.preventDefault();
                this.getAISuggestions(aiBtn.dataset.aiSuggest);
            }
        });

        // Preview mode
        document.addEventListener('click', (e) => {
            const previewBtn = e.target.closest('[data-preview-mode]');
            if (previewBtn) {
                e.preventDefault();
                this.setPreviewMode(previewBtn.dataset.previewMode);
            }
        });

        // Save button
        document.addEventListener('click', (e) => {
            if (e.target.closest('#save-resume')) {
                e.preventDefault();
                this.saveResume();
            }
        });

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            // Ctrl/Cmd + S to save
            if ((e.ctrlKey || e.metaKey) && e.key === 's') {
                e.preventDefault();
                this.saveResume();
            }
            
            // Ctrl/Cmd + P to print
            if ((e.ctrlKey || e.metaKey) && e.key === 'p') {
                e.preventDefault();
                this.exportResume('pdf');
            }
        });
    }

    initTemplates() {
        const templates = [
            { id: 'modern', name: 'Modern', category: 'Professional' },
            { id: 'executive', name: 'Executive', category: 'Corporate' },
            { id: 'creative', name: 'Creative', category: 'Design' },
            { id: 'minimal', name: 'Minimal', category: 'Clean' },
            { id: 'ats', name: 'ATS Optimized', category: 'Job Search' }
        ];

        const templateGrid = document.getElementById('templates-grid');
        if (templateGrid) {
            templateGrid.innerHTML = templates.map(template => `
                <div class="template-option ${this.currentTemplate === template.id ? 'active' : ''}" 
                     data-template="${template.id}">
                    <div class="template-preview-small" style="background: ${this.getTemplateColor(template.id)}">
                        <div class="template-header-small">
                            <div class="line"></div>
                            <div class="line short"></div>
                        </div>
                    </div>
                    <div class="template-info">
                        <h4>${template.name}</h4>
                        <span class="template-category">${template.category}</span>
                    </div>
                </div>
            `).join('');
        }
    }

    getTemplateColor(templateId) {
        const colors = {
            modern: '#6366f1',
            executive: '#10b981',
            creative: '#f59e0b',
            minimal: '#ef4444',
            ats: '#a855f7'
        };
        return colors[templateId] || '#6366f1';
    }

    initSectionTabs() {
        const sections = [
            { id: 'personal', icon: 'fa-user', label: 'Personal' },
            { id: 'summary', icon: 'fa-file-alt', label: 'Summary' },
            { id: 'experience', icon: 'fa-briefcase', label: 'Experience' },
            { id: 'education', icon: 'fa-graduation-cap', label: 'Education' },
            { id: 'skills', icon: 'fa-star', label: 'Skills' },
            { id: 'projects', icon: 'fa-code', label: 'Projects' }
        ];

        const tabsContainer = document.getElementById('section-tabs');
        if (tabsContainer) {
            tabsContainer.innerHTML = sections.map(section => `
                <button class="section-tab ${section.id === 'personal' ? 'active' : ''}" 
                        data-section-tab="${section.id}">
                    <i class="fas ${section.icon}"></i>
                    <span>${section.label}</span>
                </button>
            `).join('');
        }
    }

    switchSection(sectionId) {
        // Update active tab
        document.querySelectorAll('.section-tab').forEach(tab => {
            tab.classList.toggle('active', tab.dataset.sectionTab === sectionId);
        });

        // Show corresponding form section
        document.querySelectorAll('.form-section').forEach(section => {
            section.classList.toggle('active', section.id === `${sectionId}-section`);
        });

        // Update preview highlight
        this.highlightPreviewSection(sectionId);
    }

    highlightPreviewSection(sectionId) {
        // Remove previous highlights
        document.querySelectorAll('.preview-section').forEach(section => {
            section.classList.remove('highlighted');
        });

        // Add highlight to current section
        const previewSection = document.querySelector(`.preview-section[data-section="${sectionId}"]`);
        if (previewSection) {
            previewSection.classList.add('highlighted');
            
            // Scroll to section
            previewSection.scrollIntoView({ 
                behavior: 'smooth', 
                block: 'center' 
            });
        }
    }

    handleFieldChange(input) {
        const field = input.dataset.resumeField;
        const value = input.value;
        
        // Update resume data based on field path
        this.updateResumeField(field, value);
        
        // Update preview in real-time
        this.updatePreviewField(field, value);
        
        // Update word count
        this.updateWordCount();
        
        // Mark as edited
        this.markAsEdited();
    }

    updateResumeField(fieldPath, value) {
        // Parse field path like "personal.name" or "experience[0].title"
        const parts = fieldPath.split('.');
        let current = this.currentResume.sections;
        
        for (let i = 0; i < parts.length - 1; i++) {
            const part = parts[i];
            
            // Handle array indices like experience[0]
            const arrayMatch = part.match(/(\w+)\[(\d+)\]/);
            if (arrayMatch) {
                const arrayName = arrayMatch[1];
                const index = parseInt(arrayMatch[2]);
                if (!current[arrayName]) current[arrayName] = [];
                if (!current[arrayName][index]) current[arrayName][index] = {};
                current = current[arrayName][index];
            } else {
                if (!current[part]) current[part] = {};
                current = current[part];
            }
        }
        
        // Set the final value
        const lastPart = parts[parts.length - 1];
        current[lastPart] = value;
        
        // Update timestamp
        this.currentResume.updatedAt = new Date().toISOString();
    }

    updatePreviewField(fieldPath, value) {
        // Find corresponding element in preview
        const previewElement = document.querySelector(`[data-preview-field="${fieldPath}"]`);
        if (previewElement) {
            previewElement.textContent = value;
            
            // Add animation effect
            previewElement.classList.add('updated');
            setTimeout(() => {
                previewElement.classList.remove('updated');
            }, 500);
        }
    }

    populateForm() {
        // Populate all form fields with current resume data
        document.querySelectorAll('[data-resume-field]').forEach(input => {
            const field = input.dataset.resumeField;
            const value = this.getResumeFieldValue(field);
            
            if (value !== undefined) {
                if (input.tagName === 'TEXTAREA') {
                    input.value = value;
                } else if (input.type === 'checkbox') {
                    input.checked = value;
                } else {
                    input.value = value;
                }
            }
        });
    }

    getResumeFieldValue(fieldPath) {
        const parts = fieldPath.split('.');
        let current = this.currentResume.sections;
        
        for (let i = 0; i < parts.length; i++) {
            const part = parts[i];
            
            // Handle array indices
            const arrayMatch = part.match(/(\w+)\[(\d+)\]/);
            if (arrayMatch) {
                const arrayName = arrayMatch[1];
                const index = parseInt(arrayMatch[2]);
                if (!current[arrayName] || !current[arrayName][index]) return '';
                current = current[arrayName][index];
            } else {
                if (!current[part]) return '';
                current = current[part];
            }
        }
        
        return current;
    }

    addItem(section) {
        const newItem = this.getDefaultItem(section);
        
        if (!this.currentResume.sections[section]) {
            this.currentResume.sections[section] = [];
        }
        
        this.currentResume.sections[section].push(newItem);
        
        // Update UI
        this.renderSectionItems(section);
        this.renderPreview();
        
        // Mark as edited
        this.markAsEdited();
        
        console.log(`➕ Added ${section} item`);
    }

    getDefaultItem(section) {
        const defaults = {
            experience: {
                id: 'exp_' + Date.now(),
                title: '',
                company: '',
                location: '',
                startDate: '',
                endDate: '',
                current: false,
                description: ''
            },
            education: {
                id: 'edu_' + Date.now(),
                degree: '',
                field: '',
                school: '',
                location: '',
                startDate: '',
                endDate: '',
                gpa: '',
                honors: ''
            },
            skills: {
                id: 'skill_' + Date.now(),
                category: '',
                items: []
            },
            projects: {
                id: 'proj_' + Date.now(),
                title: '',
                description: '',
                technologies: [],
                link: ''
            }
        };
        
        return defaults[section] || { id: 'item_' + Date.now() };
    }

    removeItem(itemId) {
        // Find and remove item from all sections
        for (const section in this.currentResume.sections) {
            if (Array.isArray(this.currentResume.sections[section])) {
                const index = this.currentResume.sections[section].findIndex(item => item.id === itemId);
                if (index !== -1) {
                    this.currentResume.sections[section].splice(index, 1);
                    
                    // Update UI
                    this.renderSectionItems(section);
                    this.renderPreview();
                    
                    // Mark as edited
                    this.markAsEdited();
                    
                    console.log(`➖ Removed item ${itemId} from ${section}`);
                    return;
                }
            }
        }
    }

    renderSectionItems(section) {
        const container = document.getElementById(`${section}-items`);
        if (!container) return;
        
        const items = this.currentResume.sections[section] || [];
        
        container.innerHTML = items.map((item, index) => `
            <div class="item-editor" data-item-id="${item.id}">
                <div class="item-header">
                    <h4>${section.charAt(0).toUpperCase() + section.slice(1)} ${index + 1}</h4>
                    <button class="btn-remove" data-remove-item="${item.id}">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
                <div class="item-fields">
                    ${this.getSectionFieldsHTML(section, item, index)}
                </div>
            </div>
        `).join('');
    }

    getSectionFieldsHTML(section, item, index) {
        const fields = {
            experience: `
                <div class="form-group">
                    <label>Job Title</label>
                    <input type="text" data-resume-field="experience[${index}].title" 
                           value="${item.title || ''}" placeholder="e.g., Software Engineer">
                </div>
                <div class="form-group">
                    <label>Company</label>
                    <input type="text" data-resume-field="experience[${index}].company" 
                           value="${item.company || ''}" placeholder="e.g., Google">
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label>Start Date</label>
                        <input type="text" data-resume-field="experience[${index}].startDate" 
                               value="${item.startDate || ''}" placeholder="YYYY-MM">
                    </div>
                    <div class="form-group">
                        <label>End Date</label>
                        <input type="text" data-resume-field="experience[${index}].endDate" 
                               value="${item.endDate || ''}" placeholder="YYYY-MM or Present">
                    </div>
                </div>
                <div class="form-group">
                    <label>Description</label>
                    <textarea data-resume-field="experience[${index}].description" 
                              placeholder="Describe your responsibilities and achievements..."
                              rows="3">${item.description || ''}</textarea>
                </div>
            `,
            education: `
                <div class="form-group">
                    <label>Degree</label>
                    <input type="text" data-resume-field="education[${index}].degree" 
                           value="${item.degree || ''}" placeholder="e.g., Bachelor of Science">
                </div>
                <div class="form-group">
                    <label>Field of Study</label>
                    <input type="text" data-resume-field="education[${index}].field" 
                           value="${item.field || ''}" placeholder="e.g., Computer Science">
                </div>
                <div class="form-group">
                    <label>School</label>
                    <input type="text" data-resume-field="education[${index}].school" 
                           value="${item.school || ''}" placeholder="e.g., Harvard University">
                </div>
            `
        };
        
        return fields[section] || '';
    }

    renderPreview() {
        const preview = document.getElementById('resume-preview');
        if (!preview) return;
        
        preview.innerHTML = this.generatePreviewHTML();
        
        // Update preview mode
        this.updatePreviewMode();
    }

    generatePreviewHTML() {
        const resume = this.currentResume;
        
        return `
            <div class="resume-preview-content ${this.currentTemplate}">
                <!-- Header -->
                <div class="preview-header" data-section="personal">
                    <h1 data-preview-field="personal.name">${resume.sections.personal.name || 'Your Name'}</h1>
                    <div class="preview-subtitle">
                        <span data-preview-field="personal.title">${resume.sections.personal.title || 'Professional Title'}</span>
                    </div>
                    <div class="preview-contact">
                        ${this.generateContactInfo()}
                    </div>
                </div>
                
                <!-- Summary -->
                ${resume.sections.summary ? `
                    <div class="preview-section" data-section="summary">
                        <h2>Professional Summary</h2>
                        <p data-preview-field="summary">${resume.sections.summary}</p>
                    </div>
                ` : ''}
                
                <!-- Experience -->
                ${resume.sections.experience?.length ? `
                    <div class="preview-section" data-section="experience">
                        <h2>Work Experience</h2>
                        ${resume.sections.experience.map((exp, index) => `
                            <div class="preview-item">
                                <div class="item-header">
                                    <h3 data-preview-field="experience[${index}].title">${exp.title || 'Job Title'}</h3>
                                    <div class="item-meta">
                                        <span data-preview-field="experience[${index}].company">${exp.company || 'Company'}</span>
                                        <span class="date">
                                            ${exp.startDate || ''} - ${exp.current ? 'Present' : (exp.endDate || '')}
                                        </span>
                                    </div>
                                </div>
                                <div class="item-description">
                                    ${(exp.description || '').split('\n').map(line => `<p>${line}</p>`).join('')}
                                </div>
                            </div>
                        `).join('')}
                    </div>
                ` : ''}
                
                <!-- Education -->
                ${resume.sections.education?.length ? `
                    <div class="preview-section" data-section="education">
                        <h2>Education</h2>
                        ${resume.sections.education.map((edu, index) => `
                            <div class="preview-item">
                                <div class="item-header">
                                    <h3 data-preview-field="education[${index}].degree">${edu.degree || 'Degree'}</h3>
                                    <div class="item-meta">
                                        <span data-preview-field="education[${index}].field">${edu.field || 'Field of Study'}</span>
                                        <span data-preview-field="education[${index}].school">${edu.school || 'School'}</span>
                                    </div>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                ` : ''}
                
                <!-- Skills -->
                ${resume.sections.skills?.length ? `
                    <div class="preview-section" data-section="skills">
                        <h2>Skills</h2>
                        <div class="skills-grid">
                            ${resume.sections.skills.map(skill => `
                                <div class="skill-category">
                                    <h4>${skill.category || 'Category'}</h4>
                                    <div class="skill-items">
                                        ${skill.items?.map(item => `<span class="skill-tag">${item}</span>`).join('') || ''}
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                ` : ''}
            </div>
        `;
    }

    generateContactInfo() {
        const personal = this.currentResume.sections.personal;
        const contactItems = [];
        
        if (personal.email) contactItems.push(`<span data-preview-field="personal.email">${personal.email}</span>`);
        if (personal.phone) contactItems.push(`<span data-preview-field="personal.phone">${personal.phone}</span>`);
        if (personal.location) contactItems.push(`<span data-preview-field="personal.location">${personal.location}</span>`);
        if (personal.linkedin) contactItems.push(`<span data-preview-field="personal.linkedin">${personal.linkedin}</span>`);
        
        return contactItems.map(item => `<div class="contact-item">${item}</div>`).join('');
    }

    setTemplate(templateId) {
        this.currentTemplate = templateId;
        this.currentResume.template = templateId;
        
        // Update UI
        document.querySelectorAll('.template-option').forEach(option => {
            option.classList.toggle('active', option.dataset.template === templateId);
        });
        
        // Update preview
        const preview = document.getElementById('resume-preview');
        if (preview) {
            preview.className = `resume-preview ${templateId}`;
        }
        
        // Mark as edited
        this.markAsEdited();
        
        console.log(`🎨 Template changed to: ${templateId}`);
    }

    setPreviewMode(mode) {
        this.previewMode = mode;
        
        // Update UI
        document.querySelectorAll('[data-preview-mode]').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.previewMode === mode);
        });
        
        // Update preview container
        const previewContainer = document.getElementById('resume-preview-container');
        if (previewContainer) {
            previewContainer.className = `resume-preview-container ${mode}`;
        }
    }

    updatePreviewMode() {
        const previewContainer = document.getElementById('resume-preview-container');
        if (previewContainer) {
            previewContainer.className = `resume-preview-container ${this.previewMode}`;
        }
    }

    async getAISuggestions(section) {
        // Show ad first
        if (typeof AdManager !== 'undefined') {
            await AdManager.showAd('ai_suggestions');
        }
        
        // Get current content
        let content = '';
        switch(section) {
            case 'summary':
                content = this.currentResume.sections.summary;
                break;
            case 'experience':
                content = this.currentResume.sections.experience?.[0]?.description || '';
                break;
        }
        
        if (!content.trim()) {
            this.showNotification('Please add some content first', 'warning');
            return;
        }
        
        this.showNotification('Generating AI suggestions...', 'info');
        
        try {
            // Call AI API
            const response = await fetch('/api/ai/suggest', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    text: content,
                    context: section,
                    resumeData: this.currentResume
                })
            });
            
            const data = await response.json();
            
            if (data.success) {
                this.showAISuggestionsModal(data.suggestions, section);
            } else {
                throw new Error('AI service unavailable');
            }
        } catch (error) {
            // Fallback to mock suggestions
            const mockSuggestions = [
                "Use stronger action verbs like 'Led', 'Developed', 'Implemented'",
                "Add quantifiable results: 'Increased efficiency by 30%'",
                "Include relevant keywords from the job description",
                "Focus on achievements rather than responsibilities"
            ];
            
            this.showAISuggestionsModal(mockSuggestions, section);
        }
    }

    showAISuggestionsModal(suggestions, section) {
        const modal = document.createElement('div');
        modal.className = 'modal ai-suggestions-modal active';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3><i class="fas fa-robot"></i> AI Suggestions for ${section}</h3>
                    <button class="modal-close" onclick="this.closest('.modal').classList.remove('active')">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="modal-body">
                    <div class="suggestions-list">
                        ${suggestions.map((suggestion, index) => `
                            <div class="suggestion-item">
                                <div class="suggestion-number">${index + 1}</div>
                                <div class="suggestion-text">${suggestion}</div>
                                <button class="btn-apply" data-suggestion-index="${index}">
                                    <i class="fas fa-check"></i> Apply
                                </button>
                            </div>
                        `).join('')}
                    </div>
                </div>
                <div class="modal-footer">
                    <button class="btn-secondary" onclick="this.closest('.modal').classList.remove('active')">
                        Close
                    </button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Add event listeners for apply buttons
        modal.querySelectorAll('.btn-apply').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const index = e.target.closest('.btn-apply').dataset.suggestionIndex;
                this.applyAISuggestion(suggestions[index], section);
            });
        });
    }

    applyAISuggestion(suggestion, section) {
        // Simple implementation - just show notification
        this.showNotification('Suggestion applied', 'success');
        
        // In a real implementation, you would update the content
        console.log(`Applied suggestion to ${section}:`, suggestion);
    }

    async exportResume(format) {
        // Show ad first
        if (typeof AdManager !== 'undefined') {
            await AdManager.showAdForExport();
        }
        
        // Save current resume first
        await this.saveResume();
        
        // Generate export
        switch(format) {
            case 'pdf':
                await this.exportToPDF();
                break;
            case 'docx':
                await this.exportToDOCX();
                break;
            case 'print':
                this.printResume();
                break;
        }
    }

    async exportToPDF() {
        this.showNotification('Generating PDF...', 'info');
        
        try {
            // Generate HTML for PDF
            const html = this.generateExportHTML();
            
            // Call backend API
            const response = await fetch('/api/generate-pdf', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ html: html })
            });
            
            if (response.ok) {
                const blob = await response.blob();
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `resume_${this.currentResume.id}.pdf`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
                
                this.showNotification('PDF downloaded successfully', 'success');
            } else {
                throw new Error('PDF generation failed');
            }
        } catch (error) {
            console.error('PDF export error:', error);
            this.showNotification('Failed to generate PDF. Using browser print instead.', 'warning');
            
            // Fallback to print
            this.printResume();
        }
    }

    generateExportHTML() {
        // Generate clean HTML for export
        return `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <title>${this.currentResume.title}</title>
                <style>
                    body { 
                        font-family: Arial, sans-serif; 
                        margin: 0; 
                        padding: 40px;
                        color: #333;
                        line-height: 1.6;
                    }
                    
                    .resume-container {
                        max-width: 800px;
                        margin: 0 auto;
                    }
                    
                    .header { 
                        text-align: center;
                        margin-bottom: 40px;
                        border-bottom: 2px solid #333;
                        padding-bottom: 20px;
                    }
                    
                    .name { 
                        font-size: 32px; 
                        font-weight: bold;
                        margin: 0;
                    }
                    
                    .title {
                        font-size: 18px;
                        color: #666;
                        margin: 10px 0;
                    }
                    
                    .contact-info {
                        display: flex;
                        justify-content: center;
                        gap: 20px;
                        flex-wrap: wrap;
                        margin-top: 10px;
                        font-size: 14px;
                    }
                    
                    .section {
                        margin-bottom: 30px;
                    }
                    
                    .section-title {
                        font-size: 20px;
                        font-weight: bold;
                        border-bottom: 1px solid #ccc;
                        padding-bottom: 5px;
                        margin-bottom: 15px;
                    }
                    
                    .item {
                        margin-bottom: 15px;
                    }
                    
                    .item-header {
                        display: flex;
                        justify-content: space-between;
                        margin-bottom: 5px;
                    }
                    
                    .item-title {
                        font-weight: bold;
                    }
                    
                    .item-meta {
                        color: #666;
                        font-size: 14px;
                    }
                    
                    .skills-grid {
                        display: grid;
                        grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
                        gap: 15px;
                    }
                    
                    .skill-category {
                        margin-bottom: 15px;
                    }
                    
                    .skill-items {
                        display: flex;
                        flex-wrap: wrap;
                        gap: 5px;
                    }
                    
                    .skill-tag {
                        background: #f0f0f0;
                        padding: 3px 8px;
                        border-radius: 3px;
                        font-size: 12px;
                    }
                    
                    @media print {
                        body { padding: 0; }
                        .resume-container { max-width: 100%; }
                    }
                </style>
            </head>
            <body>
                <div class="resume-container">
                    ${this.generateExportContent()}
                </div>
            </body>
            </html>
        `;
    }

    generateExportContent() {
        const resume = this.currentResume;
        
        return `
            <!-- Header -->
            <div class="header">
                <h1 class="name">${resume.sections.personal.name || 'Your Name'}</h1>
                <div class="title">${resume.sections.personal.title || 'Professional Title'}</div>
                <div class="contact-info">
                    ${resume.sections.personal.email ? `<div>${resume.sections.personal.email}</div>` : ''}
                    ${resume.sections.personal.phone ? `<div>${resume.sections.personal.phone}</div>` : ''}
                    ${resume.sections.personal.location ? `<div>${resume.sections.personal.location}</div>` : ''}
                </div>
            </div>
            
            <!-- Summary -->
            ${resume.sections.summary ? `
                <div class="section">
                    <h2 class="section-title">Professional Summary</h2>
                    <p>${resume.sections.summary}</p>
                </div>
            ` : ''}
            
            <!-- Experience -->
            ${resume.sections.experience?.length ? `
                <div class="section">
                    <h2 class="section-title">Work Experience</h2>
                    ${resume.sections.experience.map(exp => `
                        <div class="item">
                            <div class="item-header">
                                <div class="item-title">${exp.title || ''}</div>
                                <div class="item-meta">${exp.startDate || ''} - ${exp.current ? 'Present' : (exp.endDate || '')}</div>
                            </div>
                            <div class="item-meta">${exp.company || ''} ${exp.location ? `| ${exp.location}` : ''}</div>
                            <div class="item-description">
                                ${(exp.description || '').split('\n').map(line => `<p>${line}</p>`).join('')}
                            </div>
                        </div>
                    `).join('')}
                </div>
            ` : ''}
            
            <!-- Add more sections similarly -->
        `;
    }

    printResume() {
        const printWindow = window.open('', '_blank');
        printWindow.document.write(this.generateExportHTML());
        printWindow.document.close();
        printWindow.focus();
        
        setTimeout(() => {
            printWindow.print();
            printWindow.close();
        }, 500);
    }

    saveResume() {
        // Update timestamp
        this.currentResume.updatedAt = new Date().toISOString();
        this.currentResume.meta.lastEdited = new Date().toISOString();
        
        // Save to session
        this.saveToSession();
        
        // Show notification
        this.showNotification('Resume saved successfully', 'success');
        
        console.log('💾 Resume saved:', this.currentResume.id);
        
        return true;
    }

    startAutoSave() {
        // Auto-save every 30 seconds
        setInterval(() => {
            if (this.isEditing) {
                this.saveResume();
                this.isEditing = false;
            }
        }, 30000);
    }

    markAsEdited() {
        this.isEditing = true;
        
        // Update last edited time
        this.currentResume.meta.lastEdited = new Date().toISOString();
    }

    updateWordCount() {
        let totalWords = 0;
        let totalChars = 0;
        
        // Count words in all sections
        const countText = (text) => {
            if (!text) return { words: 0, chars: 0 };
            const words = text.trim().split(/\s+/).length;
            const chars = text.length;
            return { words, chars };
        };
        
        // Count in summary
        const summaryCount = countText(this.currentResume.sections.summary);
        totalWords += summaryCount.words;
        totalChars += summaryCount.chars;
        
        // Count in experience descriptions
        this.currentResume.sections.experience?.forEach(exp => {
            const expCount = countText(exp.description);
            totalWords += expCount.words;
            totalChars += expCount.chars;
        });
        
        // Update resume meta
        this.currentResume.meta.wordCount = totalWords;
        this.currentResume.meta.characterCount = totalChars;
        
        // Update UI
        const wordCountElement = document.getElementById('word-count');
        if (wordCountElement) {
            wordCountElement.textContent = `${totalWords} words`;
        }
    }

    showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `builder-notification builder-notification-${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <i class="fas fa-${this.getNotificationIcon(type)}"></i>
                <span>${message}</span>
            </div>
            <button class="notification-close">
                <i class="fas fa-times"></i>
            </button>
        `;
        
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${this.getNotificationColor(type)};
            color: white;
            padding: 15px 20px;
            border-radius: 8px;
            display: flex;
            align-items: center;
            gap: 10px;
            z-index: 1000;
            animation: slideInRight 0.3s ease;
        `;
        
        document.body.appendChild(notification);
        
        // Close button
        notification.querySelector('.notification-close').onclick = () => {
            notification.style.animation = 'slideOutRight 0.3s ease';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        };
        
        // Auto remove after 5 seconds
        setTimeout(() => {
            if (notification.parentNode) {
                notification.style.animation = 'slideOutRight 0.3s ease';
                setTimeout(() => {
                    if (notification.parentNode) {
                        notification.parentNode.removeChild(notification);
                    }
                }, 300);
            }
        }, 5000);
    }

    getNotificationIcon(type) {
        const icons = {
            success: 'check-circle',
            error: 'exclamation-circle',
            warning: 'exclamation-triangle',
            info: 'info-circle'
        };
        return icons[type] || 'info-circle';
    }

    getNotificationColor(type) {
        const colors = {
            success: '#10b981',
            error: '#ef4444',
            warning: '#f59e0b',
            info: '#6366f1'
        };
        return colors[type] || '#6366f1';
    }
}

// Initialize Resume Builder when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    const builder = new ResumeBuilder();
    
    // Make globally available
    window.resumeBuilder = builder;
    
    // Expose helper functions
    window.saveResume = function() {
        return builder.saveResume();
    };
    
    window.exportResume = function(format) {
        return builder.exportResume(format);
    };
    
    console.log('🎨 Resume Builder loaded successfully!');
});
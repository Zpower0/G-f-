/**
 * Resume Examples Gallery
 */

class ExamplesManager {
    constructor() {
        this.examples = [];
        this.filteredExamples = [];
        this.currentIndustry = 'all';
        this.currentLevel = 'all';
        this.currentPage = 1;
        this.examplesPerPage = 12;
        this.init();
    }

    async init() {
        await this.loadExamples();
        this.renderExamples();
        this.setupEventListeners();
        this.setupSearch();
        this.setupTabs();
    }

    async loadExamples() {
        try {
            const response = await fetch('/templates/examples.json');
            if (!response.ok) throw new Error('Failed to load examples');
            
            const data = await response.json();
            this.examples = data.examples;
            this.filteredExamples = [...this.examples];
            
            console.log(`Loaded ${this.examples.length} resume examples`);
        } catch (error) {
            console.error('Error loading examples:', error);
            this.examples = this.getFallbackExamples();
            this.filteredExamples = [...this.examples];
        }
    }

    getFallbackExamples() {
        return [
            {
                id: 'software-engineer-senior',
                title: 'Senior Software Engineer',
                industry: 'technology',
                experience: 'senior',
                template: 'modern',
                description: 'FAANG-level senior software engineer resume with quantifiable achievements',
                stats: { views: 12500, downloads: 3200, rating: 4.9, ats_score: 92 }
            },
            {
                id: 'marketing-manager-mid',
                title: 'Marketing Manager',
                industry: 'business',
                experience: 'mid',
                template: 'professional',
                description: 'Results-driven marketing manager resume with campaign metrics',
                stats: { views: 8700, downloads: 2100, rating: 4.7, ats_score: 88 }
            },
            {
                id: 'cs-student-entry',
                title: 'Computer Science Student',
                industry: 'technology',
                experience: 'student',
                template: 'student',
                description: 'Entry-level resume for computer science students with projects',
                stats: { views: 15300, downloads: 4800, rating: 4.8, ats_score: 85 }
            }
        ];
    }

    renderExamples() {
        const container = document.getElementById('examplesGrid');
        if (!container) return;

        // Clear loading state
        const loading = container.querySelector('.loading-examples');
        if (loading) loading.remove();

        if (this.filteredExamples.length === 0) {
            container.innerHTML = `
                <div class="no-examples">
                    <i class="fas fa-search"></i>
                    <h3>No examples found</h3>
                    <p>Try a different search or filter</p>
                </div>
            `;
            return;
        }

        // Calculate pagination
        const startIndex = (this.currentPage - 1) * this.examplesPerPage;
        const endIndex = startIndex + this.examplesPerPage;
        const pageExamples = this.filteredExamples.slice(startIndex, endIndex);

        container.innerHTML = '';

        pageExamples.forEach(example => {
            const exampleCard = this.createExampleCard(example);
            container.appendChild(exampleCard);
        });

        // Update pagination
        this.updatePagination();
    }

    createExampleCard(example) {
        const card = document.createElement('div');
        card.className = 'example-card';
        card.dataset.exampleId = example.id;
        card.dataset.industry = example.industry;
        card.dataset.experience = example.experience;

        const ratingStars = this.generateStars(example.stats?.rating || 4.0);
        const atsScore = example.stats?.ats_score || 85;

        card.innerHTML = `
            <div class="example-header">
                <div class="example-badges">
                    <span class="industry-badge">${this.getIndustryName(example.industry)}</span>
                    <span class="level-badge">${this.getLevelName(example.experience)}</span>
                </div>
                <div class="example-stats">
                    <span class="stat">
                        <i class="fas fa-eye"></i> ${this.formatNumber(example.stats?.views || 0)}
                    </span>
                    <span class="stat">
                        <i class="fas fa-download"></i> ${this.formatNumber(example.stats?.downloads || 0)}
                    </span>
                </div>
            </div>
            
            <div class="example-content">
                <h3>${example.title}</h3>
                <p>${example.description}</p>
                
                <div class="example-meta">
                    <div class="rating">
                        ${ratingStars}
                        <span>${example.stats?.rating || 4.0}</span>
                    </div>
                    <div class="ats-score">
                        <span class="score-label">ATS Score</span>
                        <span class="score-value ${this.getScoreClass(atsScore)}">${atsScore}</span>
                    </div>
                </div>
            </div>
            
            <div class="example-footer">
                <button class="btn-secondary preview-example" data-example="${example.id}">
                    <i class="fas fa-eye"></i> Preview
                </button>
                <button class="btn-primary use-example" data-example="${example.id}">
                    <i class="fas fa-magic"></i> Use as Template
                </button>
            </div>
        `;

        // Add event listeners
        const previewBtn = card.querySelector('.preview-example');
        const useBtn = card.querySelector('.use-example');

        previewBtn.addEventListener('click', () => this.previewExample(example));
        useBtn.addEventListener('click', () => this.useExample(example));

        return card;
    }

    generateStars(rating) {
        const fullStars = Math.floor(rating);
        const hasHalfStar = rating % 1 >= 0.5;
        let stars = '';
        
        for (let i = 1; i <= 5; i++) {
            if (i <= fullStars) {
                stars += '<i class="fas fa-star"></i>';
            } else if (i === fullStars + 1 && hasHalfStar) {
                stars += '<i class="fas fa-star-half-alt"></i>';
            } else {
                stars += '<i class="far fa-star"></i>';
            }
        }
        
        return stars;
    }

    getIndustryName(industryId) {
        const industries = {
            'technology': 'Technology',
            'business': 'Business',
            'design': 'Design',
            'healthcare': 'Healthcare',
            'education': 'Education',
            'engineering': 'Engineering',
            'sales': 'Sales',
            'finance': 'Finance'
        };
        return industries[industryId] || industryId;
    }

    getLevelName(levelId) {
        const levels = {
            'student': 'Student',
            'entry': 'Entry Level',
            'mid': 'Mid Level',
            'senior': 'Senior',
            'executive': 'Executive'
        };
        return levels[levelId] || levelId;
    }

    formatNumber(num) {
        if (num >= 1000000) {
            return (num / 1000000).toFixed(1) + 'M';
        } else if (num >= 1000) {
            return (num / 1000).toFixed(1) + 'K';
        }
        return num.toString();
    }

    getScoreClass(score) {
        if (score >= 90) return 'score-excellent';
        if (score >= 80) return 'score-good';
        if (score >= 70) return 'score-fair';
        return 'score-poor';
    }

    previewExample(example) {
        // Create preview modal
        const modal = document.createElement('div');
        modal.className = 'example-preview-modal';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h2>${example.title} - Example Preview</h2>
                    <button class="close-modal">&times;</button>
                </div>
                <div class="modal-body">
                    <div class="preview-container">
                        <div class="preview-header">
                            <div class="preview-meta">
                                <div class="meta-item">
                                    <span class="label">Industry:</span>
                                    <span class="value">${this.getIndustryName(example.industry)}</span>
                                </div>
                                <div class="meta-item">
                                    <span class="label">Experience Level:</span>
                                    <span class="value">${this.getLevelName(example.experience)}</span>
                                </div>
                                <div class="meta-item">
                                    <span class="label">ATS Score:</span>
                                    <span class="value ${this.getScoreClass(example.stats?.ats_score || 85)}">
                                        ${example.stats?.ats_score || 85}/100
                                    </span>
                                </div>
                            </div>
                        </div>
                        
                        <div class="preview-content">
                            <div class="preview-placeholder">
                                <div class="placeholder-template" style="border-color: ${example.color || '#3b82f6'}">
                                    <div class="placeholder-header" style="background: ${example.color || '#3b82f6'}20">
                                        <h3>${example.title} Resume Example</h3>
                                    </div>
                                    <div class="placeholder-body">
                                        <p>This is a preview of the "${example.title}" resume example.</p>
                                        <p>${example.description}</p>
                                        <div class="placeholder-stats">
                                            <div class="stat">
                                                <i class="fas fa-eye"></i>
                                                <span>${this.formatNumber(example.stats?.views || 0)} views</span>
                                            </div>
                                            <div class="stat">
                                                <i class="fas fa-download"></i>
                                                <span>${this.formatNumber(example.stats?.downloads || 0)} downloads</span>
                                            </div>
                                            <div class="stat">
                                                <i class="fas fa-star"></i>
                                                <span>Rating: ${example.stats?.rating || 4.0}/5</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            
                            <div class="preview-actions">
                                <button class="btn-secondary close-modal">Close Preview</button>
                                <button class="btn-primary use-example-modal" data-example="${example.id}">
                                    <i class="fas fa-magic"></i> Use This Example
                                </button>
                                <button class="btn-text download-example" data-example="${example.id}">
                                    <i class="fas fa-download"></i> Download PDF
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        // Add event listeners
        const closeBtns = modal.querySelectorAll('.close-modal');
        const useBtn = modal.querySelector('.use-example-modal');
        const downloadBtn = modal.querySelector('.download-example');

        closeBtns.forEach(btn => {
            btn.addEventListener('click', () => modal.remove());
        });

        useBtn.addEventListener('click', () => {
            this.useExample(example);
            modal.remove();
        });

        downloadBtn.addEventListener('click', () => {
            this.downloadExample(example);
        });

        // Close on ESC
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') modal.remove();
        });
    }

    useExample(example) {
        // Save example data
        localStorage.setItem('selectedExample', JSON.stringify(example));
        localStorage.setItem('selectedTemplate', example.template || 'professional');
        
        // Redirect to builder with example data
        window.location.href = `/builder.html?example=${example.id}`;
    }

    downloadExample(example) {
        // In a real implementation, this would download the example PDF
        console.log(`Downloading example: ${example.id}`);
        
        // Show download success message
        this.showToast(`Downloading ${example.title} example...`, 'info');
        
        // Simulate download
        setTimeout(() => {
            this.showToast('Example downloaded successfully!', 'success');
        }, 1000);
    }

    filterExamples(industry = 'all', level = 'all') {
        this.currentIndustry = industry;
        this.currentLevel = level;
        this.currentPage = 1;
        
        if (industry === 'all' && level === 'all') {
            this.filteredExamples = [...this.examples];
        } else {
            this.filteredExamples = this.examples.filter(example => {
                const matchesIndustry = industry === 'all' || example.industry === industry;
                const matchesLevel = level === 'all' || example.experience === level;
                return matchesIndustry && matchesLevel;
            });
        }
        
        this.renderExamples();
        
        // Update active filters
        this.updateActiveFilters();
    }

    searchExamples(query) {
        if (!query.trim()) {
            this.filteredExamples = [...this.examples];
        } else {
            const searchTerm = query.toLowerCase();
            this.filteredExamples = this.examples.filter(example =>
                example.title.toLowerCase().includes(searchTerm) ||
                example.description.toLowerCase().includes(searchTerm) ||
                example.industry.toLowerCase().includes(searchTerm) ||
                example.experience.toLowerCase().includes(searchTerm)
            );
        }
        
        this.currentPage = 1;
        this.renderExamples();
    }

    updateActiveFilters() {
        // Update industry filter buttons
        document.querySelectorAll('.industry-card').forEach(card => {
            if (this.currentIndustry === 'all' || card.dataset.industry === this.currentIndustry) {
                card.classList.add('active');
            } else {
                card.classList.remove('active');
            }
        });

        // Update experience level tabs
        document.querySelectorAll('.exp-tab').forEach(tab => {
            if (this.currentLevel === 'all' || tab.dataset.level === this.currentLevel) {
                tab.classList.add('active');
            } else {
                tab.classList.remove('active');
            }
        });
    }

    updatePagination() {
        const totalPages = Math.ceil(this.filteredExamples.length / this.examplesPerPage);
        
        // Remove existing pagination
        const existingPagination = document.querySelector('.examples-pagination');
        if (existingPagination) existingPagination.remove();
        
        if (totalPages <= 1) return;
        
        const container = document.getElementById('examplesGrid');
        if (!container) return;
        
        const pagination = document.createElement('div');
        pagination.className = 'examples-pagination';
        
        let paginationHTML = `
            <button class="page-btn ${this.currentPage === 1 ? 'disabled' : ''}" data-page="prev">
                <i class="fas fa-chevron-left"></i> Previous
            </button>
            <div class="page-numbers">
        `;
        
        for (let i = 1; i <= totalPages; i++) {
            if (i === 1 || i === totalPages || (i >= this.currentPage - 1 && i <= this.currentPage + 1)) {
                paginationHTML += `
                    <button class="page-btn ${i === this.currentPage ? 'active' : ''}" data-page="${i}">
                        ${i}
                    </button>
                `;
            } else if (i === this.currentPage - 2 || i === this.currentPage + 2) {
                paginationHTML += '<span class="page-dots">...</span>';
            }
        }
        
        paginationHTML += `
            </div>
            <button class="page-btn ${this.currentPage === totalPages ? 'disabled' : ''}" data-page="next">
                Next <i class="fas fa-chevron-right"></i>
            </button>
        `;
        
        pagination.innerHTML = paginationHTML;
        container.after(pagination);
        
        // Add pagination event listeners
        pagination.querySelectorAll('.page-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const page = btn.dataset.page;
                if (page === 'prev' && this.currentPage > 1) {
                    this.currentPage--;
                } else if (page === 'next' && this.currentPage < totalPages) {
                    this.currentPage++;
                } else if (!isNaN(page)) {
                    this.currentPage = parseInt(page);
                }
                this.renderExamples();
                window.scrollTo({ top: container.offsetTop - 100, behavior: 'smooth' });
            });
        });
    }

    setupEventListeners() {
        // Industry filter cards
        document.querySelectorAll('.industry-card').forEach(card => {
            card.addEventListener('click', (e) => {
                e.preventDefault();
                const industry = card.dataset.industry;
                this.filterExamples(industry, this.currentLevel);
            });
        });

        // Featured example buttons
        document.querySelectorAll('.view-example').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                const exampleId = e.target.dataset.example;
                const example = this.examples.find(ex => ex.id === exampleId);
                if (example) {
                    this.previewExample(example);
                }
            });
        });
    }

    setupSearch() {
        const searchInput = document.getElementById('exampleSearch');
        if (!searchInput) return;

        let searchTimeout;
        searchInput.addEventListener('input', (e) => {
            clearTimeout(searchTimeout);
            searchTimeout = setTimeout(() => {
                this.searchExamples(e.target.value);
            }, 300);
        });
    }

    setupTabs() {
        const tabs = document.querySelectorAll('.exp-tab');
        if (!tabs.length) return;

        tabs.forEach(tab => {
            tab.addEventListener('click', () => {
                const level = tab.dataset.level;
                this.filterExamples(this.currentIndustry, level);
            });
        });
    }

    showToast(message, type = 'info') {
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.innerHTML = `
            <i class="fas fa-${type === 'success' ? 'check-circle' : 'info-circle'}"></i>
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

// Initialize examples manager
document.addEventListener('DOMContentLoaded', () => {
    if (document.querySelector('.examples-page') || document.querySelector('.examples-section')) {
        window.examplesManager = new ExamplesManager();
    }
});
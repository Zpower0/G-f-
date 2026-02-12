/**
 * Resume Tools Manager
 */

class ToolsManager {
    constructor() {
        this.currentTool = null;
        this.toolStates = new Map();
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.setupToolInterfaces();
        this.loadToolStates();
    }

    setupEventListeners() {
        // Tool selection buttons
        document.querySelectorAll('.use-tool').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const toolId = e.target.closest('.use-tool').dataset.tool;
                this.openTool(toolId);
            });
        });

        // Back to tools button
        const backBtn = document.querySelector('.back-to-tools');
        if (backBtn) {
            backBtn.addEventListener('click', () => this.closeTool());
        }

        // File upload
        const uploadInput = document.getElementById('resumeUpload');
        const browseBtn = document.getElementById('browseBtn');
        const uploadArea = document.getElementById('uploadArea');

        if (browseBtn && uploadInput) {
            browseBtn.addEventListener('click', () => uploadInput.click());
        }

        if (uploadInput) {
            uploadInput.addEventListener('change', (e) => this.handleFileUpload(e));
        }

        if (uploadArea) {
            uploadArea.addEventListener('dragover', (e) => {
                e.preventDefault();
                uploadArea.classList.add('dragover');
            });

            uploadArea.addEventListener('dragleave', () => {
                uploadArea.classList.remove('dragover');
            });

            uploadArea.addEventListener('drop', (e) => {
                e.preventDefault();
                uploadArea.classList.remove('dragover');
                if (e.dataTransfer.files.length) {
                    this.handleFileUpload({ target: { files: e.dataTransfer.files } });
                }
            });
        }

        // Analyze button
        const analyzeBtn = document.getElementById('analyzeBtn');
        if (analyzeBtn) {
            analyzeBtn.addEventListener('click', () => this.analyzeResume());
        }

        // Sample button
        const sampleBtn = document.getElementById('sampleBtn');
        if (sampleBtn) {
            sampleBtn.addEventListener('click', () => this.loadSampleResume());
        }

        // Word count for textarea
        const resumeText = document.getElementById('resumeText');
        if (resumeText) {
            resumeText.addEventListener('input', () => this.updateWordCount());
        }

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.currentTool) {
                this.closeTool();
            }
        });
    }

    setupToolInterfaces() {
        // Initialize all tool interfaces
        this.tools = {
            'ats-checker': {
                name: 'ATS Resume Checker',
                description: 'Check if your resume will pass through Applicant Tracking Systems',
                icon: 'fas fa-robot',
                color: '#ef4444'
            },
            'keyword-analyzer': {
                name: 'Keyword Analyzer',
                description: 'Extract keywords from job descriptions',
                icon: 'fas fa-search',
                color: '#3b82f6'
            },
            'resume-scanner': {
                name: 'Resume Scanner',
                description: 'Get instant feedback on your resume',
                icon: 'fas fa-scanner',
                color: '#10b981'
            },
            'cover-letter': {
                name: 'Cover Letter Generator',
                description: 'Create personalized cover letters',
                icon: 'fas fa-envelope-open-text',
                color: '#8b5cf6'
            },
            'summary-generator': {
                name: 'Summary Generator',
                description: 'Create compelling professional summaries',
                icon: 'fas fa-sparkles',
                color: '#f59e0b'
            },
            'skills-extractor': {
                name: 'Skills Extractor',
                description: 'Extract and categorize skills',
                icon: 'fas fa-tools',
                color: '#6366f1'
            },
            'length-checker': {
                name: 'Length Checker',
                description: 'Ensure optimal resume length',
                icon: 'fas fa-ruler',
                color: '#84cc16'
            },
            'action-verbs': {
                name: 'Action Verb Suggester',
                description: 'Replace weak phrases with powerful verbs',
                icon: 'fas fa-bolt',
                color: '#ec4899'
            }
        };
    }

    openTool(toolId) {
        this.currentTool = toolId;
        const tool = this.tools[toolId];
        
        if (!tool) {
            console.error(`Tool ${toolId} not found`);
            return;
        }

        // Hide all tool interfaces
        document.querySelectorAll('.tool-interface').forEach(interface => {
            interface.style.display = 'none';
        });

        // Hide main tools grid
        const mainTools = document.querySelector('.main-tools');
        if (mainTools) mainTools.style.display = 'none';

        // Show specific tool interface
        const toolInterface = document.getElementById(`${toolId}-tool`);
        if (toolInterface) {
            toolInterface.style.display = 'block';
            
            // Update tool header
            const header = toolInterface.querySelector('.tool-header h2');
            if (header) header.textContent = tool.name;
            
            // Scroll to tool
            window.scrollTo({ top: toolInterface.offsetTop - 80, behavior: 'smooth' });
        } else {
            // Create dynamic tool interface for tools without predefined HTML
            this.createDynamicToolInterface(tool);
        }

        // Save tool state
        this.saveToolState(toolId, { openedAt: new Date().toISOString() });
    }

    createDynamicToolInterface(tool) {
        // Create a generic tool interface
        const interfaceHTML = `
            <section class="tool-interface" id="${tool.id}-tool">
                <div class="container">
                    <div class="tool-header">
                        <button class="back-to-tools">
                            <i class="fas fa-arrow-left"></i> Back to Tools
                        </button>
                        <h2>${tool.name}</h2>
                        <p>${tool.description}</p>
                    </div>
                    
                    <div class="tool-container">
                        <div class="tool-loading">
                            <div class="spinner"></div>
                            <p>Loading ${tool.name}...</p>
                        </div>
                    </div>
                </div>
            </section>
        `;

        // Add to page
        const main = document.querySelector('main') || document.body;
        const ctaSection = document.querySelector('.cta-section');
        if (ctaSection) {
            ctaSection.insertAdjacentHTML('beforebegin', interfaceHTML);
        } else {
            main.insertAdjacentHTML('beforeend', interfaceHTML);
        }

        // Show the interface
        const toolInterface = document.getElementById(`${tool.id}-tool`);
        toolInterface.style.display = 'block';

        // Hide main tools
        const mainTools = document.querySelector('.main-tools');
        if (mainTools) mainTools.style.display = 'none';

        // Scroll to tool
        window.scrollTo({ top: toolInterface.offsetTop - 80, behavior: 'smooth' });

        // Load tool content
        setTimeout(() => this.loadToolContent(tool), 100);
    }

    loadToolContent(tool) {
        const toolInterface = document.getElementById(`${tool.id}-tool`);
        if (!toolInterface) return;

        const toolContainer = toolInterface.querySelector('.tool-container');
        
        switch(tool.id) {
            case 'keyword-analyzer':
                toolContainer.innerHTML = this.getKeywordAnalyzerHTML();
                this.setupKeywordAnalyzer();
                break;
            case 'cover-letter':
                toolContainer.innerHTML = this.getCoverLetterGeneratorHTML();
                this.setupCoverLetterGenerator();
                break;
            case 'summary-generator':
                toolContainer.innerHTML = this.getSummaryGeneratorHTML();
                this.setupSummaryGenerator();
                break;
            default:
                toolContainer.innerHTML = `
                    <div class="tool-coming-soon">
                        <i class="fas fa-tools"></i>
                        <h3>Coming Soon</h3>
                        <p>${tool.name} is under development and will be available soon!</p>
                        <button class="btn-primary back-to-tools">
                            <i class="fas fa-arrow-left"></i> Back to Tools
                        </button>
                    </div>
                `;
        }

        // Re-attach event listeners
        this.setupEventListeners();
    }

    getKeywordAnalyzerHTML() {
        return `
            <div class="tool-input-columns">
                <div class="input-column">
                    <h3>Paste Job Description</h3>
                    <textarea id="jobDescription" placeholder="Paste the job description here..."></textarea>
                    <div class="word-count">
                        <span id="jdWordCount">0 words</span>
                        <span id="jdCharCount">0 characters</span>
                    </div>
                </div>
                
                <div class="input-column">
                    <h3>Paste Your Resume</h3>
                    <textarea id="resumeForKeywords" placeholder="Paste your resume text here..."></textarea>
                    <div class="word-count">
                        <span id="resumeWordCount">0 words</span>
                        <span id="resumeCharCount">0 characters</span>
                    </div>
                </div>
            </div>
            
            <div class="tool-actions">
                <button class="btn-primary" id="analyzeKeywordsBtn">
                    <i class="fas fa-search"></i> Analyze Keywords
                </button>
                <button class="btn-secondary" id="loadSampleKeywords">
                    <i class="fas fa-file-alt"></i> Load Sample
                </button>
                <button class="btn-text" id="clearKeywords">
                    <i class="fas fa-trash"></i> Clear All
                </button>
            </div>
            
            <div class="tool-results" id="keywordResults" style="display: none;">
                <div class="results-header">
                    <h3>Keyword Analysis Results</h3>
                    <div class="match-score">
                        <span class="score-label">Match Score</span>
                        <span class="score-value" id="matchScore">0%</span>
                    </div>
                </div>
                
                <div class="results-grid">
                    <div class="result-column">
                        <h4>Missing Keywords</h4>
                        <div class="keyword-list" id="missingKeywords"></div>
                    </div>
                    
                    <div class="result-column">
                        <h4>Matched Keywords</h4>
                        <div class="keyword-list" id="matchedKeywords"></div>
                    </div>
                    
                    <div class="result-column">
                        <h4>Recommended Keywords</h4>
                        <div class="keyword-list" id="recommendedKeywords"></div>
                    </div>
                </div>
                
                <div class="recommendations">
                    <h4>Recommendations</h4>
                    <div id="keywordRecommendations"></div>
                </div>
                
                <div class="result-actions">
                    <button class="btn-primary" id="exportKeywords">
                        <i class="fas fa-download"></i> Export Report
                    </button>
                    <button class="btn-secondary" id="applyKeywords">
                        <i class="fas fa-magic"></i> Apply to Resume
                    </button>
                </div>
            </div>
        `;
    }

    getCoverLetterGeneratorHTML() {
        return `
            <div class="cover-letter-form">
                <div class="form-grid">
                    <div class="form-group">
                        <label for="clJobTitle">Job Title</label>
                        <input type="text" id="clJobTitle" placeholder="e.g., Senior Software Engineer">
                    </div>
                    
                    <div class="form-group">
                        <label for="clCompany">Company Name</label>
                        <input type="text" id="clCompany" placeholder="e.g., TechCorp Inc.">
                    </div>
                    
                    <div class="form-group">
                        <label for="clIndustry">Industry</label>
                        <select id="clIndustry">
                            <option value="">Select Industry</option>
                            <option value="technology">Technology</option>
                            <option value="business">Business</option>
                            <option value="healthcare">Healthcare</option>
                            <option value="education">Education</option>
                            <option value="creative">Creative</option>
                        </select>
                    </div>
                    
                    <div class="form-group">
                        <label for="clExperience">Experience Level</label>
                        <select id="clExperience">
                            <option value="">Select Level</option>
                            <option value="entry">Entry Level</option>
                            <option value="mid">Mid Level</option>
                            <option value="senior">Senior</option>
                            <option value="executive">Executive</option>
                        </select>
                    </div>
                </div>
                
                <div class="form-group">
                    <label for="clJobDescription">Job Description/Requirements</label>
                    <textarea id="clJobDescription" rows="4" placeholder="Paste key requirements from the job description..."></textarea>
                </div>
                
                <div class="form-group">
                    <label for="clYourSkills">Your Relevant Skills & Experience</label>
                    <textarea id="clYourSkills" rows="4" placeholder="Describe your relevant skills and experience..."></textarea>
                </div>
                
                <div class="form-actions">
                    <button class="btn-primary" id="generateCoverLetter">
                        <i class="fas fa-magic"></i> Generate Cover Letter
                    </button>
                    <button class="btn-secondary" id="loadSampleCoverLetter">
                        <i class="fas fa-file-alt"></i> Load Sample
                    </button>
                </div>
            </div>
            
            <div class="cover-letter-preview" id="coverLetterPreview" style="display: none;">
                <div class="preview-header">
                    <h3>Generated Cover Letter</h3>
                    <div class="preview-actions">
                        <button class="btn-text" id="regenerateCL">
                            <i class="fas fa-redo"></i> Regenerate
                        </button>
                        <button class="btn-text" id="editCL">
                            <i class="fas fa-edit"></i> Edit
                        </button>
                    </div>
                </div>
                
                <div class="preview-content" id="clContent"></div>
                
                <div class="preview-footer">
                    <button class="btn-primary" id="downloadCL">
                        <i class="fas fa-download"></i> Download as DOCX
                    </button>
                    <button class="btn-secondary" id="copyCL">
                        <i class="fas fa-copy"></i> Copy to Clipboard
                    </button>
                    <button class="btn-text" id="startOverCL">
                        <i class="fas fa-redo"></i> Start Over
                    </button>
                </div>
            </div>
        `;
    }

    setupKeywordAnalyzer() {
        const jobDesc = document.getElementById('jobDescription');
        const resumeText = document.getElementById('resumeForKeywords');
        const analyzeBtn = document.getElementById('analyzeKeywordsBtn');
        const clearBtn = document.getElementById('clearKeywords');
        const sampleBtn = document.getElementById('loadSampleKeywords');

        if (jobDesc) {
            jobDesc.addEventListener('input', () => this.updateTextAreaCount(jobDesc, 'jd'));
        }

        if (resumeText) {
            resumeText.addEventListener('input', () => this.updateTextAreaCount(resumeText, 'resume'));
        }

        if (analyzeBtn) {
            analyzeBtn.addEventListener('click', () => this.analyzeKeywords());
        }

        if (clearBtn) {
            clearBtn.addEventListener('click', () => {
                if (jobDesc) jobDesc.value = '';
                if (resumeText) resumeText.value = '';
                this.updateTextAreaCount(jobDesc, 'jd');
                this.updateTextAreaCount(resumeText, 'resume');
                this.hideKeywordResults();
            });
        }

        if (sampleBtn) {
            sampleBtn.addEventListener('click', () => this.loadSampleKeywords());
        }
    }

    analyzeKeywords() {
        const jobDesc = document.getElementById('jobDescription')?.value || '';
        const resumeText = document.getElementById('resumeForKeywords')?.value || '';
        
        if (!jobDesc.trim() || !resumeText.trim()) {
            this.showToast('Please provide both job description and resume text', 'error');
            return;
        }

        this.showLoading('Analyzing keywords...');

        // Simulate analysis
        setTimeout(() => {
            this.hideLoading();
            this.showKeywordResults();
            
            // In a real implementation, this would call an API
            // For now, show sample results
            this.displaySampleKeywordResults();
        }, 1500);
    }

    displaySampleKeywordResults() {
        const missingKeywords = ['JavaScript', 'React', 'TypeScript', 'AWS', 'Microservices'];
        const matchedKeywords = ['Python', 'Node.js', 'Docker', 'Git', 'Agile'];
        const recommendedKeywords = ['GraphQL', 'Kubernetes', 'CI/CD', 'TDD', 'System Design'];
        
        this.updateKeywordList('missingKeywords', missingKeywords, 'missing');
        this.updateKeywordList('matchedKeywords', matchedKeywords, 'matched');
        this.updateKeywordList('recommendedKeywords', recommendedKeywords, 'recommended');
        
        document.getElementById('matchScore').textContent = '65%';
        
        const recommendations = `
            <ul>
                <li>Add 3-5 of the missing keywords to your resume</li>
                <li>Emphasize your experience with matched keywords</li>
                <li>Consider learning or gaining experience with recommended keywords</li>
                <li>Use exact keywords from the job description when applicable</li>
            </ul>
        `;
        document.getElementById('keywordRecommendations').innerHTML = recommendations;
    }

    updateKeywordList(elementId, keywords, type) {
        const container = document.getElementById(elementId);
        if (!container) return;
        
        const classMap = {
            'missing': 'keyword-missing',
            'matched': 'keyword-matched',
            'recommended': 'keyword-recommended'
        };
        
        container.innerHTML = keywords.map(keyword => 
            `<span class="keyword-tag ${classMap[type]}">${keyword}</span>`
        ).join('');
    }

    closeTool() {
        this.currentTool = null;
        
        // Show main tools grid
        const mainTools = document.querySelector('.main-tools');
        if (mainTools) mainTools.style.display = 'block';
        
        // Hide all tool interfaces
        document.querySelectorAll('.tool-interface').forEach(interface => {
            interface.style.display = 'none';
        });
        
        // Scroll to top
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    handleFileUpload(event) {
        const file = event.target.files[0];
        if (!file) return;
        
        // Check file type
        const validTypes = ['application/pdf', 'application/msword', 
                          'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                          'text/plain', 'application/rtf'];
        
        if (!validTypes.includes(file.type)) {
            this.showToast('Please upload a PDF, DOCX, TXT, or RTF file', 'error');
            return;
        }
        
        // Check file size (5MB max)
        if (file.size > 5 * 1024 * 1024) {
            this.showToast('File size must be less than 5MB', 'error');
            return;
        }
        
        this.showLoading('Processing file...');
        
        // Simulate file processing
        setTimeout(() => {
            this.hideLoading();
            this.showToast('File uploaded successfully', 'success');
            
            // Update UI to show file is ready
            const uploadArea = document.getElementById('uploadArea');
            if (uploadArea) {
                uploadArea.innerHTML = `
                    <i class="fas fa-check-circle" style="color: #10b981;"></i>
                    <h3>File Ready</h3>
                    <p>${file.name}</p>
                    <button class="btn-text" id="changeFile">Change File</button>
                `;
                
                // Add change file button listener
                const changeBtn = document.getElementById('changeFile');
                if (changeBtn) {
                    changeBtn.addEventListener('click', () => {
                        uploadArea.innerHTML = `
                            <i class="fas fa-cloud-upload-alt"></i>
                            <h3>Upload Your Resume</h3>
                            <p>Drag & drop your resume file or click to browse</p>
                            <p class="formats">Supported: PDF, DOCX, TXT, RTF</p>
                            <button class="btn-secondary" id="browseBtn">Browse Files</button>
                        `;
                        this.setupEventListeners(); // Re-attach listeners
                    });
                }
            }
        }, 1000);
    }

    analyzeResume() {
        const fileInput = document.getElementById('resumeUpload');
        const resumeText = document.getElementById('resumeText')?.value || '';
        
        if (!fileInput.files.length && !resumeText.trim()) {
            this.showToast('Please upload a file or paste resume text', 'error');
            return;
        }
        
        this.showLoading('Analyzing resume...');
        
        // Simulate analysis
        setTimeout(() => {
            this.hideLoading();
            this.showResults();
        }, 2000);
    }

    loadSampleResume() {
        const sampleText = `John Doe
Software Engineer
San Francisco, CA
john.doe@email.com | (415) 555-0123
linkedin.com/in/johndoe | github.com/johndoe

SUMMARY
Senior Software Engineer with 5+ years of experience building scalable web applications. 
Expert in JavaScript, React, and Node.js. Led migration from monolith to microservices 
architecture, reducing deployment time by 75%.

EXPERIENCE
Senior Software Engineer
TechCorp Inc., San Francisco, CA
March 2020 - Present
- Led team of 5 engineers in migration from monolith to microservices
- Improved system performance by 40% through code optimization
- Reduced deployment time from 2 hours to 15 minutes
- Implemented CI/CD pipeline using Jenkins and Docker

EDUCATION
Bachelor of Science in Computer Science
Stanford University, Stanford, CA
Graduated: May 2018
GPA: 3.8/4.0

SKILLS
Programming: JavaScript, Python, Java, TypeScript
Frameworks: React, Node.js, Express, Django
Tools: Git, Docker, AWS, Jenkins, MongoDB`;

        const textarea = document.getElementById('resumeText');
        if (textarea) {
            textarea.value = sampleText;
            this.updateWordCount();
        }
        
        this.showToast('Sample resume loaded', 'info');
    }

    updateWordCount() {
        const textarea = document.getElementById('resumeText');
        if (!textarea) return;
        
        const text = textarea.value;
        const wordCount = text.trim().split(/\s+/).filter(word => word.length > 0).length;
        const charCount = text.length;
        
        const wordCountEl = document.getElementById('wordCount');
        const charCountEl = document.getElementById('charCount');
        
        if (wordCountEl) wordCountEl.textContent = `${wordCount} words`;
        if (charCountEl) charCountEl.textContent = `${charCount} characters`;
    }

    updateTextAreaCount(textarea, prefix) {
        if (!textarea) return;
        
        const text = textarea.value;
        const wordCount = text.trim().split(/\s+/).filter(word => word.length > 0).length;
        const charCount = text.length;
        
        const wordCountEl = document.getElementById(`${prefix}WordCount`);
        const charCountEl = document.getElementById(`${prefix}CharCount`);
        
        if (wordCountEl) wordCountEl.textContent = `${wordCount} words`;
        if (charCountEl) charCountEl.textContent = `${charCount} characters`;
    }

    showResults() {
        const resultsArea = document.getElementById('resultsArea');
        if (resultsArea) {
            resultsArea.style.display = 'block';
            resultsArea.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }

    hideKeywordResults() {
        const resultsArea = document.getElementById('keywordResults');
        if (resultsArea) {
            resultsArea.style.display = 'none';
        }
    }

    showKeywordResults() {
        const resultsArea = document.getElementById('keywordResults');
        if (resultsArea) {
            resultsArea.style.display = 'block';
            resultsArea.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }

    showLoading(message = 'Processing...') {
        // Create or show loading overlay
        let loader = document.getElementById('toolLoader');
        if (!loader) {
            loader = document.createElement('div');
            loader.id = 'toolLoader';
            loader.className = 'tool-loader';
            loader.innerHTML = `
                <div class="loader-content">
                    <div class="spinner"></div>
                    <p>${message}</p>
                </div>
            `;
            document.body.appendChild(loader);
        }
        
        loader.style.display = 'flex';
    }

    hideLoading() {
        const loader = document.getElementById('toolLoader');
        if (loader) {
            loader.style.display = 'none';
        }
    }

    showToast(message, type = 'info') {
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.innerHTML = `
            <i class="fas fa-${type === 'success' ? 'check-circle' : 
                              type === 'error' ? 'exclamation-circle' : 
                              type === 'warning' ? 'exclamation-triangle' : 'info-circle'}"></i>
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

    saveToolState(toolId, state) {
        const currentState = this.toolStates.get(toolId) || {};
        this.toolStates.set(toolId, { ...currentState, ...state });
        
        try {
            localStorage.setItem('toolStates', JSON.stringify([...this.toolStates]));
        } catch (error) {
            console.error('Failed to save tool state:', error);
        }
    }

    loadToolStates() {
        try {
            const saved = localStorage.getItem('toolStates');
            if (saved) {
                this.toolStates = new Map(JSON.parse(saved));
            }
        } catch (error) {
            console.error('Failed to load tool states:', error);
        }
    }
}

// Initialize tools manager
document.addEventListener('DOMContentLoaded', () => {
    if (document.querySelector('.tools-page') || document.querySelector('.main-tools')) {
        window.toolsManager = new ToolsManager();
    }
});
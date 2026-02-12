/**
 * AI Suggestions for Resume Builder
 */

class AISuggestions {
    constructor() {
        this.apiEndpoint = '/api/ai/suggest';
        this.isProcessing = false;
        this.lastSuggestion = null;
        this.suggestionHistory = [];
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.setupAIButtons();
        this.loadSuggestionHistory();
    }

    setupEventListeners() {
        // AI suggestion buttons
        document.querySelectorAll('.ai-suggest-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const field = e.target.dataset.field;
                const section = e.target.dataset.section;
                this.getSuggestion(field, section);
            });
        });

        // Auto-suggest on focus
        document.querySelectorAll('[data-ai-suggest]').forEach(input => {
            input.addEventListener('focus', (e) => {
                if (e.target.value.trim() === '') {
                    this.showSuggestionHint(e.target);
                }
            });
        });

        // Accept/Reject buttons
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('accept-suggestion')) {
                this.acceptSuggestion(e.target.dataset.suggestionId);
            }
            if (e.target.classList.contains('reject-suggestion')) {
                this.rejectSuggestion(e.target.dataset.suggestionId);
            }
        });

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey && e.key === 'i') {
                e.preventDefault();
                this.quickSuggest();
            }
        });
    }

    setupAIButtons() {
        // Add AI buttons to form fields
        const aiFields = [
            { selector: '#personalTitle', section: 'personal', field: 'title' },
            { selector: '#personalSummary', section: 'personal', field: 'summary' },
            { selector: '.experience-item', section: 'experience', field: 'description' },
            { selector: '.skill-item', section: 'skills', field: 'description' }
        ];

        aiFields.forEach(config => {
            const elements = document.querySelectorAll(config.selector);
            elements.forEach(element => {
                if (!element.querySelector('.ai-button')) {
                    const aiBtn = this.createAIButton(config.section, config.field);
                    if (element.classList.contains('experience-item') || 
                        element.classList.contains('skill-item')) {
                        element.appendChild(aiBtn);
                    } else {
                        element.parentNode.insertBefore(aiBtn, element.nextSibling);
                    }
                }
            });
        });
    }

    createAIButton(section, field) {
        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'ai-button';
        button.innerHTML = '<i class="fas fa-magic"></i> AI Suggest';
        button.dataset.section = section;
        button.dataset.field = field;
        button.addEventListener('click', (e) => {
            e.stopPropagation();
            this.getSuggestion(field, section, e.target);
        });
        return button;
    }

    async getSuggestion(field, section, targetElement = null) {
        if (this.isProcessing) return;
        
        try {
            this.isProcessing = true;
            this.showLoader(targetElement);
            
            const context = this.getFieldContext(field, section);
            const currentValue = this.getCurrentValue(field, section);
            
            const response = await fetch(this.apiEndpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    section,
                    field,
                    content: currentValue,
                    context,
                    type: 'improve'
                })
            });
            
            if (!response.ok) throw new Error('API request failed');
            
            const data = await response.json();
            
            if (data.success && data.data) {
                this.displaySuggestion(data.data, field, section, targetElement);
                this.saveToHistory(data.data, field, section);
            } else {
                throw new Error('No suggestions received');
            }
            
        } catch (error) {
            console.error('AI Suggestion error:', error);
            this.showError('Failed to get AI suggestion. Please try again.');
        } finally {
            this.isProcessing = false;
            this.hideLoader();
        }
    }

    getFieldContext(field, section) {
        const context = { section, field };
        
        // Get additional context based on section
        switch(section) {
            case 'experience':
                const expItem = document.querySelector('.experience-item.active');
                if (expItem) {
                    context.title = expItem.querySelector('.job-title')?.value;
                    context.company = expItem.querySelector('.company-name')?.value;
                }
                break;
                
            case 'skills':
                const skillItem = document.querySelector('.skill-item.active');
                if (skillItem) {
                    context.skill = skillItem.querySelector('.skill-name')?.value;
                    context.level = skillItem.querySelector('.skill-level')?.value;
                }
                break;
                
            case 'personal':
                const personalData = this.collectPersonalData();
                context.personal = personalData;
                break;
        }
        
        return context;
    }

    getCurrentValue(field, section) {
        // Get current value from form
        const element = document.querySelector(`[data-field="${field}"]`) || 
                       document.querySelector(`[data-section="${section}"] [data-field="${field}"]`);
        
        return element ? element.value || element.textContent : '';
    }

    collectPersonalData() {
        const data = {};
        document.querySelectorAll('[data-field]').forEach(input => {
            const field = input.dataset.field;
            data[field] = input.value || input.textContent;
        });
        return data;
    }

    displaySuggestion(suggestion, field, section, targetElement) {
        // Create suggestion popup
        const popup = document.createElement('div');
        popup.className = 'ai-suggestion-popup';
        popup.dataset.suggestionId = Date.now();
        
        const suggestionId = popup.dataset.suggestionId;
        this.lastSuggestion = { id: suggestionId, suggestion, field, section };
        
        popup.innerHTML = `
            <div class="suggestion-header">
                <h4><i class="fas fa-robot"></i> AI Suggestion</h4>
                <button class="close-suggestion">&times;</button>
            </div>
            <div class="suggestion-content">
                <p>${this.formatSuggestion(suggestion)}</p>
            </div>
            <div class="suggestion-actions">
                <button class="btn-secondary reject-suggestion" data-suggestion-id="${suggestionId}">
                    <i class="fas fa-times"></i> Ignore
                </button>
                <button class="btn-primary accept-suggestion" data-suggestion-id="${suggestionId}">
                    <i class="fas fa-check"></i> Use This
                </button>
                <button class="btn-text refine-suggestion" data-suggestion-id="${suggestionId}">
                    <i class="fas fa-redo"></i> Refine
                </button>
            </div>
        `;
        
        // Position popup near target element
        if (targetElement) {
            const rect = targetElement.getBoundingClientRect();
            popup.style.position = 'absolute';
            popup.style.top = `${rect.bottom + 10}px`;
            popup.style.left = `${rect.left}px`;
            targetElement.appendChild(popup);
        } else {
            // Show as modal
            popup.classList.add('modal-suggestion');
            document.body.appendChild(popup);
        }
        
        // Add event listeners
        const closeBtn = popup.querySelector('.close-suggestion');
        const refineBtn = popup.querySelector('.refine-suggestion');
        
        closeBtn.addEventListener('click', () => popup.remove());
        refineBtn.addEventListener('click', () => this.refineSuggestion(suggestionId));
        
        // Auto-close on outside click
        setTimeout(() => {
            document.addEventListener('click', (e) => {
                if (!popup.contains(e.target) && e.target !== targetElement) {
                    popup.remove();
                }
            });
        }, 100);
    }

    formatSuggestion(suggestion) {
        if (typeof suggestion === 'string') return suggestion;
        if (Array.isArray(suggestion)) {
            return suggestion.map(item => 
                typeof item === 'string' ? item : JSON.stringify(item)
            ).join('<br>');
        }
        return JSON.stringify(suggestion, null, 2);
    }

    acceptSuggestion(suggestionId) {
        if (!this.lastSuggestion || this.lastSuggestion.id.toString() !== suggestionId) {
            console.error('Suggestion not found');
            return;
        }
        
        const { suggestion, field, section } = this.lastSuggestion;
        
        // Find target element
        const targetElement = document.querySelector(`[data-field="${field}"]`) || 
                            document.querySelector(`[data-section="${section}"] [data-field="${field}"]`);
        
        if (targetElement) {
            if (targetElement.tagName === 'INPUT' || targetElement.tagName === 'TEXTAREA') {
                targetElement.value = suggestion;
            } else {
                targetElement.textContent = suggestion;
            }
            
            // Trigger change event
            targetElement.dispatchEvent(new Event('input', { bubbles: true }));
            targetElement.dispatchEvent(new Event('change', { bubbles: true }));
            
            this.showSuccess('Suggestion applied!');
        }
        
        // Close popup
        document.querySelector(`[data-suggestion-id="${suggestionId}"]`)?.remove();
        this.lastSuggestion = null;
    }

    rejectSuggestion(suggestionId) {
        document.querySelector(`[data-suggestion-id="${suggestionId}"]`)?.remove();
        this.lastSuggestion = null;
    }

    async refineSuggestion(suggestionId) {
        if (!this.lastSuggestion) return;
        
        const { suggestion, field, section } = this.lastSuggestion;
        
        // Ask for refinement prompt
        const prompt = prompt('How would you like to refine this suggestion?', 
                            'Make it more professional');
        
        if (!prompt) return;
        
        try {
            this.showLoader();
            
            const response = await fetch('/api/ai/generate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    prompt: `${prompt}: ${suggestion}`,
                    section,
                    field,
                    type: 'refine'
                })
            });
            
            if (!response.ok) throw new Error('Refinement failed');
            
            const data = await response.json();
            
            if (data.success && data.data) {
                // Update suggestion display
                const suggestionContent = document.querySelector(
                    `[data-suggestion-id="${suggestionId}"] .suggestion-content`
                );
                if (suggestionContent) {
                    suggestionContent.innerHTML = `<p>${this.formatSuggestion(data.data)}</p>`;
                    this.lastSuggestion.suggestion = data.data;
                }
            }
            
        } catch (error) {
            console.error('Refinement error:', error);
            this.showError('Failed to refine suggestion');
        } finally {
            this.hideLoader();
        }
    }

    async quickSuggest() {
        // Get focused element
        const focused = document.activeElement;
        if (!focused) return;
        
        const field = focused.dataset.field;
        const section = focused.closest('[data-section]')?.dataset.section || 'general';
        
        if (field) {
            this.getSuggestion(field, section, focused);
        }
    }

    showSuggestionHint(element) {
        const hint = document.createElement('div');
        hint.className = 'ai-hint';
        hint.innerHTML = `
            <i class="fas fa-lightbulb"></i>
            <span>Press Ctrl+I for AI suggestions</span>
        `;
        
        element.parentNode.appendChild(hint);
        
        setTimeout(() => {
            hint.classList.add('show');
        }, 100);
        
        setTimeout(() => {
            hint.classList.remove('show');
            setTimeout(() => hint.remove(), 300);
        }, 3000);
    }

    showLoader(targetElement = null) {
        const loader = document.createElement('div');
        loader.className = 'ai-loader';
        loader.innerHTML = '<i class="fas fa-spinner fa-spin"></i> AI is thinking...';
        
        if (targetElement) {
            targetElement.appendChild(loader);
        } else {
            loader.classList.add('global-loader');
            document.body.appendChild(loader);
        }
        
        this.currentLoader = loader;
    }

    hideLoader() {
        if (this.currentLoader) {
            this.currentLoader.remove();
            this.currentLoader = null;
        }
    }

    saveToHistory(suggestion, field, section) {
        const historyItem = {
            id: Date.now(),
            timestamp: new Date().toISOString(),
            suggestion,
            field,
            section,
            accepted: false
        };
        
        this.suggestionHistory.unshift(historyItem);
        
        // Keep only last 50 items
        if (this.suggestionHistory.length > 50) {
            this.suggestionHistory.pop();
        }
        
        this.saveHistoryToStorage();
    }

    loadSuggestionHistory() {
        try {
            const saved = localStorage.getItem('aiSuggestionHistory');
            if (saved) {
                this.suggestionHistory = JSON.parse(saved);
            }
        } catch (error) {
            console.error('Failed to load suggestion history:', error);
            this.suggestionHistory = [];
        }
    }

    saveHistoryToStorage() {
        try {
            localStorage.setItem('aiSuggestionHistory', 
                JSON.stringify(this.suggestionHistory.slice(0, 50)));
        } catch (error) {
            console.error('Failed to save suggestion history:', error);
        }
    }

    showSuccess(message) {
        this.showToast(message, 'success');
    }

    showError(message) {
        this.showToast(message, 'error');
    }

    showToast(message, type = 'info') {
        const toast = document.createElement('div');
        toast.className = `ai-toast ai-toast-${type}`;
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

    // Batch suggestions for entire resume
    async analyzeEntireResume() {
        const resumeData = this.collectResumeData();
        
        try {
            this.showLoader();
            
            const response = await fetch('/api/ai/analyze', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    resumeText: JSON.stringify(resumeData),
                    type: 'full-analysis'
                })
            });
            
            if (!response.ok) throw new Error('Analysis failed');
            
            const data = await response.json();
            
            if (data.success && data.data) {
                this.displayAnalysisResults(data.data);
            }
            
        } catch (error) {
            console.error('Resume analysis error:', error);
            this.showError('Failed to analyze resume');
        } finally {
            this.hideLoader();
        }
    }

    collectResumeData() {
        // Collect all resume data for analysis
        const data = {
            personal: this.collectPersonalData(),
            sections: {}
        };
        
        // Collect other sections...
        
        return data;
    }

    displayAnalysisResults(results) {
        // Create analysis modal
        const modal = document.createElement('div');
        modal.className = 'ai-analysis-modal';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h2><i class="fas fa-chart-line"></i> Resume Analysis</h2>
                    <button class="close-modal">&times;</button>
                </div>
                <div class="modal-body">
                    <div class="analysis-results">
                        ${this.formatAnalysisResults(results)}
                    </div>
                    <div class="analysis-actions">
                        <button class="btn-primary apply-suggestions">
                            <i class="fas fa-check-double"></i> Apply All Suggestions
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Add event listeners
        const closeBtn = modal.querySelector('.close-modal');
        const applyBtn = modal.querySelector('.apply-suggestions');
        
        closeBtn.addEventListener('click', () => modal.remove());
        applyBtn.addEventListener('click', () => this.applyAllSuggestions(results));
        
        // Close on ESC and outside click
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') modal.remove();
        });
        
        modal.addEventListener('click', (e) => {
            if (e.target === modal) modal.remove();
        });
    }

    formatAnalysisResults(results) {
        if (typeof results === 'string') return `<p>${results}</p>`;
        
        let html = '';
        
        if (results.suggestions) {
            html += '<div class="suggestions-list">';
            results.suggestions.forEach((suggestion, index) => {
                html += `
                    <div class="suggestion-item">
                        <h4>Suggestion ${index + 1}</h4>
                        <p>${suggestion}</p>
                    </div>
                `;
            });
            html += '</div>';
        }
        
        if (results.score) {
            html += `
                <div class="score-display">
                    <h3>Resume Score: ${results.score}/100</h3>
                    <div class="score-bar">
                        <div class="score-fill" style="width: ${results.score}%"></div>
                    </div>
                </div>
            `;
        }
        
        return html;
    }

    applyAllSuggestions(results) {
        // Apply suggestions from analysis
        console.log('Applying all suggestions:', results);
        this.showSuccess('Suggestions applied!');
    }
}

// Initialize AI suggestions
document.addEventListener('DOMContentLoaded', () => {
    if (document.querySelector('.builder-container') || document.querySelector('.ai-suggest-btn')) {
        window.aiSuggestions = new AISuggestions();
    }
});
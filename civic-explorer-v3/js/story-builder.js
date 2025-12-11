/**
 * Story Builder Module - Enhanced with Raw Data Processing
 * Handles user-created scenarios with automatic data analysis
 */

const StoryBuilder = {
    maxScenarios: 10,
    userScenarios: [],
    currentRawData: null,
    currentAnalysis: null,
    
    init() {
        this.loadFromStorage();
        this.setupForm();
        this.setupFileUpload();
        this.setupIconSelector();
        this.renderUserScenarios();
        this.updateScenarioCount();
    },
    
    loadFromStorage() {
        try {
            const saved = localStorage.getItem('civic_user_scenarios');
            if (saved) {
                this.userScenarios = JSON.parse(saved);
            }
        } catch (e) {
            console.warn('Could not load scenarios from storage:', e);
            this.userScenarios = [];
        }
    },
    
    saveToStorage() {
        try {
            localStorage.setItem('civic_user_scenarios', JSON.stringify(this.userScenarios));
        } catch (e) {
            console.warn('Could not save scenarios to storage:', e);
        }
    },
    
    setupForm() {
        const form = document.getElementById('storyBuilderForm');
        if (!form) return;
        
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            this.createScenario();
        });
    },
    
    setupIconSelector() {
        const container = document.getElementById('iconSelector');
        if (!container) return;
        
        const icons = ['📊', '🏫', '🏥', '🗳️', '🚌', '🏠', '👴', '👶', '🌳', '🚒', 
                       '📚', '🍽️', '💼', '🎓', '⚡', '💧', '🛣️', '✈️', '🏛️', '🌾'];
        
        icons.forEach(icon => {
            const btn = document.createElement('button');
            btn.type = 'button';
            btn.className = 'icon-option';
            btn.textContent = icon;
            btn.onclick = () => {
                container.querySelectorAll('.icon-option').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                document.getElementById('storyIcon').value = icon;
            };
            container.appendChild(btn);
        });
        
        container.querySelector('.icon-option')?.classList.add('active');
    },
    
    setupFileUpload() {
        const uploadArea = document.getElementById('csvUploadArea');
        const fileInput = document.getElementById('csvFileInput');
        
        if (!uploadArea || !fileInput) return;
        
        uploadArea.addEventListener('click', () => fileInput.click());
        
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
            const file = e.dataTransfer.files[0];
            if (file) this.handleFileUpload(file);
        });
        
        fileInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) this.handleFileUpload(file);
        });
    },
    
    handleFileUpload(file) {
        if (!file.name.endsWith('.csv')) {
            this.showNotification('Please upload a CSV file', 'error');
            return;
        }
        
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const csvContent = e.target.result;
                this.processRawData(csvContent, file.name);
            } catch (err) {
                this.showNotification('Error reading file: ' + err.message, 'error');
            }
        };
        reader.readAsText(file);
    },
    
    processRawData(csvContent, fileName) {
        try {
            const { headers, data } = DataProcessor.parseCSV(csvContent);
            
            if (data.length === 0) {
                this.showNotification('No data found in CSV', 'error');
                return;
            }
            
            const format = DataProcessor.detectFormat(headers);
            const formatInfo = DataProcessor.formats[format];
            
            this.currentRawData = { headers, data, format, fileName };
            
            this.showDataPreview(headers, data, format, formatInfo);
            this.showFileInfo(fileName, data.length, format);
            this.showNotification(`Loaded ${data.length} records (${formatInfo.name})`, 'success');
            
        } catch (err) {
            this.showNotification('Error parsing CSV: ' + err.message, 'error');
        }
    },
    
    showFileInfo(fileName, rowCount, format) {
        const uploadArea = document.getElementById('csvUploadArea');
        const fileInfo = document.getElementById('csvFileInfo');
        const fileNameEl = document.getElementById('csvFileName');
        
        if (uploadArea) uploadArea.style.display = 'none';
        if (fileInfo) {
            fileInfo.style.display = 'flex';
            if (fileNameEl) fileNameEl.textContent = `${fileName} (${rowCount} rows, ${format})`;
        }
    },
    
    showDataPreview(headers, data, format, formatInfo) {
        let preview = document.getElementById('dataPreviewSection');
        if (!preview) {
            preview = document.createElement('div');
            preview.id = 'dataPreviewSection';
            preview.className = 'data-preview-section';
            
            const form = document.getElementById('storyBuilderForm');
            if (form) {
                form.insertBefore(preview, form.querySelector('.form-actions'));
            }
        }
        
        preview.innerHTML = `
            <div class="preview-header">
                <h4>📋 Data Preview & Configuration</h4>
                <span class="format-badge">${formatInfo.name}</span>
            </div>
            
            <div class="preview-table-wrapper">
                <table class="preview-table">
                    <thead>
                        <tr>${headers.map(h => `<th>${h}</th>`).join('')}</tr>
                    </thead>
                    <tbody>
                        ${data.slice(0, 5).map(row => `
                            <tr>${headers.map(h => `<td>${row[h] || ''}</td>`).join('')}</tr>
                        `).join('')}
                        ${data.length > 5 ? `<tr><td colspan="${headers.length}" class="more-rows">... and ${data.length - 5} more rows</td></tr>` : ''}
                    </tbody>
                </table>
            </div>
            
            <div class="analysis-config">
                <h5>⚙️ Analysis Configuration</h5>
                <div class="config-grid">
                    <div class="config-group">
                        <label>Group By (optional)</label>
                        <select id="configGroupBy">
                            <option value="">No grouping (total count)</option>
                            ${headers.map(h => `<option value="${h}">${h}</option>`).join('')}
                        </select>
                        <span class="config-hint">Aggregate counts by this field</span>
                    </div>
                    
                    <div class="config-group">
                        <label>Filter Field (optional)</label>
                        <select id="configFilterField">
                            <option value="">No filter</option>
                            ${headers.map(h => `<option value="${h}">${h}</option>`).join('')}
                        </select>
                    </div>
                    
                    <div class="config-group">
                        <label>Filter Value</label>
                        <input type="text" id="configFilterValue" placeholder="e.g., yes, district_A">
                        <span class="config-hint">Only count records matching this value</span>
                    </div>
                    
                    <div class="config-group">
                        <label>Decision Threshold *</label>
                        <input type="number" id="configThreshold" placeholder="e.g., 1200" required>
                        <span class="config-hint">Minimum count for approval</span>
                    </div>
                    
                    <div class="config-group">
                        <label>Sensitivity</label>
                        <input type="number" id="configSensitivity" value="1" min="1">
                        <span class="config-hint">Max change from one record (usually 1)</span>
                    </div>
                    
                    <div class="config-group">
                        <label>Simulations per ε</label>
                        <input type="number" id="configSamples" value="100" min="10" max="1000">
                        <span class="config-hint">More = accurate but slower</span>
                    </div>
                </div>
                
                <button type="button" class="btn btn-secondary" onclick="StoryBuilder.runAnalysis()">
                    🔬 Run DP Analysis
                </button>
            </div>
            
            <div id="analysisResults" class="analysis-results" style="display: none;"></div>
        `;
    },
    
    runAnalysis() {
        if (!this.currentRawData) {
            this.showNotification('Please upload data first', 'error');
            return;
        }
        
        const threshold = parseInt(document.getElementById('configThreshold')?.value);
        if (!threshold || threshold <= 0) {
            this.showNotification('Please enter a valid threshold', 'error');
            return;
        }
        
        const config = {
            groupByField: document.getElementById('configGroupBy')?.value || null,
            filterField: document.getElementById('configFilterField')?.value || null,
            filterValue: document.getElementById('configFilterValue')?.value || null,
            threshold: threshold,
            sensitivity: parseInt(document.getElementById('configSensitivity')?.value) || 1,
            samplesPerEpsilon: parseInt(document.getElementById('configSamples')?.value) || 100,
            epsilonValues: [0.5, 1.0, 1.5, 2.0, 3.0, 4.0, 5.0]
        };
        
        this.showNotification('Running analysis...', 'info');
        
        setTimeout(() => {
            try {
                const results = DataProcessor.runAnalysis(this.currentRawData.data, config);
                const stats = DataProcessor.calculateStats(results);
                const report = DataProcessor.generateReport(this.currentRawData.data, config, stats);
                
                this.currentAnalysis = { results, stats, report, config };
                
                this.displayAnalysisResults(stats, report);
                this.autoFillForm(stats, report);
                this.showNotification('Analysis complete!', 'success');
                
            } catch (err) {
                this.showNotification('Analysis error: ' + err.message, 'error');
            }
        }, 100);
    },
    
    displayAnalysisResults(stats, report) {
        const container = document.getElementById('analysisResults');
        if (!container) return;
        
        container.style.display = 'block';
        container.innerHTML = `
            <h5>📊 Analysis Results</h5>
            
            <div class="results-summary">
                <div class="summary-stat">
                    <span class="stat-label">Records</span>
                    <span class="stat-value">${report.summary.total_records.toLocaleString()}</span>
                </div>
                <div class="summary-stat">
                    <span class="stat-label">True Count</span>
                    <span class="stat-value gold">${report.summary.true_count.toLocaleString()}</span>
                </div>
                <div class="summary-stat">
                    <span class="stat-label">Threshold</span>
                    <span class="stat-value">${report.summary.threshold.toLocaleString()}</span>
                </div>
                <div class="summary-stat">
                    <span class="stat-label">Margin</span>
                    <span class="stat-value ${parseFloat(report.summary.margin_from_threshold) >= 0 ? 'teal' : 'coral'}">${report.summary.margin_from_threshold}</span>
                </div>
                <div class="summary-stat">
                    <span class="stat-label">True Decision</span>
                    <span class="stat-value ${report.summary.true_decision === 'APPROVED' ? 'teal' : 'coral'}">${report.summary.true_decision}</span>
                </div>
            </div>
            
            <div class="risk-table">
                <h6>Risk by Privacy Level</h6>
                <table>
                    <thead>
                        <tr><th>ε</th><th>Flip Risk</th><th>Risk Level</th><th>Confidence</th></tr>
                    </thead>
                    <tbody>
                        ${stats.map(s => `
                            <tr>
                                <td>${s.epsilon}</td>
                                <td>${s.flip_probability}%</td>
                                <td><span class="risk-badge risk-${s.flip_probability > 30 ? 'high' : s.flip_probability > 15 ? 'medium' : 'low'}">${s.flip_probability > 30 ? 'HIGH' : s.flip_probability > 15 ? 'MEDIUM' : 'LOW'}</span></td>
                                <td>${s.confidence}%</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
            
            <div class="recommendation-box recommendation-${report.recommendation.status.toLowerCase()}">
                <div class="recommendation-status">${report.recommendation.status}</div>
                <p>${report.recommendation.message}</p>
                <p class="recommendation-epsilon">${report.recommendation.suggested_epsilon}</p>
            </div>
            
            <div class="export-buttons">
                <button type="button" class="btn btn-ghost btn-sm" onclick="StoryBuilder.downloadResults('csv')">📥 Download CSV</button>
                <button type="button" class="btn btn-ghost btn-sm" onclick="StoryBuilder.downloadResults('json')">📥 Download JSON</button>
            </div>
        `;
    },
    
    autoFillForm(stats, report) {
        const trueValueInput = document.getElementById('storyTrueValue');
        const thresholdInput = document.getElementById('storyThreshold');
        const sensitivityInput = document.getElementById('storySensitivity');
        
        if (trueValueInput && !trueValueInput.value) {
            trueValueInput.value = report.summary.true_count;
        }
        if (thresholdInput && !thresholdInput.value) {
            thresholdInput.value = report.summary.threshold;
        }
        if (sensitivityInput && this.currentAnalysis?.config?.sensitivity) {
            sensitivityInput.value = this.currentAnalysis.config.sensitivity;
        }
    },
    
    downloadResults(format) {
        if (!this.currentAnalysis) {
            this.showNotification('No analysis results to download', 'error');
            return;
        }
        
        let content, filename, type;
        
        if (format === 'csv') {
            content = DataProcessor.toCSV(this.currentAnalysis.results);
            filename = 'dp_analysis_results.csv';
            type = 'text/csv';
        } else {
            content = JSON.stringify({
                stats: this.currentAnalysis.stats,
                report: this.currentAnalysis.report,
                config: this.currentAnalysis.config
            }, null, 2);
            filename = 'dp_analysis_results.json';
            type = 'application/json';
        }
        
        const blob = new Blob([content], { type });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.click();
        URL.revokeObjectURL(url);
        
        this.showNotification(`Downloaded ${filename}`, 'success');
    },
    
    createScenario() {
        if (this.userScenarios.length >= this.maxScenarios) {
            this.showNotification(`Maximum ${this.maxScenarios} scenarios allowed`, 'error');
            return;
        }
        
        const name = document.getElementById('storyName')?.value?.trim();
        const trueValue = parseInt(document.getElementById('storyTrueValue')?.value);
        const threshold = parseInt(document.getElementById('storyThreshold')?.value);
        
        if (!name || !trueValue || !threshold) {
            this.showNotification('Please fill in required fields', 'error');
            return;
        }
        
        const scenario = {
            id: 'user_' + Date.now(),
            icon: document.getElementById('storyIcon')?.value || '📊',
            title: name,
            description: document.getElementById('storyDescription')?.value || '',
            trueValue: trueValue,
            threshold: threshold,
            sensitivity: parseInt(document.getElementById('storySensitivity')?.value) || 1,
            category: document.getElementById('storyCategory')?.value || 'custom',
            stakes: document.getElementById('storyStakes')?.value || '',
            createdAt: new Date().toISOString(),
            analysis: this.currentAnalysis ? { stats: this.currentAnalysis.stats, report: this.currentAnalysis.report } : null,
            rawDataInfo: this.currentRawData ? { fileName: this.currentRawData.fileName, recordCount: this.currentRawData.data.length, format: this.currentRawData.format } : null
        };
        
        this.userScenarios.push(scenario);
        this.saveToStorage();
        this.renderUserScenarios();
        this.updateScenarioCount();
        this.resetForm();
        
        this.showNotification('Scenario created successfully!', 'success');
    },
    
    deleteScenario(id) {
        if (!confirm('Delete this scenario?')) return;
        
        this.userScenarios = this.userScenarios.filter(s => s.id !== id);
        this.saveToStorage();
        this.renderUserScenarios();
        this.updateScenarioCount();
        
        this.showNotification('Scenario deleted', 'info');
    },
    
    renderUserScenarios() {
        const grid = document.getElementById('userStoriesGrid');
        if (!grid) return;
        
        if (this.userScenarios.length === 0) {
            grid.innerHTML = `
                <div class="empty-stories">
                    <div class="empty-stories-icon">📝</div>
                    <p>No custom scenarios yet. Upload raw data and create your first one above!</p>
                </div>
            `;
            return;
        }
        
        grid.innerHTML = this.userScenarios.map(scenario => `
            <div class="user-story-card" data-id="${scenario.id}">
                <div class="story-card-header">
                    <span class="story-icon">${scenario.icon}</span>
                    <h4>${scenario.title}</h4>
                    <button class="story-delete-btn" onclick="StoryBuilder.deleteScenario('${scenario.id}')" title="Delete">×</button>
                </div>
                ${scenario.description ? `<p class="story-description">${scenario.description}</p>` : ''}
                <div class="story-stats">
                    <div class="story-stat"><span class="label">True Value</span><span class="value">${scenario.trueValue.toLocaleString()}</span></div>
                    <div class="story-stat"><span class="label">Threshold</span><span class="value">${scenario.threshold.toLocaleString()}</span></div>
                    ${scenario.stakes ? `<div class="story-stat"><span class="label">Stakes</span><span class="value">${scenario.stakes}</span></div>` : ''}
                </div>
                ${scenario.rawDataInfo ? `<div class="story-data-info">📄 ${scenario.rawDataInfo.fileName} (${scenario.rawDataInfo.recordCount} records)</div>` : ''}
                ${scenario.analysis ? `<div class="story-analysis-badge"><span class="badge badge--${scenario.analysis.report.recommendation.status.toLowerCase()}">${scenario.analysis.report.recommendation.status}</span></div>` : ''}
                <button class="btn btn-ghost btn-sm" onclick="StoryBuilder.loadScenario('${scenario.id}')" style="width: 100%; margin-top: 12px;">Load in Simulator →</button>
            </div>
        `).join('');
    },
    
    loadScenario(id) {
        const scenario = this.userScenarios.find(s => s.id === id);
        if (!scenario) return;
        
        if (!window.scenarios) window.scenarios = {};
        window.scenarios[scenario.id] = {
            id: scenario.id,
            icon: scenario.icon,
            title: scenario.title,
            subtitle: scenario.description || 'Custom scenario',
            trueValue: scenario.trueValue,
            threshold: scenario.threshold,
            sensitivity: scenario.sensitivity,
            scale: 1,
            stakes: scenario.stakes,
            context: `Custom scenario: ${scenario.title}. Threshold is ${scenario.threshold.toLocaleString()}.`
        };
        
        if (typeof switchMode === 'function') switchMode('single');
        if (typeof selectScenario === 'function') selectScenario(scenario.id);
        
        this.showNotification(`Loaded "${scenario.title}" into simulator`, 'success');
    },
    
    resetForm() {
        const form = document.getElementById('storyBuilderForm');
        if (form) form.reset();
        
        const uploadArea = document.getElementById('csvUploadArea');
        const fileInfo = document.getElementById('csvFileInfo');
        if (uploadArea) uploadArea.style.display = 'flex';
        if (fileInfo) fileInfo.style.display = 'none';
        
        const preview = document.getElementById('dataPreviewSection');
        if (preview) preview.remove();
        
        this.currentRawData = null;
        this.currentAnalysis = null;
        
        const iconSelector = document.getElementById('iconSelector');
        if (iconSelector) {
            iconSelector.querySelectorAll('.icon-option').forEach((btn, i) => {
                btn.classList.toggle('active', i === 0);
            });
        }
    },
    
    updateScenarioCount() {
        const badge = document.getElementById('storyCountBadge');
        if (badge) badge.textContent = `${this.userScenarios.length}/${this.maxScenarios} scenarios`;
    },
    
    showNotification(message, type = 'info') {
        document.querySelectorAll('.story-notification').forEach(n => n.remove());
        
        const notification = document.createElement('div');
        notification.className = `story-notification notification-${type}`;
        notification.innerHTML = `
            <span class="notification-icon">${type === 'success' ? '✓' : type === 'error' ? '✕' : 'ℹ'}</span>
            <span class="notification-message">${message}</span>
        `;
        
        document.body.appendChild(notification);
        setTimeout(() => notification.classList.add('show'), 10);
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }
};

function removeCsvFile() { StoryBuilder.resetForm(); }

document.addEventListener('DOMContentLoaded', () => { StoryBuilder.init(); });

window.StoryBuilder = StoryBuilder;

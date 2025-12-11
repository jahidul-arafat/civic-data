/**
 * ============================================
 * STORY BUILDER MODULE
 * User-Created Custom Scenarios with CSV Support
 * ============================================
 */

// ============================================
// DEFAULT SCENARIO TEMPLATES
// ============================================

const defaultScenarioTemplates = [
    { icon: '🎓', name: 'College Funding', category: 'funding' },
    { icon: '🚌', name: 'Bus Route Planning', category: 'infrastructure' },
    { icon: '📚', name: 'Library Services', category: 'funding' },
    { icon: '🏠', name: 'Housing Assistance', category: 'welfare' },
    { icon: '🌳', name: 'Park Development', category: 'infrastructure' },
    { icon: '💊', name: 'Pharmacy Placement', category: 'health' },
    { icon: '🚒', name: 'Fire Station Location', category: 'safety' },
    { icon: '👶', name: 'Daycare Subsidy', category: 'welfare' },
    { icon: '🏛️', name: 'Voting Precinct', category: 'democracy' },
    { icon: '💼', name: 'Job Training Grants', category: 'funding' }
];

// ============================================
// CSV SCHEMA DEFINITION
// ============================================

/*
 * Expected CSV Schema for user-uploaded data:
 * 
 * Columns:
 * - epsilon: Privacy parameter value (float, 0.1-5.0)
 * - true_value: Ground truth population/count (integer)
 * - noisy_value: DP-protected published value (integer)
 * - threshold: Decision threshold (integer)
 * - decision: Outcome ("approved" or "denied")
 * - flip_flag: Whether decision differs from truth (0 or 1)
 * - community_id: Identifier for the community (string)
 * 
 * Sample rows:
 * epsilon,true_value,noisy_value,threshold,decision,flip_flag,community_id
 * 0.5,1247,1189,1200,denied,1,district_001
 * 0.5,1247,1278,1200,approved,0,district_001
 * 1.0,1247,1231,1200,approved,0,district_001
 * ...
 */

// ============================================
// STORY BUILDER INITIALIZATION
// ============================================

function initStoryBuilder() {
    // Form submission
    const form = document.getElementById('storyBuilderForm');
    if (form) {
        form.addEventListener('submit', handleStorySubmit);
    }
    
    // CSV upload
    const csvUpload = document.getElementById('csvUploadArea');
    if (csvUpload) {
        csvUpload.addEventListener('click', () => {
            document.getElementById('csvFileInput').click();
        });
        
        csvUpload.addEventListener('dragover', (e) => {
            e.preventDefault();
            csvUpload.classList.add('dragover');
        });
        
        csvUpload.addEventListener('dragleave', () => {
            csvUpload.classList.remove('dragover');
        });
        
        csvUpload.addEventListener('drop', handleCsvDrop);
    }
    
    const csvInput = document.getElementById('csvFileInput');
    if (csvInput) {
        csvInput.addEventListener('change', handleCsvSelect);
    }
    
    // Icon selector
    initIconSelector();
    
    // Category selector
    initCategorySelector();
}

// ============================================
// STORY FORM HANDLING
// ============================================

function handleStorySubmit(e) {
    e.preventDefault();
    
    const formData = {
        id: 'user_' + Date.now(),
        icon: document.getElementById('storyIcon').value || '📊',
        title: document.getElementById('storyName').value,
        description: document.getElementById('storyDescription').value,
        trueValue: parseInt(document.getElementById('storyTrueValue').value),
        threshold: parseInt(document.getElementById('storyThreshold').value),
        sensitivity: parseFloat(document.getElementById('storySensitivity').value) || 1,
        scale: 1,
        stakes: document.getElementById('storyCategory').value,
        stakesLabel: document.getElementById('storyCategory').options[document.getElementById('storyCategory').selectedIndex].text,
        stakesAmount: document.getElementById('storyStakes').value,
        context: document.getElementById('storyDescription').value,
        aboveOutcome: 'APPROVED — Threshold met',
        belowOutcome: 'DENIED — Below threshold',
        csvData: AppState.pendingCsvData || null,
        createdAt: new Date().toISOString()
    };
    
    // Validate
    if (!formData.title || !formData.trueValue || !formData.threshold) {
        alert('Please fill in all required fields');
        return;
    }
    
    // Check max scenarios
    if (AppState.userScenarios.length >= 10) {
        alert('Maximum 10 custom scenarios allowed. Please delete one first.');
        return;
    }
    
    // Add to user scenarios
    AppState.userScenarios.push(formData);
    saveUserScenarios();
    renderUserScenarios();
    
    // Reset form
    e.target.reset();
    AppState.pendingCsvData = null;
    updateCsvUploadUI(null);
    
    // Show success
    showNotification('Scenario created successfully!', 'success');
}

// ============================================
// CSV HANDLING
// ============================================

function handleCsvDrop(e) {
    e.preventDefault();
    e.target.classList.remove('dragover');
    
    const file = e.dataTransfer.files[0];
    if (file && file.name.endsWith('.csv')) {
        processCsvFile(file);
    }
}

function handleCsvSelect(e) {
    const file = e.target.files[0];
    if (file) {
        processCsvFile(file);
    }
}

function processCsvFile(file) {
    const reader = new FileReader();
    
    reader.onload = function(e) {
        try {
            const csvData = parseCsv(e.target.result);
            AppState.pendingCsvData = csvData;
            updateCsvUploadUI(file.name);
            showNotification(`Loaded ${csvData.length} rows from CSV`, 'success');
        } catch (err) {
            showNotification('Error parsing CSV: ' + err.message, 'error');
        }
    };
    
    reader.readAsText(file);
}

function parseCsv(csvText) {
    const lines = csvText.trim().split('\n');
    const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
    
    const data = [];
    for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(',');
        const row = {};
        headers.forEach((header, index) => {
            row[header] = values[index]?.trim();
        });
        data.push(row);
    }
    
    return data;
}

function updateCsvUploadUI(fileName) {
    const uploadArea = document.getElementById('csvUploadArea');
    const fileInfo = document.getElementById('csvFileInfo');
    
    if (fileName) {
        uploadArea.style.display = 'none';
        fileInfo.style.display = 'flex';
        document.getElementById('csvFileName').textContent = fileName;
    } else {
        uploadArea.style.display = 'block';
        fileInfo.style.display = 'none';
    }
}

function removeCsvFile() {
    AppState.pendingCsvData = null;
    updateCsvUploadUI(null);
}

// ============================================
// ICON SELECTOR
// ============================================

function initIconSelector() {
    const icons = ['📊', '🏫', '🏥', '🗳️', '🚌', '📚', '🏠', '🌳', '💊', '🚒', '👶', '🏛️', '💼', '🎓', '🏭', '🌾', '⚡', '💧', '🛣️', '✈️'];
    
    const container = document.getElementById('iconSelector');
    if (!container) return;
    
    icons.forEach(icon => {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'icon-option';
        btn.textContent = icon;
        btn.onclick = () => selectIcon(icon);
        container.appendChild(btn);
    });
}

function selectIcon(icon) {
    document.getElementById('storyIcon').value = icon;
    document.querySelectorAll('.icon-option').forEach(btn => {
        btn.classList.toggle('selected', btn.textContent === icon);
    });
}

function initCategorySelector() {
    // Category already handled by select element
}

// ============================================
// USER SCENARIOS MANAGEMENT
// ============================================

function loadUserScenarios() {
    try {
        const saved = localStorage.getItem('civicExplorerUserScenarios');
        if (saved) {
            AppState.userScenarios = JSON.parse(saved);
            renderUserScenarios();
        }
    } catch (err) {
        console.error('Error loading user scenarios:', err);
    }
}

function saveUserScenarios() {
    try {
        localStorage.setItem('civicExplorerUserScenarios', JSON.stringify(AppState.userScenarios));
    } catch (err) {
        console.error('Error saving user scenarios:', err);
    }
}

function renderUserScenarios() {
    const container = document.getElementById('userStoriesGrid');
    if (!container) return;
    
    const countBadge = document.getElementById('storyCountBadge');
    if (countBadge) {
        countBadge.textContent = `${AppState.userScenarios.length}/10 scenarios`;
    }
    
    if (AppState.userScenarios.length === 0) {
        container.innerHTML = `
            <div class="empty-stories">
                <div class="empty-stories-icon">📝</div>
                <p>No custom scenarios yet. Create your first one above!</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = AppState.userScenarios.map((scenario, index) => `
        <div class="user-story-card ${scenario.id === AppState.activeUserScenario ? 'active' : ''}" 
             onclick="selectUserScenario('${scenario.id}')">
            <div class="user-story-header">
                <span class="user-story-icon">${scenario.icon}</span>
                <div class="user-story-actions">
                    <button class="story-action-btn" onclick="event.stopPropagation(); editUserScenario('${scenario.id}')" title="Edit">✏️</button>
                    <button class="story-action-btn" onclick="event.stopPropagation(); deleteUserScenario('${scenario.id}')" title="Delete">🗑️</button>
                </div>
            </div>
            <h4 class="user-story-title">${scenario.title}</h4>
            <p class="user-story-description">${scenario.description || 'No description'}</p>
            <div class="user-story-stats">
                <div class="user-story-stat">
                    <span class="user-story-stat-value">${formatNumber(scenario.trueValue)}</span>
                    <span class="user-story-stat-label">True Value</span>
                </div>
                <div class="user-story-stat">
                    <span class="user-story-stat-value">${formatNumber(scenario.threshold)}</span>
                    <span class="user-story-stat-label">Threshold</span>
                </div>
            </div>
            ${scenario.csvData ? '<div class="csv-badge">📄 CSV Data</div>' : ''}
        </div>
    `).join('');
}

function selectUserScenario(scenarioId) {
    const scenario = AppState.userScenarios.find(s => s.id === scenarioId);
    if (!scenario) return;
    
    AppState.activeUserScenario = scenarioId;
    
    // Add to main scenarios temporarily
    scenarios[scenarioId] = {
        ...scenario,
        subtitle: scenario.stakesAmount || 'Custom scenario'
    };
    
    // Switch to single view and select this scenario
    switchMode('single');
    selectScenario(scenarioId);
    
    renderUserScenarios();
}

function editUserScenario(scenarioId) {
    const scenario = AppState.userScenarios.find(s => s.id === scenarioId);
    if (!scenario) return;
    
    // Populate form
    document.getElementById('storyName').value = scenario.title;
    document.getElementById('storyDescription').value = scenario.description || '';
    document.getElementById('storyTrueValue').value = scenario.trueValue;
    document.getElementById('storyThreshold').value = scenario.threshold;
    document.getElementById('storySensitivity').value = scenario.sensitivity || 1;
    document.getElementById('storyCategory').value = scenario.stakes;
    document.getElementById('storyStakes').value = scenario.stakesAmount || '';
    document.getElementById('storyIcon').value = scenario.icon;
    
    selectIcon(scenario.icon);
    
    // Remove old and re-add on submit
    deleteUserScenario(scenarioId, true);
    
    // Scroll to form
    document.getElementById('storyBuilderForm').scrollIntoView({ behavior: 'smooth' });
}

function deleteUserScenario(scenarioId, silent = false) {
    if (!silent && !confirm('Delete this scenario?')) return;
    
    AppState.userScenarios = AppState.userScenarios.filter(s => s.id !== scenarioId);
    saveUserScenarios();
    renderUserScenarios();
    
    // Remove from main scenarios
    delete scenarios[scenarioId];
    
    if (!silent) {
        showNotification('Scenario deleted', 'info');
    }
}

// ============================================
// CSV DATA ANALYSIS
// ============================================

function analyzeUserCsvData(scenario) {
    if (!scenario.csvData || scenario.csvData.length === 0) return null;
    
    const data = scenario.csvData;
    
    // Group by epsilon
    const byEpsilon = {};
    data.forEach(row => {
        const eps = parseFloat(row.epsilon);
        if (!byEpsilon[eps]) byEpsilon[eps] = [];
        byEpsilon[eps].push(row);
    });
    
    // Calculate flip rates per epsilon
    const flipRates = Object.entries(byEpsilon).map(([eps, rows]) => {
        const flips = rows.filter(r => r.flip_flag === '1').length;
        return {
            epsilon: parseFloat(eps),
            flipRate: (flips / rows.length) * 100,
            sampleSize: rows.length
        };
    }).sort((a, b) => a.epsilon - b.epsilon);
    
    // Calculate overall stats
    const totalFlips = data.filter(r => r.flip_flag === '1').length;
    const overallFlipRate = (totalFlips / data.length) * 100;
    
    // Calculate error distribution
    const errors = data.map(row => {
        const noisy = parseInt(row.noisy_value);
        const truth = parseInt(row.true_value);
        return Math.abs(noisy - truth) / truth * 100;
    });
    const avgError = errors.reduce((a, b) => a + b, 0) / errors.length;
    
    return {
        flipRates,
        overallFlipRate,
        avgError,
        totalSamples: data.length
    };
}

// ============================================
// NOTIFICATIONS
// ============================================

function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <span>${message}</span>
        <button onclick="this.parentElement.remove()">×</button>
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.classList.add('show');
    }, 10);
    
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Add notification styles dynamically
const notificationStyles = document.createElement('style');
notificationStyles.textContent = `
    .notification {
        position: fixed;
        bottom: 20px;
        right: 20px;
        padding: 16px 24px;
        background: var(--bg-elevated);
        border: 1px solid var(--border-medium);
        border-radius: var(--radius-lg);
        color: var(--text-bright);
        display: flex;
        align-items: center;
        gap: 12px;
        z-index: 9999;
        transform: translateY(100px);
        opacity: 0;
        transition: all 0.3s ease;
    }
    .notification.show {
        transform: translateY(0);
        opacity: 1;
    }
    .notification-success { border-left: 4px solid var(--success); }
    .notification-error { border-left: 4px solid var(--danger); }
    .notification-info { border-left: 4px solid var(--accent-sky); }
    .notification button {
        background: none;
        border: none;
        color: var(--text-muted);
        cursor: pointer;
        font-size: 1.2rem;
    }
`;
document.head.appendChild(notificationStyles);

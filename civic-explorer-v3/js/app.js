/**
 * ============================================
 * CIVIC DATA EXPLORER - ENHANCED APPLICATION
 * Differential Privacy Impact Simulator v2.0
 * Features: Advanced Charts, Comparison View, Story Builder
 * ============================================
 */

// ============================================
// SCENARIO DATA DEFINITIONS
// ============================================

const scenarios = {
    school: {
        id: 'school',
        icon: '🏫',
        title: 'School Funding Decision',
        subtitle: 'Does this district qualify for Title I funding?',
        trueValue: 1247,
        threshold: 1200,
        aboveOutcome: 'FUNDED — Title I grant approved ($2.4M annually)',
        belowOutcome: 'DENIED — Does not meet eligibility threshold',
        context: `Title I funding requires school districts to have at least 1,200 children from low-income 
            families to qualify. Your district actually has 1,247 eligible children—just 47 above the 
            threshold. But the published census data includes privacy noise...`,
        sensitivity: 1,
        scale: 1,
        stakes: 'funding',
        stakesLabel: 'Funding',
        stakesAmount: '$2.4M annually'
    },

    hospital: {
        id: 'hospital',
        icon: '🏥',
        title: 'Rural Clinic Placement',
        subtitle: 'Does this area qualify for a community health clinic?',
        trueValue: 4850,
        threshold: 5000,
        aboveOutcome: 'APPROVED — Rural health clinic authorization granted',
        belowOutcome: 'DENIED — Population below minimum threshold for clinic approval',
        context: `HRSA requires a minimum population of 5,000 in an area before a rural health clinic can be approved. 
            This community actually has 4,850 residents—150 below the threshold.`,
        sensitivity: 1,
        scale: 1,
        stakes: 'health',
        stakesLabel: 'Health',
        stakesAmount: 'Healthcare access'
    },

    redistrict: {
        id: 'redistrict',
        icon: '🗳️',
        title: 'Congressional Redistricting',
        subtitle: 'Does this region deserve an additional representative?',
        trueValue: 710000,
        threshold: 700000,
        aboveOutcome: 'GAINS SEAT — Additional congressional representation awarded',
        belowOutcome: 'NO CHANGE — Does not qualify for additional seat',
        context: `Congressional seats are apportioned based on population. This region has 710,000 
            residents—just 10,000 above the threshold for an additional seat.`,
        sensitivity: 1000,
        scale: 1000,
        stakes: 'democracy',
        stakesLabel: 'Democracy',
        stakesAmount: 'Political representation'
    }
};

// ============================================
// APPLICATION STATE
// ============================================

const AppState = {
    currentScenario: 'school',
    currentEpsilon: 1.0,
    currentMode: 'single',
    userScenarios: [],
    charts: {},
    simulationSamples: 500
};

// ============================================
// INITIALIZATION
// ============================================

document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

function initializeApp() {
    initModeTabs();
    selectScenario('school');
    
    const epsilonSlider = document.getElementById('epsilonSlider');
    if (epsilonSlider) {
        epsilonSlider.addEventListener('input', handleEpsilonChange);
    }
    
    document.querySelectorAll('.scenario-card').forEach(card => {
        card.addEventListener('click', function() {
            selectScenario(this.dataset.scenario);
        });
    });
    
    initCollapsibles();
    initStoryBuilder();
    loadUserScenarios();
    
    // Initial chart render
    setTimeout(() => {
        updateAdvancedCharts(scenarios[AppState.currentScenario]);
        updateComparisonView();
    }, 100);
    
    console.log('Civic Data Explorer v2.0 initialized');
}

// ============================================
// MODE TABS SYSTEM
// ============================================

function initModeTabs() {
    document.querySelectorAll('.mode-tab').forEach(tab => {
        tab.addEventListener('click', function() {
            switchMode(this.dataset.mode);
        });
    });
}

function switchMode(mode) {
    AppState.currentMode = mode;
    
    document.querySelectorAll('.mode-tab').forEach(tab => {
        tab.classList.toggle('active', tab.dataset.mode === mode);
    });
    
    document.querySelectorAll('.mode-content').forEach(content => {
        content.classList.toggle('active', content.dataset.mode === mode);
    });
    
    if (mode === 'comparison') {
        setTimeout(updateComparisonView, 100);
    }
}

// ============================================
// COLLAPSIBLE SECTIONS
// ============================================

function initCollapsibles() {
    document.querySelectorAll('.collapsible-header').forEach(header => {
        header.addEventListener('click', function() {
            this.closest('.collapsible-section').classList.toggle('open');
        });
    });
}

// ============================================
// SCENARIO SELECTION
// ============================================

function selectScenario(scenarioKey) {
    AppState.currentScenario = scenarioKey;
    const scenario = scenarios[scenarioKey];
    
    if (!scenario) return;
    
    document.querySelectorAll('.scenario-card').forEach(card => {
        card.classList.remove('active');
    });
    
    const activeCard = document.querySelector(`[data-scenario="${scenarioKey}"]`);
    if (activeCard) activeCard.classList.add('active');
    
    updateElement('simTitle', scenario.title);
    updateElement('simSubtitle', scenario.subtitle);
    updateElement('contextText', scenario.context);
    updateElement('trueValue', formatNumber(scenario.trueValue));
    updateElement('threshold', formatNumber(scenario.threshold));
    updateElement('thresholdLabel', 'Threshold: ' + formatNumber(scenario.threshold));
    
    const slider = document.getElementById('epsilonSlider');
    if (slider) slider.value = 1.0;
    
    updateSimulation();
    updateFlowDiagram(scenario);
    
    // Sync with analytics iframe
    syncAnalyticsFrame();
}

// ============================================
// SIMULATION LOGIC
// ============================================

function handleEpsilonChange() {
    updateSimulation();
    const scenario = scenarios[AppState.currentScenario];
    if (scenario) {
        updateFlowDiagram(scenario);
    }
    if (AppState.currentMode === 'comparison') {
        updateComparisonView();
    }
    
    // Sync with analytics iframe
    syncAnalyticsFrame();
}

function syncAnalyticsFrame() {
    const iframe = document.getElementById('analyticsFrame');
    if (iframe && iframe.contentWindow) {
        try {
            // Post message to iframe
            iframe.contentWindow.postMessage({
                type: 'updateParams',
                scenario: AppState.currentScenario,
                epsilon: AppState.currentEpsilon
            }, '*');
        } catch (e) {
            // Iframe not ready or cross-origin
        }
    }
}

function updateSimulation() {
    const scenario = scenarios[AppState.currentScenario];
    const slider = document.getElementById('epsilonSlider');
    
    if (!scenario || !slider) return;
    
    const epsilon = parseFloat(slider.value);
    AppState.currentEpsilon = epsilon;
    
    updateElement('epsilonBadge', 'ε = ' + epsilon.toFixed(1));
    
    const sensitivity = scenario.sensitivity;
    const scale = sensitivity / epsilon;
    
    const noise = Math.sin(epsilon * 7.3) * scale * scenario.trueValue * 0.03;
    const noisyValue = Math.round(scenario.trueValue + noise);
    
    const margin = Math.round(1.96 * scale * scenario.trueValue * 0.02 / scenario.scale);
    const rangeLow = noisyValue - margin;
    const rangeHigh = noisyValue + margin;
    
    updateElement('noisyValue', formatNumber(noisyValue));
    updateElement('rangeValue', formatNumber(rangeLow) + ' — ' + formatNumber(rangeHigh));
    updateElement('rangeLow', 'Low: ' + formatNumber(rangeLow));
    updateElement('rangeHigh', 'High: ' + formatNumber(rangeHigh));
    
    const errorPercent = ((margin / scenario.trueValue) * 100).toFixed(1);
    updateElement('errorPercent', '±' + errorPercent + '%');
    updateElement('noiseScale', formatNumber(Math.round(scale * scenario.scale)));
    
    const confidenceLevel = (rangeLow >= scenario.threshold || rangeHigh <= scenario.threshold) ? 'High' : 'Low';
    updateElement('confidence', confidenceLevel);
    
    updateVisualization(scenario, noisyValue, rangeLow, rangeHigh);
    updateDecisionOutcome(scenario, noisyValue, rangeLow, rangeHigh);
    updateInsight(epsilon, errorPercent, scenario);
}

function updateVisualization(scenario, noisyValue, rangeLow, rangeHigh) {
    const threshold = scenario.threshold;
    const minVal = Math.min(rangeLow, threshold * 0.85);
    const maxVal = Math.max(rangeHigh, threshold * 1.15);
    const range = maxVal - minVal;
    
    const thresholdPos = ((threshold - minVal) / range) * 100;
    const valuePos = ((noisyValue - minVal) / range) * 100;
    const rangeStartPos = ((rangeLow - minVal) / range) * 100;
    const rangeWidth = ((rangeHigh - rangeLow) / range) * 100;
    
    const thresholdLine = document.getElementById('thresholdLine');
    const valueMarker = document.getElementById('valueMarker');
    const valueLabel = document.getElementById('valueLabel');
    const uncertaintyRange = document.getElementById('uncertaintyRange');
    
    if (thresholdLine) thresholdLine.style.left = thresholdPos + '%';
    if (valueMarker) valueMarker.style.left = valuePos + '%';
    if (valueLabel) valueLabel.textContent = formatNumber(noisyValue);
    if (uncertaintyRange) {
        uncertaintyRange.style.left = rangeStartPos + '%';
        uncertaintyRange.style.width = rangeWidth + '%';
    }
}

function updateDecisionOutcome(scenario, noisyValue, rangeLow, rangeHigh) {
    const threshold = scenario.threshold;
    const outcomeEl = document.getElementById('decisionOutcome');
    if (!outcomeEl) return;
    
    let outcomeClass, badgeText, explanationText;
    
    if (rangeLow >= threshold) {
        outcomeClass = 'positive';
        badgeText = '✅ ' + scenario.aboveOutcome;
        explanationText = `The entire uncertainty range is above the threshold. You can make this decision with high confidence.`;
    } else if (rangeHigh <= threshold) {
        outcomeClass = 'negative';
        badgeText = '❌ ' + scenario.belowOutcome;
        explanationText = `The entire uncertainty range is below the threshold. The denial is statistically confident.`;
    } else {
        outcomeClass = 'uncertain';
        badgeText = '⚠️ UNCERTAIN — Cannot make confident decision';
        explanationText = `The uncertainty range spans the threshold. The true value could be on either side—you're essentially guessing!`;
    }
    
    outcomeEl.className = 'decision-outcome ' + outcomeClass;
    outcomeEl.innerHTML = `<div class="decision-badge">${badgeText}</div><p>${explanationText}</p>`;
}

function updateInsight(epsilon, errorPercent, scenario) {
    let insightText;
    
    if (epsilon < 1) {
        insightText = `<strong>High Privacy Mode (ε=${epsilon.toFixed(1)}):</strong> With ±${errorPercent}% uncertainty, 
            privacy protection is strong, but decisions near thresholds become nearly impossible.`;
    } else if (epsilon < 2.5) {
        insightText = `<strong>Balanced Mode (ε=${epsilon.toFixed(1)}):</strong> With ±${errorPercent}% uncertainty, 
            this provides moderate privacy while keeping data useful. Borderline cases still face risk.`;
    } else {
        insightText = `<strong>High Accuracy Mode (ε=${epsilon.toFixed(1)}):</strong> With only ±${errorPercent}% uncertainty, 
            decisions are more reliable. However, privacy protection is weaker.`;
    }
    
    updateElement('insightText', insightText, true);
}

// ============================================
// UTILITY FUNCTIONS
// ============================================

function formatNumber(num) {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

function updateElement(id, content, isHTML = false) {
    const element = document.getElementById(id);
    if (element) {
        if (isHTML) {
            element.innerHTML = content;
        } else {
            element.textContent = content;
        }
    }
}

function resetAndExplore() {
    const slider = document.getElementById('epsilonSlider');
    if (slider) slider.value = 1.0;
    
    const scenarioSection = document.querySelector('.scenario-section');
    if (scenarioSection) {
        window.scrollTo({ top: scenarioSection.offsetTop - 100, behavior: 'smooth' });
    }
}

function scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

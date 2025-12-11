/**
 * ============================================
 * FLOW DIAGRAM MODULE
 * Interactive DP Pipeline Visualization
 * ============================================
 */

// ============================================
// FLOW DIAGRAM DATA
// ============================================

const flowStages = [
    {
        id: 'collection',
        icon: '📋',
        title: 'Data Collection',
        description: 'Census collects individual responses',
        effect: 'Raw, sensitive data gathered',
        highlightOn: ['low', 'medium', 'high']
    },
    {
        id: 'noise',
        icon: '🎲',
        title: 'DP Mechanism',
        description: 'Laplace noise added based on ε',
        effect: 'Privacy protection applied',
        highlightOn: ['low', 'medium']
    },
    {
        id: 'publication',
        icon: '📊',
        title: 'Noisy Statistics',
        description: 'Published counts with uncertainty',
        effect: 'Data becomes probabilistic',
        highlightOn: ['medium']
    },
    {
        id: 'decision',
        icon: '⚖️',
        title: 'Decision Rule',
        description: 'Compare to threshold',
        effect: 'Binary outcome from noisy input',
        highlightOn: ['medium', 'high']
    },
    {
        id: 'outcome',
        icon: '🎯',
        title: 'Outcome',
        description: 'Funding/Denial/Representation',
        effect: 'Real-world consequences',
        highlightOn: ['high']
    }
];

// ============================================
// FLOW DIAGRAM UPDATE
// ============================================

function updateFlowDiagram(scenario) {
    const container = document.getElementById('flowPipeline');
    if (!container) return;
    
    const epsilon = AppState.currentEpsilon;
    const impactLevel = epsilon < 1 ? 'high' : epsilon < 2.5 ? 'medium' : 'low';
    
    container.innerHTML = flowStages.map((stage, index) => {
        const isHighlighted = shouldHighlight(stage, epsilon, scenario);
        const effectText = getStageEffect(stage, scenario, epsilon);
        
        return `
            <div class="flow-node ${isHighlighted ? 'highlighted' : ''}" data-stage="${stage.id}">
                <div class="flow-node-icon">${stage.icon}</div>
                <h4 class="flow-node-title">${stage.title}</h4>
                <p class="flow-node-description">${stage.description}</p>
                <div class="flow-node-effect">${effectText}</div>
            </div>
        `;
    }).join('');
    
    // Update trace panel
    updateTracePanel(scenario, epsilon);
}

function shouldHighlight(stage, epsilon, scenario) {
    // Highlight stages most affected by current epsilon
    if (epsilon < 1) {
        // High privacy - noise dominates
        return ['noise', 'publication', 'decision'].includes(stage.id);
    } else if (epsilon < 2.5) {
        // Balanced - uncertainty at decision point
        return ['publication', 'decision'].includes(stage.id);
    } else {
        // Low privacy - minimal impact
        return ['decision', 'outcome'].includes(stage.id);
    }
}

function getStageEffect(stage, scenario, epsilon) {
    const sensitivity = scenario.sensitivity;
    const scale = sensitivity / epsilon;
    const errorPercent = ((1.96 * scale * scenario.trueValue * 0.02 / scenario.scale) / scenario.trueValue * 100).toFixed(1);
    
    switch (stage.id) {
        case 'collection':
            return `True value: ${formatNumber(scenario.trueValue)}`;
        case 'noise':
            return `Scale: ${(scale * scenario.scale).toFixed(0)} | ε = ${epsilon.toFixed(1)}`;
        case 'publication':
            return `Uncertainty: ±${errorPercent}%`;
        case 'decision':
            return `Threshold: ${formatNumber(scenario.threshold)}`;
        case 'outcome':
            const margin = scenario.trueValue - scenario.threshold;
            return margin >= 0 ? 'Should: APPROVE' : 'Should: DENY';
        default:
            return stage.effect;
    }
}

// ============================================
// TRACE PANEL
// ============================================

function updateTracePanel(scenario, epsilon) {
    const panel = document.getElementById('traceContent');
    if (!panel) return;
    
    const sensitivity = scenario.sensitivity;
    const scale = sensitivity / epsilon;
    const margin = Math.round(1.96 * scale * scenario.trueValue * 0.02 / scenario.scale);
    const noise = Math.sin(epsilon * 7.3) * scale * scenario.trueValue * 0.03;
    const noisyValue = Math.round(scenario.trueValue + noise);
    const rangeLow = noisyValue - margin;
    const rangeHigh = noisyValue + margin;
    
    const crossesThreshold = rangeLow < scenario.threshold && rangeHigh > scenario.threshold;
    const flipProb = calculateFlipProbability(scenario, epsilon);
    
    let traceHTML = `
        <p><strong>Current Configuration:</strong></p>
        <p>
            Privacy parameter: <span class="trace-highlight">ε = ${epsilon.toFixed(1)}</span> 
            → Laplace scale: <span class="trace-highlight">${(scale * scenario.scale).toFixed(0)}</span>
        </p>
        <p>
            True value: <span class="trace-highlight">${formatNumber(scenario.trueValue)}</span> 
            → Published range: <span class="trace-highlight">${formatNumber(rangeLow)} – ${formatNumber(rangeHigh)}</span>
        </p>
        <p>
            Threshold: <span class="trace-highlight">${formatNumber(scenario.threshold)}</span> | 
            Range crosses threshold: <span class="trace-highlight">${crossesThreshold ? 'YES ⚠️' : 'NO ✓'}</span>
        </p>
        <p>
            <strong>Decision risk:</strong> 
            <span class="trace-highlight">${flipProb.toFixed(1)}%</span> probability of wrong outcome
        </p>
    `;
    
    if (crossesThreshold) {
        traceHTML += `
            <p style="color: var(--warning); margin-top: var(--space-md);">
                ⚠️ <strong>Warning:</strong> The uncertainty range spans the decision threshold. 
                Any decision made from this data is statistically unreliable.
            </p>
        `;
    }
    
    panel.innerHTML = traceHTML;
}

// ============================================
// FLOW INTERACTIONS
// ============================================

function initFlowInteractions() {
    document.querySelectorAll('.flow-node').forEach(node => {
        node.addEventListener('mouseenter', function() {
            const stageId = this.dataset.stage;
            showStageTooltip(stageId, this);
        });
        
        node.addEventListener('mouseleave', function() {
            hideStageTooltip();
        });
    });
}

function showStageTooltip(stageId, element) {
    const stage = flowStages.find(s => s.id === stageId);
    if (!stage) return;
    
    // Create tooltip if doesn't exist
    let tooltip = document.getElementById('flowTooltip');
    if (!tooltip) {
        tooltip = document.createElement('div');
        tooltip.id = 'flowTooltip';
        tooltip.className = 'flow-tooltip';
        document.body.appendChild(tooltip);
    }
    
    const scenario = scenarios[AppState.currentScenario];
    const epsilon = AppState.currentEpsilon;
    
    let tooltipContent = `
        <h5>${stage.title}</h5>
        <p>${getDetailedStageDescription(stage, scenario, epsilon)}</p>
    `;
    
    tooltip.innerHTML = tooltipContent;
    
    const rect = element.getBoundingClientRect();
    tooltip.style.left = rect.left + rect.width / 2 + 'px';
    tooltip.style.top = rect.bottom + 10 + 'px';
    tooltip.style.display = 'block';
}

function hideStageTooltip() {
    const tooltip = document.getElementById('flowTooltip');
    if (tooltip) {
        tooltip.style.display = 'none';
    }
}

function getDetailedStageDescription(stage, scenario, epsilon) {
    const sensitivity = scenario.sensitivity;
    const scale = sensitivity / epsilon;
    
    switch (stage.id) {
        case 'collection':
            return `The Census Bureau collects responses from every household. For this scenario, the true population count is ${formatNumber(scenario.trueValue)}. This raw data is sensitive and cannot be published directly.`;
        
        case 'noise':
            return `Differential privacy adds Laplace noise with scale ${(scale * scenario.scale).toFixed(0)} (determined by ε = ${epsilon.toFixed(1)}). Lower ε means more noise. The noise distribution is: Laplace(0, sensitivity/ε).`;
        
        case 'publication':
            const errorPercent = ((1.96 * scale * scenario.trueValue * 0.02 / scenario.scale) / scenario.trueValue * 100).toFixed(1);
            return `The published statistics now carry ±${errorPercent}% uncertainty. This uncertainty propagates to all downstream decisions.`;
        
        case 'decision':
            return `Decision-makers compare the noisy published count to threshold ${formatNumber(scenario.threshold)}. If the uncertainty range crosses this threshold, the decision becomes unreliable.`;
        
        case 'outcome':
            const flipProb = calculateFlipProbability(scenario, epsilon);
            return `The final outcome has a ${flipProb.toFixed(1)}% chance of being wrong due to privacy noise. Stakes: ${scenario.stakesAmount}.`;
        
        default:
            return stage.description;
    }
}

// Add tooltip styles
const tooltipStyles = document.createElement('style');
tooltipStyles.textContent = `
    .flow-tooltip {
        position: fixed;
        max-width: 300px;
        padding: var(--space-md);
        background: var(--bg-card);
        border: 1px solid var(--border-medium);
        border-radius: var(--radius-md);
        color: var(--text-primary);
        font-size: 0.85rem;
        z-index: 1000;
        box-shadow: var(--shadow-medium);
        transform: translateX(-50%);
        display: none;
    }
    .flow-tooltip h5 {
        color: var(--text-bright);
        margin-bottom: var(--space-sm);
        font-family: var(--font-display);
    }
    .flow-tooltip p {
        margin: 0;
        line-height: 1.5;
    }
`;
document.head.appendChild(tooltipStyles);

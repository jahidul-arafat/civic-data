/**
 * ============================================
 * COMPARISON VIEW MODULE
 * Multi-Scenario Analysis and Comparison
 * ============================================
 */

// ============================================
// COMPARISON VIEW INITIALIZATION
// ============================================

function initComparisonView() {
    // View toggle buttons
    document.querySelectorAll('.view-toggle-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            document.querySelectorAll('.view-toggle-btn').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            
            const view = this.dataset.view;
            document.querySelectorAll('.comparison-view-content').forEach(content => {
                content.classList.toggle('active', content.dataset.view === view);
            });
        });
    });
}

// ============================================
// COMPARISON VIEW UPDATE
// ============================================

function updateComparisonView() {
    updateComparisonTable();
    updateComparisonChart();
}

function updateComparisonTable() {
    const tableBody = document.getElementById('comparisonTableBody');
    if (!tableBody) return;
    
    const epsilon = AppState.currentEpsilon;
    let html = '';
    
    Object.values(scenarios).forEach(scenario => {
        const error = calculateError(scenario, epsilon);
        const flipProb = calculateFlipProbability(scenario, epsilon);
        const flipClass = flipProb > 30 ? 'high' : flipProb > 15 ? 'medium' : 'low';
        
        html += `
            <tr>
                <td class="scenario-icon-cell">${scenario.icon}</td>
                <td><strong>${scenario.title}</strong></td>
                <td>${formatNumber(scenario.trueValue)}</td>
                <td>${formatNumber(scenario.threshold)}</td>
                <td>±${error.toFixed(1)}%</td>
                <td class="flip-prob-cell ${flipClass}">${flipProb.toFixed(1)}%</td>
                <td><span class="stakes-badge ${scenario.stakes}">${scenario.stakesLabel}</span></td>
            </tr>
        `;
    });
    
    tableBody.innerHTML = html;
}

function updateComparisonChart() {
    const canvas = document.getElementById('comparisonChart');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    
    if (AppState.charts.comparison) {
        AppState.charts.comparison.destroy();
    }
    
    const epsilonValues = [];
    for (let e = 0.1; e <= 5; e += 0.3) {
        epsilonValues.push(e.toFixed(1));
    }
    
    const datasets = [];
    const colors = {
        school: { border: 'rgba(240, 180, 41, 1)', bg: 'rgba(240, 180, 41, 0.1)' },
        hospital: { border: 'rgba(251, 113, 133, 1)', bg: 'rgba(251, 113, 133, 0.1)' },
        redistrict: { border: 'rgba(167, 139, 250, 1)', bg: 'rgba(167, 139, 250, 0.1)' }
    };
    
    Object.values(scenarios).forEach(scenario => {
        const flipProbs = epsilonValues.map(e => calculateFlipProbability(scenario, parseFloat(e)));
        
        datasets.push({
            label: scenario.title,
            data: flipProbs,
            borderColor: colors[scenario.id].border,
            backgroundColor: colors[scenario.id].bg,
            fill: false,
            tension: 0.4,
            pointRadius: 3,
            pointHoverRadius: 6
        });
    });
    
    AppState.charts.comparison = new Chart(ctx, {
        type: 'line',
        data: {
            labels: epsilonValues,
            datasets: datasets
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            interaction: {
                mode: 'index',
                intersect: false
            },
            plugins: {
                legend: {
                    display: true,
                    position: 'top',
                    labels: {
                        color: '#d8e2ef',
                        usePointStyle: true,
                        padding: 20,
                        font: { size: 12 }
                    }
                },
                tooltip: {
                    backgroundColor: 'rgba(26, 37, 64, 0.95)',
                    titleColor: '#f4f7fb',
                    bodyColor: '#d8e2ef',
                    borderColor: 'rgba(255,255,255,0.1)',
                    borderWidth: 1,
                    padding: 12,
                    callbacks: {
                        label: (context) => `${context.dataset.label}: ${context.raw.toFixed(1)}%`
                    }
                },
                annotation: {
                    annotations: {
                        currentEpsilon: {
                            type: 'line',
                            xMin: AppState.currentEpsilon.toFixed(1),
                            xMax: AppState.currentEpsilon.toFixed(1),
                            borderColor: 'rgba(56, 189, 248, 0.5)',
                            borderWidth: 2,
                            borderDash: [5, 5],
                            label: {
                                display: true,
                                content: `Current ε = ${AppState.currentEpsilon.toFixed(1)}`,
                                position: 'start',
                                backgroundColor: 'rgba(56, 189, 248, 0.8)',
                                color: '#0c1220',
                                font: { size: 10 }
                            }
                        }
                    }
                }
            },
            scales: {
                x: {
                    title: {
                        display: true,
                        text: 'Privacy Parameter (ε)',
                        color: '#9ba8c2',
                        font: { size: 12, weight: 500 }
                    },
                    grid: { color: 'rgba(255,255,255,0.05)' },
                    ticks: { color: '#6b7a96', font: { size: 11 } }
                },
                y: {
                    title: {
                        display: true,
                        text: 'Probability of Wrong Decision (%)',
                        color: '#9ba8c2',
                        font: { size: 12, weight: 500 }
                    },
                    grid: { color: 'rgba(255,255,255,0.05)' },
                    ticks: { color: '#6b7a96', font: { size: 11 } },
                    min: 0,
                    max: 50
                }
            }
        }
    });
}

// ============================================
// SCENARIO METRICS CALCULATOR
// ============================================

function getScenarioMetrics(scenario, epsilon) {
    const error = calculateError(scenario, epsilon);
    const flipProb = calculateFlipProbability(scenario, epsilon);
    const confidence = 100 - flipProb;
    
    const margin = scenario.trueValue - scenario.threshold;
    const relativeMargin = (margin / scenario.threshold) * 100;
    
    return {
        error,
        flipProb,
        confidence,
        margin,
        relativeMargin,
        stakes: scenario.stakes,
        stakesLabel: scenario.stakesLabel
    };
}

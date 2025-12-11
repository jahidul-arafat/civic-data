/**
 * ============================================
 * ADVANCED CHARTS MODULE
 * Histogram, Flip Probability, Small Multiples
 * ============================================
 */

// ============================================
// LAPLACE SAMPLING
// ============================================

function generateLaplaceSamples(scenario, epsilon, numSamples) {
    const sensitivity = scenario.sensitivity;
    const scale = sensitivity / epsilon;
    const samples = [];
    
    for (let i = 0; i < numSamples; i++) {
        const u = Math.random() - 0.5;
        const noise = -scale * Math.sign(u) * Math.log(1 - 2 * Math.abs(u));
        samples.push(scenario.trueValue + noise * scenario.trueValue * 0.02 / scenario.scale);
    }
    
    return samples;
}

function calculateFlipProbability(scenario, epsilon) {
    const samples = generateLaplaceSamples(scenario, epsilon, 500);
    const threshold = scenario.threshold;
    const trueAbove = scenario.trueValue >= threshold;
    
    let flips = 0;
    samples.forEach(sample => {
        if ((sample >= threshold) !== trueAbove) flips++;
    });
    
    return (flips / samples.length) * 100;
}

function calculateError(scenario, epsilon) {
    const sensitivity = scenario.sensitivity;
    const scale = sensitivity / epsilon;
    const margin = 1.96 * scale * scenario.trueValue * 0.02 / scenario.scale;
    return (margin / scenario.trueValue) * 100;
}

// ============================================
// ADVANCED CHARTS UPDATE
// ============================================

function updateAdvancedCharts(scenario) {
    const epsilon = AppState.currentEpsilon;
    const samples = generateLaplaceSamples(scenario, epsilon, AppState.simulationSamples);
    
    updateHistogramChart(scenario, samples);
    updateFlipProbabilityChart(scenario);
    updateSmallMultiples(scenario);
    updateFlipProbabilityDisplay(scenario, samples);
}

// ============================================
// HISTOGRAM CHART
// ============================================

function updateHistogramChart(scenario, samples) {
    const canvas = document.getElementById('histogramChart');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    
    if (AppState.charts.histogram) {
        AppState.charts.histogram.destroy();
    }
    
    const min = Math.min(...samples, scenario.threshold * 0.9);
    const max = Math.max(...samples, scenario.threshold * 1.1);
    const numBins = 20;
    const binWidth = (max - min) / numBins;
    const bins = new Array(numBins).fill(0);
    const binLabels = [];
    
    samples.forEach(sample => {
        const binIndex = Math.min(Math.floor((sample - min) / binWidth), numBins - 1);
        if (binIndex >= 0) bins[binIndex]++;
    });
    
    for (let i = 0; i < numBins; i++) {
        binLabels.push('');
    }
    
    const threshold = scenario.threshold;
    const colors = bins.map((_, i) => {
        const binCenter = min + (i + 0.5) * binWidth;
        return binCenter < threshold ? 'rgba(251, 113, 133, 0.7)' : 'rgba(45, 212, 191, 0.7)';
    });
    
    const borderColors = bins.map((_, i) => {
        const binCenter = min + (i + 0.5) * binWidth;
        return binCenter < threshold ? 'rgba(251, 113, 133, 1)' : 'rgba(45, 212, 191, 1)';
    });
    
    AppState.charts.histogram = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: binLabels,
            datasets: [{
                label: 'Outcome Distribution',
                data: bins,
                backgroundColor: colors,
                borderColor: borderColors,
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false },
                tooltip: {
                    callbacks: {
                        label: (context) => `${context.raw} samples`
                    }
                }
            },
            scales: {
                x: {
                    display: true,
                    grid: { display: false },
                    ticks: { display: false }
                },
                y: {
                    display: true,
                    grid: { color: 'rgba(255,255,255,0.05)' },
                    ticks: { 
                        color: '#6b7a96', 
                        font: { size: 9 },
                        maxTicksLimit: 5
                    }
                }
            }
        }
    });
}

// ============================================
// FLIP PROBABILITY CHART
// ============================================

function updateFlipProbabilityChart(scenario) {
    const canvas = document.getElementById('flipProbChart');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    
    if (AppState.charts.flipProb) {
        AppState.charts.flipProb.destroy();
    }
    
    const epsilonValues = [];
    const flipProbs = [];
    
    for (let e = 0.2; e <= 5; e += 0.3) {
        epsilonValues.push(e.toFixed(1));
        flipProbs.push(calculateFlipProbability(scenario, e));
    }
    
    const currentEpsilonIndex = Math.round((AppState.currentEpsilon - 0.2) / 0.3);
    const pointRadius = epsilonValues.map((_, i) => i === currentEpsilonIndex ? 6 : 2);
    const pointBgColors = epsilonValues.map((_, i) => 
        i === currentEpsilonIndex ? 'rgba(240, 180, 41, 1)' : 'rgba(251, 113, 133, 0.5)'
    );
    
    AppState.charts.flipProb = new Chart(ctx, {
        type: 'line',
        data: {
            labels: epsilonValues,
            datasets: [{
                label: 'Flip Probability (%)',
                data: flipProbs,
                borderColor: 'rgba(251, 113, 133, 0.8)',
                backgroundColor: 'rgba(251, 113, 133, 0.1)',
                fill: true,
                tension: 0.4,
                pointRadius: pointRadius,
                pointBackgroundColor: pointBgColors,
                pointBorderColor: 'transparent'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false },
                tooltip: {
                    callbacks: {
                        label: (context) => `${context.raw.toFixed(1)}% chance of wrong decision`
                    }
                }
            },
            scales: {
                x: {
                    title: { display: true, text: 'ε', color: '#6b7a96', font: { size: 9 } },
                    grid: { color: 'rgba(255,255,255,0.05)' },
                    ticks: { color: '#6b7a96', font: { size: 8 }, maxTicksLimit: 8 }
                },
                y: {
                    title: { display: true, text: 'Flip %', color: '#6b7a96', font: { size: 9 } },
                    grid: { color: 'rgba(255,255,255,0.05)' },
                    ticks: { color: '#6b7a96', font: { size: 8 }, maxTicksLimit: 5 },
                    min: 0,
                    max: 50
                }
            }
        }
    });
}

// ============================================
// SMALL MULTIPLES
// ============================================

function updateSmallMultiples(scenario) {
    updateMiniChart('errorVsEpsilon', 'Error vs ε', getErrorVsEpsilonData(scenario), 'rgba(240, 180, 41, 0.8)');
    updateMiniChart('confidenceVsEpsilon', 'Confidence vs ε', getConfidenceVsEpsilonData(scenario), 'rgba(45, 212, 191, 0.8)');
    updateMiniChart('harmVsEpsilon', 'Harm Risk vs ε', getHarmVsEpsilonData(scenario), 'rgba(251, 113, 133, 0.8)');
}

function updateMiniChart(canvasId, label, data, color) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    
    if (AppState.charts[canvasId]) {
        AppState.charts[canvasId].destroy();
    }
    
    AppState.charts[canvasId] = new Chart(ctx, {
        type: 'line',
        data: {
            labels: data.labels,
            datasets: [{
                data: data.values,
                borderColor: color,
                backgroundColor: color.replace('0.8', '0.1'),
                fill: true,
                tension: 0.4,
                pointRadius: 0
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: {
                x: { display: false },
                y: { display: false }
            }
        }
    });
}

function getErrorVsEpsilonData(scenario) {
    const labels = [];
    const values = [];
    for (let e = 0.1; e <= 5; e += 0.3) {
        labels.push(e.toFixed(1));
        values.push(calculateError(scenario, e));
    }
    return { labels, values };
}

function getConfidenceVsEpsilonData(scenario) {
    const labels = [];
    const values = [];
    for (let e = 0.1; e <= 5; e += 0.3) {
        labels.push(e.toFixed(1));
        const flipProb = calculateFlipProbability(scenario, e);
        values.push(100 - flipProb);
    }
    return { labels, values };
}

function getHarmVsEpsilonData(scenario) {
    const labels = [];
    const values = [];
    for (let e = 0.1; e <= 5; e += 0.3) {
        labels.push(e.toFixed(1));
        values.push(calculateFlipProbability(scenario, e));
    }
    return { labels, values };
}

// ============================================
// FLIP PROBABILITY DISPLAY
// ============================================

function updateFlipProbabilityDisplay(scenario, samples) {
    const threshold = scenario.threshold;
    const trueAbove = scenario.trueValue >= threshold;
    
    let flips = 0;
    samples.forEach(sample => {
        if ((sample >= threshold) !== trueAbove) flips++;
    });
    
    const flipProb = (flips / samples.length) * 100;
    
    const flipProbEl = document.getElementById('flipProbValue');
    if (flipProbEl) {
        flipProbEl.textContent = flipProb.toFixed(1) + '%';
        
        // Update color based on severity
        if (flipProb > 30) {
            flipProbEl.style.background = 'linear-gradient(135deg, #f87171, #fb7185)';
        } else if (flipProb > 15) {
            flipProbEl.style.background = 'linear-gradient(135deg, #fbbf24, #f0b429)';
        } else {
            flipProbEl.style.background = 'linear-gradient(135deg, #34d399, #2dd4bf)';
        }
        flipProbEl.style.webkitBackgroundClip = 'text';
        flipProbEl.style.webkitTextFillColor = 'transparent';
        flipProbEl.style.backgroundClip = 'text';
    }
}

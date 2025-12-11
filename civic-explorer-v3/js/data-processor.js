/**
 * Raw Data Processor for Differential Privacy Analysis
 * 
 * Converts raw civic data into DP-ready analysis format
 * Supports multiple data types: census, enrollment, health, voting
 */

const DataProcessor = {
    
    // Supported raw data formats
    formats: {
        census: {
            name: 'Census/Population Data',
            description: 'Individual or household records with demographic info',
            requiredFields: ['id'],
            optionalFields: ['age', 'income', 'household_size', 'location', 'race', 'gender'],
            aggregationType: 'count',
            example: 'id,age,income,household_size,location\n1,34,45000,3,district_A\n2,28,52000,2,district_A'
        },
        enrollment: {
            name: 'School Enrollment Data',
            description: 'Student records for funding eligibility',
            requiredFields: ['student_id'],
            optionalFields: ['school', 'grade', 'free_lunch_eligible', 'district', 'special_ed'],
            aggregationType: 'count',
            example: 'student_id,school,grade,free_lunch_eligible,district\nS001,Oak Elementary,3,yes,district_12\nS002,Oak Elementary,4,no,district_12'
        },
        health: {
            name: 'Health/Medical Data',
            description: 'Patient or population health records',
            requiredFields: ['record_id'],
            optionalFields: ['age', 'condition', 'facility', 'zip_code', 'visit_type'],
            aggregationType: 'count',
            example: 'record_id,age,condition,facility,zip_code\nR001,67,diabetes,clinic_north,90210\nR002,45,hypertension,clinic_north,90210'
        },
        voting: {
            name: 'Voter/Redistricting Data',
            description: 'Voter registration or population for redistricting',
            requiredFields: ['voter_id'],
            optionalFields: ['precinct', 'district', 'age', 'registration_date'],
            aggregationType: 'count',
            example: 'voter_id,precinct,district,age\nV00001,precinct_42,district_7,34\nV00002,precinct_42,district_7,56'
        },
        survey: {
            name: 'Survey Response Data',
            description: 'Survey or questionnaire responses',
            requiredFields: ['response_id'],
            optionalFields: ['question_1', 'question_2', 'question_3', 'region', 'timestamp'],
            aggregationType: 'count',
            example: 'response_id,question_1,question_2,region\nR1,yes,5,north\nR2,no,3,north'
        },
        custom: {
            name: 'Custom Data',
            description: 'Any tabular data with unique identifiers',
            requiredFields: ['id'],
            optionalFields: [],
            aggregationType: 'count',
            example: 'id,category,value,group\n1,A,100,group1\n2,B,150,group1'
        }
    },
    
    // Detect data format from headers
    detectFormat(headers) {
        const headerLower = headers.map(h => h.toLowerCase().trim());
        
        if (headerLower.some(h => h.includes('student') || h.includes('enrollment') || h.includes('grade'))) {
            return 'enrollment';
        }
        if (headerLower.some(h => h.includes('patient') || h.includes('condition') || h.includes('diagnosis'))) {
            return 'health';
        }
        if (headerLower.some(h => h.includes('voter') || h.includes('precinct') || h.includes('ballot'))) {
            return 'voting';
        }
        if (headerLower.some(h => h.includes('household') || h.includes('census') || h.includes('population'))) {
            return 'census';
        }
        if (headerLower.some(h => h.includes('response') || h.includes('survey') || h.includes('question'))) {
            return 'survey';
        }
        return 'custom';
    },
    
    // Parse CSV string into array of objects
    parseCSV(csvString) {
        const lines = csvString.trim().split('\n');
        if (lines.length < 2) {
            throw new Error('CSV must have at least a header row and one data row');
        }
        
        const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
        const data = [];
        
        for (let i = 1; i < lines.length; i++) {
            const values = this.parseCSVLine(lines[i]);
            if (values.length === headers.length) {
                const row = {};
                headers.forEach((header, idx) => {
                    row[header] = values[idx];
                });
                data.push(row);
            }
        }
        
        return { headers, data };
    },
    
    // Parse a single CSV line (handles quoted values)
    parseCSVLine(line) {
        const values = [];
        let current = '';
        let inQuotes = false;
        
        for (let i = 0; i < line.length; i++) {
            const char = line[i];
            if (char === '"') {
                inQuotes = !inQuotes;
            } else if (char === ',' && !inQuotes) {
                values.push(current.trim());
                current = '';
            } else {
                current += char;
            }
        }
        values.push(current.trim());
        
        return values;
    },
    
    // Aggregate raw data by a grouping field
    aggregate(data, groupByField = null, countField = null, filterFn = null) {
        let filteredData = data;
        
        // Apply filter if provided
        if (filterFn) {
            filteredData = data.filter(filterFn);
        }
        
        // If no grouping, return total count
        if (!groupByField) {
            return [{
                group: 'total',
                count: filteredData.length
            }];
        }
        
        // Group and count
        const groups = {};
        filteredData.forEach(row => {
            const key = row[groupByField] || 'unknown';
            if (!groups[key]) {
                groups[key] = 0;
            }
            groups[key]++;
        });
        
        return Object.entries(groups).map(([group, count]) => ({
            group,
            count
        }));
    },
    
    // Generate Laplace noise
    laplaceSample(scale) {
        const u = Math.random() - 0.5;
        return -scale * Math.sign(u) * Math.log(1 - 2 * Math.abs(u));
    },
    
    // Apply differential privacy to aggregated counts
    applyDP(aggregatedData, epsilon, sensitivity = 1) {
        const scale = sensitivity / epsilon;
        
        return aggregatedData.map(item => {
            const noise = this.laplaceSample(scale);
            const noisyCount = Math.max(0, Math.round(item.count + noise));
            
            return {
                ...item,
                true_value: item.count,
                noisy_value: noisyCount,
                noise_added: noisyCount - item.count,
                epsilon: epsilon,
                scale: scale
            };
        });
    },
    
    // Run full DP analysis with threshold comparison
    runAnalysis(data, config) {
        const {
            groupByField = null,
            filterField = null,
            filterValue = null,
            threshold,
            epsilonValues = [0.5, 1.0, 1.5, 2.0, 3.0, 4.0, 5.0],
            sensitivity = 1,
            samplesPerEpsilon = 100
        } = config;
        
        // Create filter function if specified
        let filterFn = null;
        if (filterField && filterValue !== null) {
            filterFn = (row) => {
                const val = row[filterField];
                if (typeof filterValue === 'string') {
                    return val && val.toLowerCase() === filterValue.toLowerCase();
                }
                return val == filterValue;
            };
        }
        
        // Aggregate the data
        const aggregated = this.aggregate(data, groupByField, null, filterFn);
        
        // Run DP simulations for each epsilon
        const results = [];
        
        aggregated.forEach(item => {
            epsilonValues.forEach(epsilon => {
                for (let i = 0; i < samplesPerEpsilon; i++) {
                    const dpResult = this.applyDP([item], epsilon, sensitivity)[0];
                    
                    const trueDecision = dpResult.true_value >= threshold ? 'approved' : 'denied';
                    const noisyDecision = dpResult.noisy_value >= threshold ? 'approved' : 'denied';
                    const flipFlag = trueDecision !== noisyDecision ? 1 : 0;
                    
                    results.push({
                        community_id: item.group,
                        epsilon: epsilon,
                        true_value: dpResult.true_value,
                        noisy_value: dpResult.noisy_value,
                        threshold: threshold,
                        decision: noisyDecision,
                        flip_flag: flipFlag,
                        sample_id: i + 1
                    });
                }
            });
        });
        
        return results;
    },
    
    // Calculate summary statistics from analysis results
    calculateStats(results) {
        const byEpsilon = {};
        
        results.forEach(r => {
            if (!byEpsilon[r.epsilon]) {
                byEpsilon[r.epsilon] = {
                    epsilon: r.epsilon,
                    samples: 0,
                    flips: 0,
                    totalError: 0,
                    true_value: r.true_value,
                    threshold: r.threshold
                };
            }
            byEpsilon[r.epsilon].samples++;
            byEpsilon[r.epsilon].flips += r.flip_flag;
            byEpsilon[r.epsilon].totalError += Math.abs(r.noisy_value - r.true_value);
        });
        
        return Object.values(byEpsilon).map(stat => ({
            epsilon: stat.epsilon,
            true_value: stat.true_value,
            threshold: stat.threshold,
            flip_probability: ((stat.flips / stat.samples) * 100).toFixed(2),
            avg_error: (stat.totalError / stat.samples).toFixed(2),
            error_percent: ((stat.totalError / stat.samples / stat.true_value) * 100).toFixed(2),
            confidence: (100 - (stat.flips / stat.samples) * 100).toFixed(2),
            samples: stat.samples
        }));
    },
    
    // Convert results to CSV format
    toCSV(results) {
        if (results.length === 0) return '';
        
        const headers = Object.keys(results[0]);
        const rows = results.map(r => headers.map(h => r[h]).join(','));
        
        return [headers.join(','), ...rows].join('\n');
    },
    
    // Generate analysis report
    generateReport(rawData, config, stats) {
        const trueValue = stats[0]?.true_value || 0;
        const threshold = stats[0]?.threshold || 0;
        const margin = ((trueValue - threshold) / threshold * 100).toFixed(1);
        const isAbove = trueValue >= threshold;
        
        return {
            summary: {
                total_records: rawData.length,
                true_count: trueValue,
                threshold: threshold,
                margin_from_threshold: `${margin}%`,
                true_decision: isAbove ? 'APPROVED' : 'DENIED'
            },
            risk_assessment: stats.map(s => ({
                epsilon: s.epsilon,
                flip_risk: s.flip_probability + '%',
                risk_level: parseFloat(s.flip_probability) > 30 ? 'HIGH' : 
                           parseFloat(s.flip_probability) > 15 ? 'MEDIUM' : 'LOW'
            })),
            recommendation: this.getRecommendation(stats, isAbove)
        };
    },
    
    // Get recommendation based on analysis
    getRecommendation(stats, isAbove) {
        const lowEpsilonRisk = parseFloat(stats.find(s => s.epsilon === 0.5)?.flip_probability || 0);
        const midEpsilonRisk = parseFloat(stats.find(s => s.epsilon === 1.0)?.flip_probability || 0);
        const highEpsilonRisk = parseFloat(stats.find(s => s.epsilon === 3.0)?.flip_probability || 0);
        
        if (highEpsilonRisk < 5) {
            return {
                status: 'STABLE',
                message: 'Decision is highly stable across privacy settings. Low risk of incorrect outcome.',
                suggested_epsilon: 'ε ≥ 1.0 recommended for balanced privacy-accuracy'
            };
        } else if (midEpsilonRisk < 15) {
            return {
                status: 'MODERATE',
                message: 'Decision is moderately stable. Some risk at high privacy settings.',
                suggested_epsilon: 'ε ≥ 2.0 recommended to reduce decision uncertainty'
            };
        } else {
            return {
                status: 'SENSITIVE',
                message: 'Value is close to threshold. High risk of incorrect decision due to DP noise.',
                suggested_epsilon: 'Consider ε ≥ 3.0 or review threshold margin'
            };
        }
    }
};

// Make available globally
window.DataProcessor = DataProcessor;

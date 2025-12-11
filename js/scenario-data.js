/**
 * ============================================
 * ENHANCED SCENARIO DATA
 * Conference-Ready Academic Content
 * Target: CHI, CSCW, FAccT, ICWSM, HCOMP
 * ============================================
 */

const enhancedScenarios = {
    
    // ========================================
    // SCENARIO 1: SCHOOL FUNDING
    // ========================================
    school: {
        id: 'school',
        icon: '🏫',
        title: 'School Funding Decision',
        tagline: 'When Privacy Noise Determines Educational Equity',
        
        // Full Narrative (6-8 lines)
        narrative: `In Jefferson County School District, the annual budget planning process hinges on a single number: the count of children from economically disadvantaged households. Under Title I of the Elementary and Secondary Education Act, school districts must demonstrate that at least 1,200 low-income children reside within their boundaries to qualify for federal education grants averaging $2,000–$2,400 per eligible student.

The district's true population includes 1,247 children meeting poverty criteria—a margin of just 47 students above the threshold. Before the 2020 Census adopted differential privacy protections, such borderline cases could be verified with reasonable confidence. Now, the Disclosure Avoidance System (DAS) introduces calibrated Laplace noise to protect individual respondents, creating a confidence interval that may span both sides of the critical 1,200-student mark.

Superintendent Maria Chen faces a troubling reality: her budget projections, staffing decisions, and program commitments all depend on data whose published uncertainty range crosses the funding eligibility boundary. The district cannot simply "wait and see"—Title I applications require demographic justification months before allocation decisions are finalized. A miscalculation in either direction carries severe consequences: over-projection may trigger audit findings and fund recovery demands; under-projection surrenders resources that children genuinely need.

The administrative burden extends beyond simple grant applications. Reading specialists, after-school programs, parent engagement coordinators, and summer learning initiatives all flow from Title I designation. When the foundational population count becomes probabilistic rather than deterministic, the entire programmatic infrastructure rests on statistical uncertainty.`,
        
        // Professional Context (2-3 lines)
        professionalContext: {
            role: 'District Superintendent',
            icon: '👩‍💼',
            description: `As a district superintendent, you review census-derived enrollment data each spring to complete Title I applications. The published count shows your district near the eligibility boundary, but the confidence interval provided alongside the point estimate reveals the true figure could fall 40–60 students in either direction. Your federal programs coordinator asks: "Do we budget for the grant or not?"`
        },
        
        // Civic Actors
        actors: [
            { icon: '👩‍💼', title: 'Superintendent', role: 'Budget authority & Title I applicant' },
            { icon: '📊', title: 'Data Analyst', role: 'Census data interpreter' },
            { icon: '🏛️', title: 'Federal Program Officer', role: 'Allocation decision-maker' },
            { icon: '👨‍👩‍👧‍👦', title: 'Community Families', role: 'Affected stakeholders' },
            { icon: '⚖️', title: 'State Auditor', role: 'Compliance verification' },
            { icon: '👨‍🏫', title: 'Program Coordinators', role: 'Service delivery staff' }
        ],
        
        // Legal/Statistical Framework
        legalFramework: [
            'Title I, ESEA',
            'ESSA (2015)',
            'Census Confidentiality (Title 13)',
            'OMB Disclosure Standards',
            'Education Department Guidelines',
            'Single Audit Act Requirements'
        ],
        
        // Decision Pressure
        pressure: {
            level: 78,
            label: 'High',
            description: 'High decision pressure: Annual funding cycle creates hard deadlines. Incorrect threshold determination affects staffing, programs, and multi-year planning. Appeals process is lengthy and uncertain. Audit findings can require fund repayment with interest.'
        },
        
        // Decision Flow Table
        decisionFlow: [
            {
                step: 1,
                stepLabel: 'Data Collection',
                input: 'Census household survey responses',
                dpEffect: 'Individual responses protected via bounded DP',
                risk: 'low',
                riskLabel: 'None',
                impact: 'Privacy guaranteed for respondents'
            },
            {
                step: 2,
                stepLabel: 'Aggregation',
                input: 'Block-level aggregation',
                dpEffect: 'Laplace noise added (ε-calibrated)',
                risk: 'low',
                riskLabel: 'Low',
                impact: 'Small-area estimates gain uncertainty'
            },
            {
                step: 3,
                stepLabel: 'Publication',
                input: 'District-level child poverty count',
                dpEffect: '±3-5% confidence interval',
                risk: 'medium',
                riskLabel: 'Medium',
                impact: 'Published count may cross 1,200 threshold'
            },
            {
                step: 4,
                stepLabel: 'Application',
                input: 'Title I application data field',
                dpEffect: 'Uncertainty propagates to eligibility',
                risk: 'high',
                riskLabel: 'High',
                impact: '$2.4M funding decision becomes probabilistic'
            },
            {
                step: 5,
                stepLabel: 'Decision',
                input: 'Federal allocation decision',
                dpEffect: 'Binary outcome from noisy input',
                risk: 'high',
                riskLabel: 'Critical',
                impact: 'District funded or denied based on noisy data'
            }
        ],
        
        // Civic Terminology
        terminology: [
            {
                term: 'Title I Eligibility',
                definition: 'Federal threshold requiring minimum low-income student count for education funding under ESEA.'
            },
            {
                term: 'Minimum Subgroup Size',
                definition: 'Statistical threshold below which data suppression may occur to prevent individual identification.'
            },
            {
                term: 'Formula Grant Allocation',
                definition: 'Funding distributed automatically based on demographic counts rather than competitive application.'
            },
            {
                term: 'Confidence Interval Overlap',
                definition: 'Condition where statistical uncertainty range spans both sides of a decision threshold.'
            },
            {
                term: 'Laplace Mechanism',
                definition: 'Differential privacy noise distribution calibrated to query sensitivity and privacy budget (ε).'
            },
            {
                term: 'Privacy Loss Budget (ε)',
                definition: 'Cumulative privacy expenditure across all queries; lower ε means stronger privacy but more noise.'
            },
            {
                term: 'Disclosure Avoidance System',
                definition: 'Census Bureau\'s implementation of differential privacy for 2020 Census products.'
            }
        ],
        
        // Creative Micro-Story
        microStory: {
            text: 'A superintendent stares at a spreadsheet where the DP-adjusted count swings between +38 and –27. A million-dollar decision hinges not on need—but on noise.',
            attribution: '— The uncertainty of civic data in the differential privacy era'
        },
        
        // Simulation Parameters
        simulation: {
            trueValue: 1247,
            threshold: 1200,
            sensitivity: 1,
            scale: 1,
            aboveOutcome: 'FUNDED — Title I grant approved ($2.4M annually)',
            belowOutcome: 'DENIED — Does not meet eligibility threshold'
        }
    },
    
    // ========================================
    // SCENARIO 2: RURAL CLINIC
    // ========================================
    hospital: {
        id: 'hospital',
        icon: '🏥',
        title: 'Rural Clinic Placement',
        tagline: 'Healthcare Access at the Mercy of Statistical Margins',
        
        narrative: `In Clearwater County, the nearest hospital lies 47 miles from the rural community of Pine Ridge. For years, residents have traveled over an hour for routine care, emergency services, and preventive screenings. When the county applied for Rural Health Clinic (RHC) designation through the Health Resources and Services Administration (HRSA), officials believed approval was finally within reach.

HRSA's Rural Health Clinic Program requires demonstration that a proposed service area contains at least 5,000 residents and meets specific healthcare shortage criteria. Pine Ridge's actual population stands at 4,850—just 150 residents below the threshold. Under pre-2020 census methodology, such borderline cases prompted additional verification or waiver consideration. The adoption of differential privacy has complicated this pathway.

The published census figure for Pine Ridge now carries a 95% confidence interval spanning roughly ±180 residents. This means the "true" published count could reasonably appear as high as 5,030 or as low as 4,670. For HRSA program officers, this creates an administratively awkward situation: the statistical evidence neither clearly qualifies nor definitively disqualifies the community. Meanwhile, the 4,850 residents continue driving 47 miles for a flu shot.

County Health Director James Whitehorse must decide whether to proceed with the application using the higher-bound estimate, wait for supplementary data sources, or explore alternative program pathways that may carry different population thresholds. Each option carries trade-offs in timeline, administrative burden, and probability of success.`,
        
        professionalContext: {
            role: 'County Health Director',
            icon: '👨‍⚕️',
            description: `As the County Health Director, you've spent two years building community support for a rural health clinic. The HRSA application requires population documentation from official census sources. When you pull the data, the point estimate shows 4,920—but the margin of error spans from 4,740 to 5,100. Your grant writer asks whether to cite the upper bound, the point estimate, or acknowledge the uncertainty explicitly.`
        },
        
        actors: [
            { icon: '👨‍⚕️', title: 'County Health Director', role: 'RHC application lead' },
            { icon: '🏛️', title: 'HRSA Regional Administrator', role: 'Designation authority' },
            { icon: '📋', title: 'Healthcare Policy Analyst', role: 'Eligibility assessment' },
            { icon: '👨‍👩‍👧', title: 'Rural Residents', role: 'Healthcare access stakeholders' },
            { icon: '🏥', title: 'Hospital Network', role: 'Potential service provider' },
            { icon: '💼', title: 'Healthcare Consultant', role: 'Application specialist' }
        ],
        
        legalFramework: [
            'Rural Health Clinics Act (1977)',
            'HRSA Program Guidelines',
            'Census Bureau DP Implementation',
            'Healthcare Shortage Area Designation',
            'Medicare/Medicaid Certification',
            'Critical Access Hospital Program'
        ],
        
        pressure: {
            level: 85,
            label: 'Very High',
            description: 'Very high decision pressure: Healthcare access directly impacts health outcomes and mortality rates. Application cycles occur annually with 12-18 month review periods. Denial may delay care access by 2+ years, affecting chronic disease management and emergency response times.'
        },
        
        decisionFlow: [
            {
                step: 1,
                stepLabel: 'Enumeration',
                input: 'Census enumeration in rural tract',
                dpEffect: 'DP noise amplified in sparse areas',
                risk: 'medium',
                riskLabel: 'Elevated',
                impact: 'Rural counts face proportionally larger error'
            },
            {
                step: 2,
                stepLabel: 'Boundary Definition',
                input: 'Service area boundary definition',
                dpEffect: 'Aggregation may reduce but not eliminate noise',
                risk: 'medium',
                riskLabel: 'Medium',
                impact: 'Geographic flexibility limited by data availability'
            },
            {
                step: 3,
                stepLabel: 'Threshold Check',
                input: 'Population threshold comparison',
                dpEffect: '±3-4% uncertainty near 5,000 boundary',
                risk: 'high',
                riskLabel: 'High',
                impact: 'Published count ambiguous relative to requirement'
            },
            {
                step: 4,
                stepLabel: 'HRSA Review',
                input: 'HRSA eligibility determination',
                dpEffect: 'Binary pass/fail from continuous estimate',
                risk: 'high',
                riskLabel: 'Critical',
                impact: 'Clinic approval or multi-year delay'
            },
            {
                step: 5,
                stepLabel: 'Community Impact',
                input: 'Healthcare access outcome',
                dpEffect: 'Downstream effect on care access',
                risk: 'high',
                riskLabel: 'Severe',
                impact: 'Healthcare desert persists or is addressed'
            }
        ],
        
        terminology: [
            {
                term: 'Rural Health Clinic (RHC)',
                definition: 'Federally designated facility eligible for enhanced Medicare/Medicaid reimbursement in underserved areas.'
            },
            {
                term: 'Healthcare Shortage Area (HPSA)',
                definition: 'Geographic region with insufficient primary care, dental, or mental health provider access.'
            },
            {
                term: 'Service Area Population',
                definition: 'Census-derived count used to determine program eligibility and service capacity planning.'
            },
            {
                term: 'Medically Underserved Area (MUA)',
                definition: 'Designation triggering eligibility for federal health programs based on provider ratios and demographic factors.'
            },
            {
                term: 'Statistical Disclosure Limitation',
                definition: 'Methods preventing identification of individuals in published aggregate data.'
            },
            {
                term: 'Small-Area Estimation',
                definition: 'Statistical techniques for producing reliable estimates for geographic units smaller than survey design.'
            }
        ],
        
        microStory: {
            text: 'A health director holds two numbers: 4,850 souls who need care, and 5,000—the bureaucratic line between a clinic and another decade of 47-mile drives.',
            attribution: '— Where statistical noise meets human health'
        },
        
        simulation: {
            trueValue: 4850,
            threshold: 5000,
            sensitivity: 1,
            scale: 1,
            aboveOutcome: 'APPROVED — Rural health clinic authorization granted',
            belowOutcome: 'DENIED — Population below minimum threshold for clinic approval'
        }
    },
    
    // ========================================
    // SCENARIO 3: REDISTRICTING
    // ========================================
    redistrict: {
        id: 'redistrict',
        icon: '🗳️',
        title: 'Congressional Redistricting',
        tagline: 'Democracy\'s Foundation Built on Uncertain Ground',
        
        narrative: `The Arizona Independent Redistricting Commission convenes every decade following census data release to redraw congressional district boundaries. Under the principle of "one person, one vote," districts must achieve population equality within strict tolerances—typically ±1% of the ideal district size. For the upcoming cycle, one rapidly growing region presents a pivotal question: does the Maricopa County eastern expansion zone warrant carving out an entirely new congressional district?

The region's true population stands at approximately 710,000 residents—10,000 above the 700,000 threshold that would justify an additional seat under the state's apportionment formula. At first glance, this margin appears comfortable. However, the Census Bureau's differential privacy implementation introduces uncertainty that, while proportionally small at this scale, still spans a range that includes the threshold.

Commissioner Rachel Torres faces competing pressures. Community advocates argue that the region's rapid growth demands increased representation. Incumbent representatives express concern that district reconfiguration could create electoral uncertainty. Legal counsel warns that any map drawn using contested population figures invites litigation. And the census data itself—the supposedly objective foundation for all these decisions—now comes with asterisks and confidence intervals.

The commission must adopt final maps within 18 months of data release. Appeals and legal challenges routinely extend to the election cycle itself, leaving voters uncertain which district they belong to until weeks before casting ballots. In extreme cases, courts have imposed their own maps when commissions fail to reach consensus—removing the decision from democratically accountable bodies entirely.`,
        
        professionalContext: {
            role: 'Redistricting Commissioner',
            icon: '⚖️',
            description: `As a redistricting commissioner, you review census block-level data to construct districts meeting equal population requirements. The data release includes both point estimates and uncertainty metrics. When you aggregate blocks for the contested region, the confidence interval spans from 695,000 to 725,000—meaning you cannot statistically confirm whether the threshold is met. Your legal team asks how to defend any map choice against inevitable court challenge.`
        },
        
        actors: [
            { icon: '⚖️', title: 'Redistricting Commissioner', role: 'Map approval authority' },
            { icon: '🗳️', title: 'Elections Director', role: 'Implementation coordinator' },
            { icon: '👨‍⚖️', title: 'Voting Rights Attorney', role: 'Legal compliance advisor' },
            { icon: '📊', title: 'Demographer', role: 'Population data analyst' },
            { icon: '🏛️', title: 'State Legislature', role: 'Oversight and appeals body' },
            { icon: '👥', title: 'Community Advocates', role: 'Representation stakeholders' }
        ],
        
        legalFramework: [
            '14th Amendment Equal Protection',
            'Voting Rights Act (Section 2)',
            'Reynolds v. Sims (1964)',
            'Census Redistricting Data Program (P.L. 94-171)',
            'State Apportionment Statutes',
            'Rucho v. Common Cause (2019)'
        ],
        
        pressure: {
            level: 92,
            label: 'Extreme',
            description: 'Extreme decision pressure: Constitutional requirements mandate population equality across districts. Maps face near-certain legal challenge from opposing parties. Uncertainty in base data provides grounds for litigation from multiple directions. Electoral consequences affect representation for a full decade.'
        },
        
        decisionFlow: [
            {
                step: 1,
                stepLabel: 'Census Count',
                input: 'Decennial census enumeration',
                dpEffect: 'Full-count data protected via TopDown Algorithm',
                risk: 'low',
                riskLabel: 'Controlled',
                impact: 'National totals constrained; local counts vary'
            },
            {
                step: 2,
                stepLabel: 'State Totals',
                input: 'State-level population for apportionment',
                dpEffect: 'Post-processing maintains state totals exactly',
                risk: 'low',
                riskLabel: 'Low',
                impact: 'Congressional seat allocation unaffected'
            },
            {
                step: 3,
                stepLabel: 'Block Aggregation',
                input: 'Census block data for district building',
                dpEffect: 'Block-level noise aggregates non-uniformly',
                risk: 'medium',
                riskLabel: 'Medium',
                impact: 'District totals carry compounded uncertainty'
            },
            {
                step: 4,
                stepLabel: 'Threshold Analysis',
                input: 'Regional population vs. seat threshold',
                dpEffect: '±1-2% uncertainty at 700K scale',
                risk: 'high',
                riskLabel: 'High',
                impact: 'Cannot confirm if region qualifies for new seat'
            },
            {
                step: 5,
                stepLabel: 'Map Adoption',
                input: 'Final district boundary decision',
                dpEffect: 'Legal vulnerability from data uncertainty',
                risk: 'high',
                riskLabel: 'Critical',
                impact: 'Map defended or overturned in court'
            }
        ],
        
        terminology: [
            {
                term: 'One Person, One Vote',
                definition: 'Constitutional principle requiring legislative districts to have substantially equal populations.'
            },
            {
                term: 'Apportionment',
                definition: 'Process of allocating congressional seats among states based on decennial census counts.'
            },
            {
                term: 'Malapportionment',
                definition: 'Constitutional violation when districts have unequal populations, diluting some voters\' influence.'
            },
            {
                term: 'P.L. 94-171 Data',
                definition: 'Census redistricting data file mandated by law for state legislative redistricting use.'
            },
            {
                term: 'TopDown Algorithm',
                definition: 'Census Bureau\'s hierarchical DP mechanism ensuring geographic consistency in noisy counts.'
            },
            {
                term: 'Population Deviation',
                definition: 'Percentage difference between a district\'s population and the ideal equal-population target.'
            },
            {
                term: 'Compactness',
                definition: 'Redistricting criterion measuring geographic regularity of district shapes.'
            }
        ],
        
        microStory: {
            text: 'A commissioner draws a line on a map, knowing the population figures beneath it carry margins of error larger than the margins of victory in the last three elections.',
            attribution: '— Democracy\'s new arithmetic'
        },
        
        simulation: {
            trueValue: 710000,
            threshold: 700000,
            sensitivity: 1000,
            scale: 1000,
            aboveOutcome: 'GAINS SEAT — Additional congressional representation awarded',
            belowOutcome: 'NO CHANGE — Does not qualify for additional seat'
        }
    }
};

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { enhancedScenarios };
}

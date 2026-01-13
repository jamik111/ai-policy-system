// ECOA (Equal Credit Opportunity Act) Compliance Validator
// Ensures credit decisions are free from discrimination based on protected classes

import {
    CreditScoringDecision,
    RegulatoryFramework,
    ComplianceViolation,
    ViolationSeverity,
    ProtectedAttributes
} from '../types';

/**
 * Protected classes under ECOA
 */
export enum ProtectedClass {
    RACE = 'RACE',
    COLOR = 'COLOR',
    RELIGION = 'RELIGION',
    NATIONAL_ORIGIN = 'NATIONAL_ORIGIN',
    SEX = 'SEX',
    MARITAL_STATUS = 'MARITAL_STATUS',
    AGE = 'AGE',
    PUBLIC_ASSISTANCE = 'PUBLIC_ASSISTANCE',
}

/**
 * Fairness metrics for bias detection
 */
export interface FairnessMetrics {
    overallApprovalRate: number;
    approvalRatesByGroup: Map<string, number>;
    disparateImpactRatio: number;
    statisticalParityDifference: number;
}

/**
 * ECOA Validation Result
 */
export interface ECOAValidationResult {
    isCompliant: boolean;
    violations: ComplianceViolation[];
    warnings: string[];
    fairnessMetrics?: FairnessMetrics;
}

/**
 * Cohort statistics for bias analysis
 */
export interface CohortStatistics {
    groupName: string;
    totalApplications: number;
    approvedCount: number;
    deniedCount: number;
    approvalRate: number;
}

/**
 * ECOA Validator Class
 * Validates credit decisions for fair lending and non-discrimination compliance
 */
export class ECOAValidator {
    // Disparate impact threshold (80% rule)
    private static readonly DISPARATE_IMPACT_THRESHOLD = 0.80;

    // Statistical parity threshold
    private static readonly STATISTICAL_PARITY_THRESHOLD = 0.10;

    /**
     * Validate a single credit decision for ECOA compliance
     */
    static validateDecision(decision: CreditScoringDecision): ECOAValidationResult {
        const violations: ComplianceViolation[] = [];
        const warnings: string[] = [];

        // 1. Ensure protected attributes are not used in decision factors
        const prohibitedFactorViolation = this.checkProhibitedFactors(decision);
        if (prohibitedFactorViolation) {
            violations.push(prohibitedFactorViolation);
        }

        // 2. Validate protected attribute monitoring is in place
        if (!decision.protectedAttributes) {
            warnings.push('Protected attributes not monitored - fairness analysis not possible');
        }

        // 3. Check for age-based discrimination
        const ageViolation = this.checkAgeDiscrimination(decision);
        if (ageViolation) {
            violations.push(ageViolation);
        }

        // 4. Check for marital status discrimination
        const maritalViolation = this.checkMaritalStatusDiscrimination(decision);
        if (maritalViolation) {
            violations.push(maritalViolation);
        }

        return {
            isCompliant: violations.length === 0,
            violations,
            warnings,
        };
    }

    /**
     * Analyze a batch of credit decisions for disparate impact
     * This is the key fair lending analysis required by ECOA
     */
    static analyzeDisparateImpact(
        decisions: CreditScoringDecision[],
        protectedAttribute: keyof ProtectedAttributes
    ): ECOAValidationResult {
        const violations: ComplianceViolation[] = [];
        const warnings: string[] = [];

        // Group decisions by protected attribute
        const groups = this.groupByAttribute(decisions, protectedAttribute);

        if (groups.size < 2) {
            warnings.push(`Insufficient diversity in ${protectedAttribute} for disparate impact analysis`);
            return { isCompliant: true, violations, warnings };
        }

        // Calculate approval rates by group
        const cohortStats: CohortStatistics[] = [];
        for (const [groupName, groupDecisions] of groups) {
            const approved = groupDecisions.filter(d => d.decision === 'APPROVED').length;
            const denied = groupDecisions.filter(d => d.decision === 'DENIED').length;
            const total = approved + denied;

            cohortStats.push({
                groupName,
                totalApplications: total,
                approvedCount: approved,
                deniedCount: denied,
                approvalRate: total > 0 ? approved / total : 0,
            });
        }

        // Find the group with highest approval rate (majority group)
        const sortedCohorts = [...cohortStats].sort((a, b) => b.approvalRate - a.approvalRate);
        const majorityRate = sortedCohorts[0].approvalRate;

        // Check disparate impact for each group
        for (const cohort of cohortStats) {
            if (majorityRate === 0) continue;

            const impactRatio = cohort.approvalRate / majorityRate;

            if (impactRatio < this.DISPARATE_IMPACT_THRESHOLD) {
                violations.push({
                    violationId: `ECOA-DI-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                    agentId: decisions[0]?.agentId || 'BATCH',
                    framework: RegulatoryFramework.ECOA,
                    severity: 'CRITICAL',
                    ruleId: 'ECOA-DISP-001',
                    ruleName: 'Disparate Impact Detected',
                    description: `Disparate impact detected for ${protectedAttribute}="${cohort.groupName}": ` +
                        `Impact ratio ${(impactRatio * 100).toFixed(1)}% is below 80% threshold`,
                    context: {
                        protectedAttribute,
                        groupName: cohort.groupName,
                        groupApprovalRate: cohort.approvalRate,
                        majorityApprovalRate: majorityRate,
                        impactRatio,
                        totalApplications: cohort.totalApplications,
                    },
                    sourceType: 'OTHER',
                    sourceId: 'BATCH_ANALYSIS',
                    status: 'OPEN',
                    createdAt: Date.now(),
                });
            }
        }

        // Calculate fairness metrics
        const approvalRatesByGroup = new Map(cohortStats.map(c => [c.groupName, c.approvalRate]));
        const rates = cohortStats.map(c => c.approvalRate);
        const disparateImpactRatio = Math.min(...rates) / Math.max(...rates);
        const statisticalParityDiff = Math.max(...rates) - Math.min(...rates);

        const fairnessMetrics: FairnessMetrics = {
            overallApprovalRate: decisions.filter(d => d.decision === 'APPROVED').length / decisions.length,
            approvalRatesByGroup,
            disparateImpactRatio,
            statisticalParityDifference: statisticalParityDiff,
        };

        if (statisticalParityDiff > this.STATISTICAL_PARITY_THRESHOLD) {
            warnings.push(
                `Statistical parity difference (${(statisticalParityDiff * 100).toFixed(1)}%) ` +
                `exceeds recommended threshold (${this.STATISTICAL_PARITY_THRESHOLD * 100}%)`
            );
        }

        return {
            isCompliant: violations.length === 0,
            violations,
            warnings,
            fairnessMetrics,
        };
    }

    /**
     * Check if prohibited factors are used in credit decision
     */
    private static checkProhibitedFactors(decision: CreditScoringDecision): ComplianceViolation | null {
        const prohibitedTerms = [
            'race', 'color', 'religion', 'national origin', 'nationality',
            'sex', 'gender', 'marital status', 'married', 'single', 'divorced',
            'welfare', 'public assistance', 'food stamps',
        ];

        for (const factor of decision.primaryFactors) {
            const factorLower = factor.factor.toLowerCase();
            for (const term of prohibitedTerms) {
                if (factorLower.includes(term)) {
                    return {
                        violationId: `ECOA-FACTOR-${Date.now()}`,
                        agentId: decision.agentId,
                        framework: RegulatoryFramework.ECOA,
                        severity: 'CRITICAL',
                        ruleId: 'ECOA-PROH-001',
                        ruleName: 'Prohibited Factor in Decision',
                        description: `Credit decision factor "${factor.factor}" appears to reference prohibited class: ${term}`,
                        context: {
                            decisionId: decision.decisionId,
                            factor: factor.factor,
                            prohibitedTerm: term,
                        },
                        sourceType: 'CREDIT_DECISION',
                        sourceId: decision.decisionId,
                        status: 'OPEN',
                        createdAt: Date.now(),
                    };
                }
            }
        }

        return null;
    }

    /**
     * Check for potential age discrimination
     * ECOA prohibits discrimination against applicants 62 or older
     */
    private static checkAgeDiscrimination(decision: CreditScoringDecision): ComplianceViolation | null {
        const age = decision.protectedAttributes?.age;

        if (age && age >= 62 && decision.decision === 'DENIED') {
            // Check if any factor references age negatively
            const ageFactors = decision.primaryFactors.filter(
                f => f.factor.toLowerCase().includes('age') && f.impact === 'NEGATIVE'
            );

            if (ageFactors.length > 0) {
                return {
                    violationId: `ECOA-AGE-${Date.now()}`,
                    agentId: decision.agentId,
                    framework: RegulatoryFramework.ECOA,
                    severity: 'CRITICAL',
                    ruleId: 'ECOA-AGE-001',
                    ruleName: 'Potential Age Discrimination',
                    description: `Applicant age (${age}) is 62+ and denied with negative age-related factors`,
                    context: {
                        decisionId: decision.decisionId,
                        applicantAge: age,
                        ageFactors: ageFactors.map(f => f.factor),
                    },
                    sourceType: 'CREDIT_DECISION',
                    sourceId: decision.decisionId,
                    status: 'OPEN',
                    createdAt: Date.now(),
                };
            }
        }

        return null;
    }

    /**
     * Check for marital status discrimination
     */
    private static checkMaritalStatusDiscrimination(decision: CreditScoringDecision): ComplianceViolation | null {
        const maritalFactors = decision.primaryFactors.filter(
            f => f.factor.toLowerCase().includes('marital') ||
                f.factor.toLowerCase().includes('married') ||
                f.factor.toLowerCase().includes('spouse')
        );

        if (maritalFactors.length > 0 && maritalFactors.some(f => f.impact === 'NEGATIVE')) {
            return {
                violationId: `ECOA-MARITAL-${Date.now()}`,
                agentId: decision.agentId,
                framework: RegulatoryFramework.ECOA,
                severity: 'CRITICAL',
                ruleId: 'ECOA-MARITAL-001',
                ruleName: 'Marital Status Discrimination',
                description: 'Credit decision includes negative marital status-related factors',
                context: {
                    decisionId: decision.decisionId,
                    maritalFactors: maritalFactors.map(f => f.factor),
                },
                sourceType: 'CREDIT_DECISION',
                sourceId: decision.decisionId,
                status: 'OPEN',
                createdAt: Date.now(),
            };
        }

        return null;
    }

    /**
     * Helper: Group decisions by protected attribute
     */
    private static groupByAttribute(
        decisions: CreditScoringDecision[],
        attribute: keyof ProtectedAttributes
    ): Map<string, CreditScoringDecision[]> {
        const groups = new Map<string, CreditScoringDecision[]>();

        for (const decision of decisions) {
            const value = decision.protectedAttributes?.[attribute];
            if (value !== undefined) {
                const key = String(value);
                if (!groups.has(key)) {
                    groups.set(key, []);
                }
                groups.get(key)!.push(decision);
            }
        }

        return groups;
    }

    /**
     * Generate fair lending report
     */
    static generateFairLendingReport(decisions: CreditScoringDecision[]): {
        summary: string;
        metrics: Record<string, FairnessMetrics>;
        recommendations: string[];
    } {
        const attributes: (keyof ProtectedAttributes)[] = ['race', 'gender', 'age'];
        const metrics: Record<string, FairnessMetrics> = {};
        const recommendations: string[] = [];

        for (const attr of attributes) {
            const result = this.analyzeDisparateImpact(decisions, attr);
            if (result.fairnessMetrics) {
                metrics[attr] = result.fairnessMetrics;

                if (result.fairnessMetrics.disparateImpactRatio < this.DISPARATE_IMPACT_THRESHOLD) {
                    recommendations.push(
                        `Review ${attr}-based disparate impact (ratio: ${(result.fairnessMetrics.disparateImpactRatio * 100).toFixed(1)}%)`
                    );
                }
            }
        }

        const overallApprovalRate = decisions.filter(d => d.decision === 'APPROVED').length / decisions.length;

        return {
            summary: `Analyzed ${decisions.length} credit decisions. Overall approval rate: ${(overallApprovalRate * 100).toFixed(1)}%`,
            metrics,
            recommendations,
        };
    }
}

// FCRA (Fair Credit Reporting Act) Compliance Validator
// Ensures credit scoring AI complies with federal credit reporting regulations

import {
    CreditScoringDecision,
    RegulatoryFramework,
    ComplianceViolation,
    ViolationSeverity,
    DecisionFactor
} from '../types';

/**
 * FCRA Adverse Action Reason Codes
 * Standard reason codes for credit denials per FCRA requirements
 */
export enum AdverseActionCode {
    CREDIT_SCORE_TOO_LOW = 'AA001',
    INSUFFICIENT_CREDIT_HISTORY = 'AA002',
    HIGH_DEBT_TO_INCOME = 'AA003',
    RECENT_DELINQUENCY = 'AA004',
    TOO_MANY_INQUIRIES = 'AA005',
    BANKRUPTCY_ON_FILE = 'AA006',
    INSUFFICIENT_INCOME = 'AA007',
    EMPLOYMENT_INSTABILITY = 'AA008',
    EXCESSIVE_OBLIGATIONS = 'AA009',
    COLLECTION_ACCOUNTS = 'AA010',
}

/**
 * Human-readable adverse action reasons
 */
export const ADVERSE_ACTION_REASONS: Record<AdverseActionCode, string> = {
    [AdverseActionCode.CREDIT_SCORE_TOO_LOW]: 'Credit score does not meet minimum requirements',
    [AdverseActionCode.INSUFFICIENT_CREDIT_HISTORY]: 'Insufficient credit history length',
    [AdverseActionCode.HIGH_DEBT_TO_INCOME]: 'Debt-to-income ratio exceeds guidelines',
    [AdverseActionCode.RECENT_DELINQUENCY]: 'Recent late payments or delinquencies on credit report',
    [AdverseActionCode.TOO_MANY_INQUIRIES]: 'Too many recent credit inquiries',
    [AdverseActionCode.BANKRUPTCY_ON_FILE]: 'Bankruptcy appears on credit report',
    [AdverseActionCode.INSUFFICIENT_INCOME]: 'Income does not meet minimum requirements',
    [AdverseActionCode.EMPLOYMENT_INSTABILITY]: 'Employment history indicates instability',
    [AdverseActionCode.EXCESSIVE_OBLIGATIONS]: 'Existing financial obligations are too high',
    [AdverseActionCode.COLLECTION_ACCOUNTS]: 'Collection accounts appear on credit report',
};

/**
 * FCRA Validation Result
 */
export interface FCRAValidationResult {
    isCompliant: boolean;
    violations: ComplianceViolation[];
    warnings: string[];
    recommendations: string[];
}

/**
 * FCRA Validator Class
 * Validates credit scoring decisions against FCRA requirements
 */
export class FCRAValidator {
    private static readonly MIN_EXPLANATION_FACTORS = 4;
    private static readonly ADVERSE_ACTION_NOTICE_DAYS = 30;

    /**
     * Validate a credit scoring decision for FCRA compliance
     */
    static validate(decision: CreditScoringDecision): FCRAValidationResult {
        const violations: ComplianceViolation[] = [];
        const warnings: string[] = [];
        const recommendations: string[] = [];

        // 1. Validate explainability requirements
        const explainabilityViolations = this.validateExplainability(decision);
        violations.push(...explainabilityViolations);

        // 2. Validate adverse action requirements for denials
        if (decision.decision === 'DENIED') {
            const adverseActionViolations = this.validateAdverseAction(decision);
            violations.push(...adverseActionViolations);
        }

        // 3. Validate model version documentation
        if (!decision.modelVersion || !decision.modelName) {
            warnings.push('Model version or name not documented - required for audits');
        }

        // 4. Check for human review requirement
        if (decision.humanReviewRequired && !decision.reviewedBy) {
            violations.push(this.createViolation(
                decision,
                'FCRA-REVIEW-001',
                'Required Human Review Not Completed',
                'Decision flagged for human review but no reviewer documented',
                'VIOLATION'
            ));
        }

        // 5. Validate credit score usage
        if (decision.creditScore < 300 || decision.creditScore > 850) {
            warnings.push(`Unusual credit score value: ${decision.creditScore} (expected 300-850)`);
        }

        // 6. Recommendations
        if (decision.decision === 'DENIED' && decision.primaryFactors.length < 5) {
            recommendations.push('Consider providing more detailed explanation factors for denied applications');
        }

        return {
            isCompliant: violations.length === 0,
            violations,
            warnings,
            recommendations,
        };
    }

    /**
     * Validate explainability requirements
     * FCRA requires clear explanation of factors affecting credit decisions
     */
    private static validateExplainability(decision: CreditScoringDecision): ComplianceViolation[] {
        const violations: ComplianceViolation[] = [];

        // Must have primary factors documented
        if (!decision.primaryFactors || decision.primaryFactors.length === 0) {
            violations.push(this.createViolation(
                decision,
                'FCRA-EXPL-001',
                'Missing Decision Factors',
                'No primary factors documented for credit decision',
                'CRITICAL'
            ));
            return violations;
        }

        // For denials, minimum 4 factors required
        if (decision.decision === 'DENIED' && decision.primaryFactors.length < this.MIN_EXPLANATION_FACTORS) {
            violations.push(this.createViolation(
                decision,
                'FCRA-EXPL-002',
                'Insufficient Explanation Factors',
                `Denied decision has ${decision.primaryFactors.length} factors, minimum ${this.MIN_EXPLANATION_FACTORS} required`,
                'VIOLATION'
            ));
        }

        // Validate factor structure
        for (const factor of decision.primaryFactors) {
            if (!factor.factor || factor.weight === undefined) {
                violations.push(this.createViolation(
                    decision,
                    'FCRA-EXPL-003',
                    'Invalid Factor Structure',
                    'Decision factor missing required fields (factor name or weight)',
                    'VIOLATION'
                ));
                break;
            }
        }

        // Check that negative factors are present for denials
        if (decision.decision === 'DENIED') {
            const negativeFactors = decision.primaryFactors.filter(f => f.impact === 'NEGATIVE');
            if (negativeFactors.length === 0) {
                violations.push(this.createViolation(
                    decision,
                    'FCRA-EXPL-004',
                    'No Negative Factors for Denial',
                    'Denied decision must include negative factors that led to denial',
                    'VIOLATION'
                ));
            }
        }

        return violations;
    }

    /**
     * Validate adverse action requirements for credit denials
     */
    private static validateAdverseAction(decision: CreditScoringDecision): ComplianceViolation[] {
        const violations: ComplianceViolation[] = [];

        // Adverse action code required for denials
        if (!decision.adverseActionCode) {
            violations.push(this.createViolation(
                decision,
                'FCRA-ADV-001',
                'Missing Adverse Action Code',
                'Denied decision must include adverse action code',
                'CRITICAL'
            ));
        }

        // Adverse action reason required for denials
        if (!decision.adverseActionReason) {
            violations.push(this.createViolation(
                decision,
                'FCRA-ADV-002',
                'Missing Adverse Action Reason',
                'Denied decision must include human-readable adverse action reason',
                'CRITICAL'
            ));
        }

        // Validate adverse action code is valid
        if (decision.adverseActionCode) {
            const validCodes = Object.values(AdverseActionCode);
            if (!validCodes.includes(decision.adverseActionCode as AdverseActionCode)) {
                violations.push(this.createViolation(
                    decision,
                    'FCRA-ADV-003',
                    'Invalid Adverse Action Code',
                    `Adverse action code "${decision.adverseActionCode}" is not a recognized FCRA code`,
                    'WARNING'
                ));
            }
        }

        return violations;
    }

    /**
     * Generate adverse action notice data
     * Helper function to create FCRA-compliant adverse action notices
     */
    static generateAdverseActionNotice(decision: CreditScoringDecision): {
        code: string;
        reason: string;
        factors: string[];
        rightsNotice: string;
    } {
        const topNegativeFactors = decision.primaryFactors
            .filter(f => f.impact === 'NEGATIVE')
            .sort((a, b) => b.weight - a.weight)
            .slice(0, 4)
            .map(f => f.description || f.factor);

        return {
            code: decision.adverseActionCode || 'UNKNOWN',
            reason: decision.adverseActionReason || 'Application did not meet approval criteria',
            factors: topNegativeFactors,
            rightsNotice: this.getCreditRightsNotice(),
        };
    }

    /**
     * Get standard FCRA credit rights notice
     */
    private static getCreditRightsNotice(): string {
        return `You have the right to:
1. Obtain a free copy of your credit report from the credit bureau(s) within 60 days
2. Dispute any inaccurate information in your credit report
3. Request the creditor reconsider their decision if your situation has changed
4. Contact the Consumer Financial Protection Bureau with any complaints

For more information, visit: www.consumerfinance.gov/learnmore`;
    }

    /**
     * Validate consumer dispute handling
     */
    static validateDisputeResponse(
        originalDecision: CreditScoringDecision,
        disputeReason: string,
        responseTime: number
    ): { isCompliant: boolean; issues: string[] } {
        const issues: string[] = [];
        const MAX_RESPONSE_DAYS = 30;

        const daysSinceDecision = (Date.now() - originalDecision.createdAt) / (1000 * 60 * 60 * 24);

        if (responseTime > MAX_RESPONSE_DAYS) {
            issues.push(`Response time exceeded ${MAX_RESPONSE_DAYS} days requirement`);
        }

        if (!disputeReason || disputeReason.length < 10) {
            issues.push('Dispute reason not adequately documented');
        }

        return {
            isCompliant: issues.length === 0,
            issues,
        };
    }

    /**
     * Helper: Create a compliance violation record
     */
    private static createViolation(
        decision: CreditScoringDecision,
        ruleId: string,
        ruleName: string,
        description: string,
        severity: ViolationSeverity
    ): ComplianceViolation {
        return {
            violationId: `${ruleId}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            agentId: decision.agentId,
            framework: RegulatoryFramework.FCRA,
            severity,
            ruleId,
            ruleName,
            description,
            context: {
                decisionId: decision.decisionId,
                applicantId: decision.applicantId,
                decision: decision.decision,
                modelVersion: decision.modelVersion,
            },
            sourceType: 'CREDIT_DECISION',
            sourceId: decision.decisionId,
            status: 'OPEN',
            createdAt: Date.now(),
        };
    }
}

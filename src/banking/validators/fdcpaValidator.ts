// FDCPA (Fair Debt Collection Practices Act) Compliance Validator
// Ensures loan recovery agents comply with federal debt collection regulations

import {
    LoanRecoveryCall,
    RegulatoryFramework,
    ComplianceViolation,
    ViolationSeverity
} from '../types';

/**
 * FDCPA prohibited language patterns
 * Debt collectors are prohibited from using threatening, harassing, or abusive language
 */
const PROHIBITED_LANGUAGE_PATTERNS: RegExp[] = [
    /threat(en|ening|s)?/i,
    /lawsuit|legal action|sue you/i,
    /arrest|jail|prison|warrant/i,
    /garnish(ment)?|wage garnishment/i,
    /destroy your credit/i,
    /tell your (employer|family|friends)/i,
    /you('re| are) (a )?liar/i,
    /deadbeat|loser|scam/i,
    /we('ll| will) (come to|visit) your (home|house|workplace)/i,
    /violence|hurt you/i,
];

/**
 * Required disclosure phrases that must be included in collection calls
 */
const REQUIRED_DISCLOSURES = [
    'debt collector',
    'collecting a debt',
    'any information obtained will be used for that purpose',
];

/**
 * FDCPA Validation Result
 */
export interface FDCPAValidationResult {
    isCompliant: boolean;
    violations: ComplianceViolation[];
    warnings: string[];
}

/**
 * FDCPA Call Context for validation
 */
export interface FDCPACallContext {
    callTime: Date;
    borrowerTimezone: string;
    callsToday: number;
    callsThisWeek: number;
    transcript?: string;
    hasDisclosure: boolean;
}

/**
 * FDCPA Validator Class
 * Validates loan recovery calls against FDCPA requirements
 */
export class FDCPAValidator {
    private static readonly MAX_CALLS_PER_DAY = 7;
    private static readonly MAX_CALLS_PER_WEEK = 21;
    private static readonly CALL_START_HOUR = 8;  // 8 AM
    private static readonly CALL_END_HOUR = 21;   // 9 PM

    /**
     * Validate a loan recovery call for FDCPA compliance
     */
    static validate(call: LoanRecoveryCall, context: FDCPACallContext): FDCPAValidationResult {
        const violations: ComplianceViolation[] = [];
        const warnings: string[] = [];

        // 1. Validate call time restrictions
        const timeViolation = this.validateCallTime(call, context);
        if (timeViolation) {
            violations.push(timeViolation);
        }

        // 2. Validate call frequency
        const frequencyViolations = this.validateCallFrequency(call, context);
        violations.push(...frequencyViolations);

        // 3. Validate transcript for prohibited language
        if (call.transcript) {
            const languageViolations = this.validateTranscript(call);
            violations.push(...languageViolations);
        }

        // 4. Validate required disclosures
        const disclosureViolation = this.validateDisclosure(call, context);
        if (disclosureViolation) {
            if (disclosureViolation.severity === 'WARNING') {
                warnings.push(disclosureViolation.description);
            } else {
                violations.push(disclosureViolation);
            }
        }

        // 5. Check for hostile sentiment
        if (call.sentiment === 'HOSTILE') {
            warnings.push('Call marked with hostile sentiment - review recommended');
        }

        return {
            isCompliant: violations.length === 0,
            violations,
            warnings,
        };
    }

    /**
     * Validate call time is within FDCPA allowed hours (8 AM - 9 PM borrower local time)
     */
    private static validateCallTime(
        call: LoanRecoveryCall,
        context: FDCPACallContext
    ): ComplianceViolation | null {
        const callDate = new Date(call.startTime);
        const hour = this.getHourInTimezone(callDate, context.borrowerTimezone);

        if (hour < this.CALL_START_HOUR || hour >= this.CALL_END_HOUR) {
            return this.createViolation(
                call,
                'FDCPA-TIME-001',
                'Call Time Violation',
                `Call placed at ${hour}:00 ${context.borrowerTimezone}, outside allowed hours (8 AM - 9 PM)`,
                'VIOLATION'
            );
        }

        return null;
    }

    /**
     * Validate call frequency limits
     */
    private static validateCallFrequency(
        call: LoanRecoveryCall,
        context: FDCPACallContext
    ): ComplianceViolation[] {
        const violations: ComplianceViolation[] = [];

        if (context.callsToday >= this.MAX_CALLS_PER_DAY) {
            violations.push(this.createViolation(
                call,
                'FDCPA-FREQ-001',
                'Daily Call Limit Exceeded',
                `Daily call limit exceeded: ${context.callsToday} calls today (max: ${this.MAX_CALLS_PER_DAY})`,
                'VIOLATION'
            ));
        }

        if (context.callsThisWeek >= this.MAX_CALLS_PER_WEEK) {
            violations.push(this.createViolation(
                call,
                'FDCPA-FREQ-002',
                'Weekly Call Limit Exceeded',
                `Weekly call limit exceeded: ${context.callsThisWeek} calls this week (max: ${this.MAX_CALLS_PER_WEEK})`,
                'VIOLATION'
            ));
        }

        return violations;
    }

    /**
     * Validate transcript for prohibited language
     */
    private static validateTranscript(call: LoanRecoveryCall): ComplianceViolation[] {
        const violations: ComplianceViolation[] = [];
        const transcript = call.transcript || '';

        for (const pattern of PROHIBITED_LANGUAGE_PATTERNS) {
            const match = transcript.match(pattern);
            if (match) {
                violations.push(this.createViolation(
                    call,
                    'FDCPA-LANG-001',
                    'Prohibited Language Detected',
                    `Prohibited language detected in transcript: "${match[0]}"`,
                    'CRITICAL',
                    { matchedPattern: pattern.source, matchedText: match[0] }
                ));
            }
        }

        return violations;
    }

    /**
     * Validate required disclosures were made
     */
    private static validateDisclosure(
        call: LoanRecoveryCall,
        context: FDCPACallContext
    ): ComplianceViolation | null {
        if (!context.hasDisclosure) {
            return this.createViolation(
                call,
                'FDCPA-DISC-001',
                'Missing Required Disclosure',
                'Required FDCPA disclosure not provided during call',
                'VIOLATION'
            );
        }

        // If we have transcript, verify disclosure language
        if (call.transcript) {
            const hasDisclosurePhrase = REQUIRED_DISCLOSURES.some(
                phrase => call.transcript!.toLowerCase().includes(phrase.toLowerCase())
            );

            if (!hasDisclosurePhrase) {
                return {
                    violationId: `WARN-${Date.now()}`,
                    agentId: call.agentId,
                    framework: RegulatoryFramework.FDCPA,
                    severity: 'WARNING' as ViolationSeverity,
                    ruleId: 'FDCPA-DISC-002',
                    ruleName: 'Disclosure Verification Warning',
                    description: 'Standard disclosure phrases not found in transcript - manual review recommended',
                    context: {},
                    sourceType: 'CALL',
                    sourceId: call.callId,
                    status: 'OPEN',
                    createdAt: Date.now(),
                };
            }
        }

        return null;
    }

    /**
     * Pre-call validation - check if a call can be made
     */
    static canMakeCall(
        agentId: string,
        borrowerTimezone: string,
        callsToday: number,
        callsThisWeek: number
    ): { allowed: boolean; reason?: string } {
        const now = new Date();
        const hour = this.getHourInTimezone(now, borrowerTimezone);

        if (hour < this.CALL_START_HOUR || hour >= this.CALL_END_HOUR) {
            return {
                allowed: false,
                reason: `Current time (${hour}:00) is outside FDCPA allowed hours (8 AM - 9 PM)`
            };
        }

        if (callsToday >= this.MAX_CALLS_PER_DAY) {
            return {
                allowed: false,
                reason: `Daily call limit reached (${callsToday}/${this.MAX_CALLS_PER_DAY})`
            };
        }

        if (callsThisWeek >= this.MAX_CALLS_PER_WEEK) {
            return {
                allowed: false,
                reason: `Weekly call limit reached (${callsThisWeek}/${this.MAX_CALLS_PER_WEEK})`
            };
        }

        return { allowed: true };
    }

    /**
     * Helper: Get hour in specified timezone
     */
    private static getHourInTimezone(date: Date, timezone: string): number {
        try {
            const formatted = date.toLocaleString('en-US', {
                timeZone: timezone,
                hour: 'numeric',
                hour12: false
            });
            return parseInt(formatted, 10);
        } catch {
            // Fallback to UTC if timezone is invalid
            return date.getUTCHours();
        }
    }

    /**
     * Helper: Create a compliance violation record
     */
    private static createViolation(
        call: LoanRecoveryCall,
        ruleId: string,
        ruleName: string,
        description: string,
        severity: ViolationSeverity,
        additionalContext: Record<string, unknown> = {}
    ): ComplianceViolation {
        return {
            violationId: `${ruleId}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            agentId: call.agentId,
            framework: RegulatoryFramework.FDCPA,
            severity,
            ruleId,
            ruleName,
            description,
            context: {
                callId: call.callId,
                borrowerId: call.borrowerId,
                loanId: call.loanId,
                ...additionalContext,
            },
            sourceType: 'CALL',
            sourceId: call.callId,
            status: 'OPEN',
            createdAt: Date.now(),
        };
    }
}

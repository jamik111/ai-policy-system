// Banking-specific agent classifications for AI Governance Platform
// Axiom Banking Edition - Purpose-built governance for financial AI agents

/**
 * Classification of Banking AI Agents
 * Each type has different regulatory requirements and compliance frameworks
 */
export enum BankingAgentType {
    // Collections & Recovery
    LOAN_RECOVERY_VOICE = 'LOAN_RECOVERY_VOICE',           // Voice AI calling borrowers
    LOAN_RECOVERY_SMS = 'LOAN_RECOVERY_SMS',               // SMS-based collections
    LOAN_RECOVERY_EMAIL = 'LOAN_RECOVERY_EMAIL',           // Email outreach

    // Credit & Underwriting
    CREDIT_SCORING = 'CREDIT_SCORING',                     // Credit decision AI
    LOAN_UNDERWRITING = 'LOAN_UNDERWRITING',               // Loan approval AI
    FRAUD_DETECTION = 'FRAUD_DETECTION',                   // Transaction monitoring

    // Customer Service
    CUSTOMER_SERVICE_CHAT = 'CUSTOMER_SERVICE_CHAT',       // Banking chatbot
    VIRTUAL_ASSISTANT = 'VIRTUAL_ASSISTANT',               // Voice banking assistant

    // Risk & Compliance
    AML_MONITORING = 'AML_MONITORING',                     // Anti-money laundering
    KYC_VERIFICATION = 'KYC_VERIFICATION',                 // Know Your Customer
}

/**
 * Regulatory frameworks applicable to banking AI agents
 * Agents may be subject to multiple frameworks
 */
export enum RegulatoryFramework {
    FDCPA = 'FDCPA',           // Fair Debt Collection Practices Act
    FCRA = 'FCRA',             // Fair Credit Reporting Act
    ECOA = 'ECOA',             // Equal Credit Opportunity Act
    CFPB = 'CFPB',             // Consumer Financial Protection Bureau
    TCPA = 'TCPA',             // Telephone Consumer Protection Act
    GLBA = 'GLBA',             // Gramm-Leach-Bliley Act
    DODD_FRANK = 'DODD_FRANK', // Dodd-Frank Act
    BSA_AML = 'BSA_AML',       // Bank Secrecy Act / AML
}

/**
 * Risk classification levels for banking AI agents
 */
export type RiskClassification = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

/**
 * Integration methods for connecting banking agents
 */
export type IntegrationMethod = 'REST_API' | 'WEBHOOK' | 'SFTP' | 'DATABASE' | 'MESSAGE_QUEUE';

/**
 * Operational hours configuration for banking agents
 * Ensures compliance with time-based restrictions (e.g., FDCPA call times)
 */
export interface OperationalHours {
    allowedDays: number[];      // 0-6 (Sunday-Saturday)
    startTime: string;          // "08:00" format
    endTime: string;            // "21:00" format
    timezone: string;           // IANA timezone, e.g., "America/New_York"
}

/**
 * Banking Agent Configuration
 * Represents an AI agent operating within the banking domain
 */
export interface BankingAgent {
    id: string;
    name: string;
    type: BankingAgentType;

    // Regulatory Classification
    regulatoryFrameworks: RegulatoryFramework[];
    riskClassification: RiskClassification;

    // Integration Details
    integrationMethod: IntegrationMethod;
    vendor?: string;                    // e.g., "Twilio", "AWS Connect", "Five9"

    // Banking-Specific Metadata
    operationalHours: OperationalHours;
    callVolumeLimit: number;            // Max calls per day

    // Licensing & Compliance
    licenseNumber?: string;
    complianceOfficer: string;
    lastAuditDate: number;              // Unix timestamp
    nextAuditDate: number;              // Unix timestamp

    // Status
    isActive: boolean;
    createdAt: number;
    updatedAt: number;
}

/**
 * Loan types for recovery calls
 */
export type LoanType = 'PERSONAL' | 'MORTGAGE' | 'AUTO' | 'CREDIT_CARD' | 'STUDENT';

/**
 * Sentiment classification for call analysis
 */
export type CallSentiment = 'POSITIVE' | 'NEUTRAL' | 'NEGATIVE' | 'HOSTILE';

/**
 * Outcome of a loan recovery call
 */
export type CallOutcome = 'ANSWERED' | 'VOICEMAIL' | 'NO_ANSWER' | 'BUSY' | 'DISCONNECTED' | 'DO_NOT_CALL';

/**
 * Loan Recovery Call Record
 * Tracks each collection call for compliance and audit purposes
 */
export interface LoanRecoveryCall {
    callId: string;
    agentId: string;
    borrowerId: string;

    // Call Details
    phoneNumber: string;
    startTime: number;                  // Unix timestamp
    endTime?: number;
    duration?: number;                  // seconds

    // Loan Context
    loanId: string;
    loanType: LoanType;
    principalAmount: number;
    amountOverdue: number;
    daysPastDue: number;

    // Communication Content
    transcript?: string;
    sentiment: CallSentiment;
    recordingUrl?: string;

    // Compliance Flags
    fdcpaViolations: string[];
    tcpaViolations: string[];
    consumerComplaints: string[];

    // Outcome
    outcome: CallOutcome;
    paymentPromised: boolean;
    paymentAmount?: number;
    paymentDate?: number;               // Unix timestamp
    disputeFiled: boolean;

    // Audit
    createdAt: number;
    reviewedAt?: number;
    reviewedBy?: string;
}

/**
 * Credit scoring decision types
 */
export type CreditDecision = 'APPROVED' | 'DENIED' | 'MANUAL_REVIEW';

/**
 * Factor impact on credit decision
 */
export type FactorImpact = 'POSITIVE' | 'NEGATIVE';

/**
 * Decision factor with explainability
 */
export interface DecisionFactor {
    factor: string;
    impact: FactorImpact;
    weight: number;                     // 0-1 normalized weight
    description?: string;
}

/**
 * Protected attributes monitored for fairness (NOT used in decisions)
 */
export interface ProtectedAttributes {
    race?: string;
    gender?: string;
    age?: number;
    maritalStatus?: string;
    nationalOrigin?: string;
    religion?: string;
}

/**
 * Credit Scoring Decision Record
 * Tracks AI credit decisions for compliance, explainability, and fairness
 */
export interface CreditScoringDecision {
    decisionId: string;
    agentId: string;
    applicantId: string;

    // Application Details
    loanAmount: number;
    loanPurpose: string;
    applicantIncome: number;
    creditScore: number;
    debtToIncome: number;               // Ratio, e.g., 0.35

    // AI Decision
    decision: CreditDecision;
    approvedAmount?: number;
    interestRate?: number;              // Percentage, e.g., 5.25

    // Explainability (FCRA Required)
    primaryFactors: DecisionFactor[];

    // Fairness Metrics (Monitored, NOT used in decision)
    protectedAttributes: ProtectedAttributes;

    // Adverse Action (FCRA Required for denials)
    adverseActionCode?: string;
    adverseActionReason?: string;
    adverseActionNoticeDate?: number;   // Unix timestamp

    // Compliance
    modelVersion: string;
    modelName: string;
    regulatoryReviewRequired: boolean;
    humanReviewRequired: boolean;

    // Audit Trail
    createdAt: number;
    reviewedAt?: number;
    reviewedBy?: string;
    overrideDecision?: CreditDecision;
    overrideReason?: string;
}

/**
 * Compliance violation severity levels
 */
export type ViolationSeverity = 'INFO' | 'WARNING' | 'VIOLATION' | 'CRITICAL';

/**
 * Compliance violation record
 */
export interface ComplianceViolation {
    violationId: string;
    agentId: string;
    framework: RegulatoryFramework;
    severity: ViolationSeverity;
    ruleId: string;
    ruleName: string;
    description: string;
    context: Record<string, unknown>;

    // Source reference
    sourceType: 'CALL' | 'CREDIT_DECISION' | 'TRANSACTION' | 'OTHER';
    sourceId: string;                   // callId or decisionId

    // Status
    status: 'OPEN' | 'UNDER_REVIEW' | 'RESOLVED' | 'ESCALATED';
    resolvedAt?: number;
    resolvedBy?: string;
    resolution?: string;

    createdAt: number;
}

/**
 * CFPB reporting data structure
 */
export interface CFPBReportData {
    reportId: string;
    reportingPeriod: {
        startDate: number;
        endDate: number;
    };

    // Aggregate metrics
    totalCalls: number;
    totalCreditDecisions: number;
    totalViolations: number;
    violationsByFramework: Record<RegulatoryFramework, number>;

    // Complaint metrics
    consumerComplaints: number;
    complaintsResolved: number;
    averageResolutionDays: number;

    // Fairness metrics
    approvalRateByDemographic: Record<string, number>;
    denialRateByDemographic: Record<string, number>;

    generatedAt: number;
}

/**
 * Agent-to-regulatory framework mapping
 * Defines which frameworks apply to each agent type
 */
export const AGENT_REGULATORY_MAPPING: Record<BankingAgentType, RegulatoryFramework[]> = {
    [BankingAgentType.LOAN_RECOVERY_VOICE]: [RegulatoryFramework.FDCPA, RegulatoryFramework.TCPA, RegulatoryFramework.CFPB],
    [BankingAgentType.LOAN_RECOVERY_SMS]: [RegulatoryFramework.FDCPA, RegulatoryFramework.TCPA, RegulatoryFramework.CFPB],
    [BankingAgentType.LOAN_RECOVERY_EMAIL]: [RegulatoryFramework.FDCPA, RegulatoryFramework.CFPB],
    [BankingAgentType.CREDIT_SCORING]: [RegulatoryFramework.FCRA, RegulatoryFramework.ECOA, RegulatoryFramework.CFPB],
    [BankingAgentType.LOAN_UNDERWRITING]: [RegulatoryFramework.FCRA, RegulatoryFramework.ECOA, RegulatoryFramework.CFPB, RegulatoryFramework.DODD_FRANK],
    [BankingAgentType.FRAUD_DETECTION]: [RegulatoryFramework.BSA_AML, RegulatoryFramework.GLBA],
    [BankingAgentType.CUSTOMER_SERVICE_CHAT]: [RegulatoryFramework.GLBA, RegulatoryFramework.CFPB],
    [BankingAgentType.VIRTUAL_ASSISTANT]: [RegulatoryFramework.GLBA, RegulatoryFramework.CFPB],
    [BankingAgentType.AML_MONITORING]: [RegulatoryFramework.BSA_AML],
    [BankingAgentType.KYC_VERIFICATION]: [RegulatoryFramework.BSA_AML, RegulatoryFramework.GLBA],
};

/**
 * Default operational hours (FDCPA compliant)
 */
export const DEFAULT_OPERATIONAL_HOURS: OperationalHours = {
    allowedDays: [1, 2, 3, 4, 5, 6],   // Monday-Saturday
    startTime: '08:00',
    endTime: '21:00',
    timezone: 'America/New_York',
};

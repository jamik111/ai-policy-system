import fs from 'fs';
import yaml from 'js-yaml';
import path from 'path';
import { Policy, RuleEvaluator, EvaluationResult } from './ruleEvaluator';
import { Logger } from '../audit/logger';

export class PolicyEngine {
    private policies: Policy[] = [];
    private policyDir: string;

    constructor() {
        this.policyDir = path.join(__dirname, '../../policies');
        this.loadPolicies();
    }

    public reloadPolicies() {
        this.policies = [];
        this.loadPolicies();
        Logger.log('Policies reloaded successfully.');
    }

    private loadPolicies() {
        if (!fs.existsSync(this.policyDir)) {
            console.warn(`Policy directory not found: ${this.policyDir}`);
            return;
        }

        const files = fs.readdirSync(this.policyDir).filter(f => f.endsWith('.yaml') || f.endsWith('.yml'));

        for (const file of files) {
            try {
                const filePath = path.join(this.policyDir, file);
                const content = fs.readFileSync(filePath, 'utf8');
                const loaded = yaml.load(content) as Policy[];

                if (Array.isArray(loaded)) {
                    // Basic validation to ensure it looks like a policy
                    const validPolicies = loaded.filter(p => p && p.id && p.rules);
                    this.policies.push(...validPolicies);
                    console.log(`Loaded ${validPolicies.length} policies from ${file}`);
                }
            } catch (e) {
                console.error(`Failed to load policy file ${file}:`, e);
            }
        }
    }

    evaluate(context: any): EvaluationResult {
        // Logger.log(`Evaluating request: ${JSON.stringify(context.type || context.action)}`);
        return RuleEvaluator.evaluate(this.policies, context);
    }

    getPolicies(): Policy[] {
        return this.policies;
    }
}


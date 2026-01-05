import * as fs from 'fs';
import * as path from 'path';
import * as yaml from 'js-yaml';
import { Policy, EvaluationResult, RuleEvaluator } from './ruleEvaluator';
import { Database } from '../database';

export class PolicyEngine {
  private policies: Policy[] = [];
  private policyDir: string;

  constructor(policyDir: string) {
    this.policyDir = policyDir;
    // Migration and loading handled asynchronously via init()
  }

  /* 
   * Initializes the engine by migrating YAML files to DB (if needed) 
   * and loading policies from the DB.
   */
  async init() {
    await this.syncWithDatabase();
    console.log(`[PolicyEngine] Loaded ${this.policies.length} policies from Database.`);
  }

  evaluate(context: any): EvaluationResult {
    return RuleEvaluator.evaluate(this.policies, context);
  }

  getPolicies(): Policy[] {
    return this.policies;
  }

  async reloadPolicies() {
    await this.syncWithDatabase();
  }

  /* --- Private Helpers --- */

  private async syncWithDatabase() {
    // 1. Load from DB
    let dbPolicies = await Database.getAllPolicies();

    // 2. If DB is empty, run migration from YAML
    if (dbPolicies.length === 0) {
      console.log('[PolicyEngine] Database empty. Migrating YAML policies...');
      const yamlPolicies = this.loadFromYaml();
      for (const p of yamlPolicies) {
        await Database.upsertPolicy(p);
      }
      dbPolicies = await Database.getAllPolicies();
    }

    this.policies = dbPolicies;
  }

  private loadFromYaml(): Policy[] {
    const results: Policy[] = [];
    if (!fs.existsSync(this.policyDir)) {
      console.warn(`Policy directory not found: ${this.policyDir}`);
      return results;
    }

    const files = fs.readdirSync(this.policyDir).filter(f => f.endsWith('.yaml') || f.endsWith('.yml'));
    for (const file of files) {
      const content = fs.readFileSync(path.join(this.policyDir, file), 'utf8');
      try {
        const doc = yaml.load(content) as Policy[];
        if (Array.isArray(doc)) {
          results.push(...doc);
        }
      } catch (e) {
        console.error(`Failed to load policy file ${file}:`, e);
      }
    }
    return results;
  }
}

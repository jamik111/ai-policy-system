"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.PolicyEngine = void 0;
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const yaml = __importStar(require("js-yaml"));
const ruleEvaluator_1 = require("./ruleEvaluator");
const database_1 = require("../database");
class PolicyEngine {
    policies = [];
    policyDir;
    constructor(policyDir) {
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
    evaluate(context) {
        return ruleEvaluator_1.RuleEvaluator.evaluate(this.policies, context);
    }
    getPolicies() {
        return this.policies;
    }
    async reloadPolicies() {
        await this.syncWithDatabase();
    }
    /* --- Private Helpers --- */
    async syncWithDatabase() {
        // 1. Load from DB
        let dbPolicies = await database_1.Database.getAllPolicies();
        // 2. If DB is empty, run migration from YAML
        if (dbPolicies.length === 0) {
            console.log('[PolicyEngine] Database empty. Migrating YAML policies...');
            const yamlPolicies = this.loadFromYaml();
            for (const p of yamlPolicies) {
                await database_1.Database.upsertPolicy(p);
            }
            dbPolicies = await database_1.Database.getAllPolicies();
        }
        this.policies = dbPolicies;
    }
    loadFromYaml() {
        const results = [];
        if (!fs.existsSync(this.policyDir)) {
            console.warn(`Policy directory not found: ${this.policyDir}`);
            return results;
        }
        const files = fs.readdirSync(this.policyDir).filter(f => f.endsWith('.yaml') || f.endsWith('.yml'));
        for (const file of files) {
            const content = fs.readFileSync(path.join(this.policyDir, file), 'utf8');
            try {
                const doc = yaml.load(content);
                if (Array.isArray(doc)) {
                    results.push(...doc);
                }
            }
            catch (e) {
                console.error(`Failed to load policy file ${file}:`, e);
            }
        }
        return results;
    }
}
exports.PolicyEngine = PolicyEngine;

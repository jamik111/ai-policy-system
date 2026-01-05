"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Logger = void 0;
class Logger {
    static log(message) {
        console.log(`[INFO] ${new Date().toISOString()}: ${message}`);
    }
    static info(message) {
        console.info(`\x1b[32m[POLICY PASSED]\x1b[0m ${new Date().toISOString()}: ${message}`);
    }
    static warn(message) {
        console.warn(`\x1b[31m[POLICY DENIED]\x1b[0m ${new Date().toISOString()}: ${message}`);
    }
    static logAudit(context, result) {
        // In a real system, this would go to a database or centralized logging
        // console.log(`[AUDIT] ...`); 
        // We are using database.ts now
    }
}
exports.Logger = Logger;

export class Logger {
  static log(message: string) {
    console.log(`[INFO] ${new Date().toISOString()}: ${message}`);
  }

  static info(message: string) {
    console.info(`\x1b[32m[POLICY PASSED]\x1b[0m ${new Date().toISOString()}: ${message}`);
  }

  static warn(message: string) {
    console.warn(`\x1b[31m[POLICY DENIED]\x1b[0m ${new Date().toISOString()}: ${message}`);
  }

  static logAudit(context: any, result: any) {
    // In a real system, this would go to a database or centralized logging
    // console.log(`[AUDIT] ...`); 
    // We are using database.ts now
  }
}

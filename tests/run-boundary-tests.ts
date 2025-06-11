#!/usr/bin/env node

import { execSync } from 'child_process';
import { writeFileSync } from 'fs';
import { join } from 'path';

interface TestResult {
  suite: string;
  passed: number;
  failed: number;
  total: number;
  duration: number;
  coverage?: number;
}

class BoundaryTestRunner {
  private results: TestResult[] = [];
  private startTime: number = Date.now();

  async runAllTests(): Promise<void> {
    console.log('🚀 Starting Boundary Value Test Suite for Eventra\n');
    
    const testSuites = [
      { name: 'Email Validation', file: 'email-validation.test.ts' },
      { name: 'Event Validation', file: 'event-validation.test.ts' },
      { name: 'Time Validation', file: 'time-validation.test.ts' },
      { name: 'Utility Functions', file: 'utility-functions.test.ts' },
      { name: 'API Endpoints', file: 'api-endpoints.test.ts' }
    ];

    for (const suite of testSuites) {
      await this.runTestSuite(suite.name, suite.file);
    }

    this.generateReport();
  }

  private async runTestSuite(suiteName: string, fileName: string): Promise<void> {
    console.log(`📋 Running ${suiteName} Tests...`);
    const startTime = Date.now();

    try {
      const output = execSync(
        `npx vitest run tests/boundary-value/${fileName} --reporter=json`,
        { encoding: 'utf-8', stdio: 'pipe' }
      );

      const result = JSON.parse(output);
      const duration = Date.now() - startTime;

      const testResult: TestResult = {
        suite: suiteName,
        passed: result.numPassedTests || 0,
        failed: result.numFailedTests || 0,
        total: result.numTotalTests || 0,
        duration,
        coverage: this.calculateCoverage(result)
      };

      this.results.push(testResult);
      this.logSuiteResult(testResult);

    } catch (error) {
      console.error(`❌ Error running ${suiteName}: ${error}`);
      this.results.push({
        suite: suiteName,
        passed: 0,
        failed: 1,
        total: 1,
        duration: Date.now() - startTime
      });
    }
  }

  private calculateCoverage(result: any): number {
    if (result.coverageMap) {
      const coverage = result.coverageMap;
      let totalStatements = 0;
      let coveredStatements = 0;

      Object.values(coverage).forEach((file: any) => {
        totalStatements += file.s ? Object.keys(file.s).length : 0;
        coveredStatements += file.s ? Object.values(file.s).filter(Boolean).length : 0;
      });

      return totalStatements > 0 ? (coveredStatements / totalStatements) * 100 : 0;
    }
    return 0;
  }

  private logSuiteResult(result: TestResult): void {
    const status = result.failed === 0 ? '✅' : '❌';
    const percentage = result.total > 0 ? ((result.passed / result.total) * 100).toFixed(1) : '0';
    
    console.log(`${status} ${result.suite}: ${result.passed}/${result.total} passed (${percentage}%) - ${result.duration}ms`);
    
    if (result.coverage) {
      console.log(`   📊 Coverage: ${result.coverage.toFixed(1)}%`);
    }
    console.log('');
  }

  private generateReport(): void {
    const totalDuration = Date.now() - this.startTime;
    const totalTests = this.results.reduce((sum, r) => sum + r.total, 0);
    const totalPassed = this.results.reduce((sum, r) => sum + r.passed, 0);
    const totalFailed = this.results.reduce((sum, r) => sum + r.failed, 0);
    const overallPercentage = totalTests > 0 ? ((totalPassed / totalTests) * 100).toFixed(1) : '0';

    console.log('📊 BOUNDARY VALUE TEST REPORT');
    console.log('=' .repeat(50));
    console.log(`Total Tests: ${totalTests}`);
    console.log(`Passed: ${totalPassed}`);
    console.log(`Failed: ${totalFailed}`);
    console.log(`Success Rate: ${overallPercentage}%`);
    console.log(`Total Duration: ${totalDuration}ms`);
    console.log('');

    console.log('📋 DETAILED RESULTS:');
    console.log('-'.repeat(50));
    
    this.results.forEach(result => {
      const percentage = result.total > 0 ? ((result.passed / result.total) * 100).toFixed(1) : '0';
      console.log(`${result.suite.padEnd(20)} | ${result.passed.toString().padStart(3)}/${result.total.toString().padEnd(3)} | ${percentage.padStart(5)}% | ${result.duration.toString().padStart(6)}ms`);
    });

    // Generate detailed HTML report
    this.generateHtmlReport();
    
    console.log('\n📄 Detailed HTML report generated: boundary-test-report.html');
    
    if (totalFailed > 0) {
      console.log(`\n❌ ${totalFailed} test(s) failed. Please review the failures above.`);
      process.exit(1);
    } else {
      console.log('\n✅ All boundary value tests passed successfully!');
    }
  }

  private generateHtmlReport(): void {
    const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Eventra Boundary Value Test Report</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; background-color: #f5f5f5; }
        .container { max-width: 1200px; margin: 0 auto; background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        .header { text-align: center; color: #333; border-bottom: 2px solid #007bff; padding-bottom: 20px; margin-bottom: 30px; }
        .summary { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin-bottom: 30px; }
        .metric { background: #f8f9fa; padding: 20px; border-radius: 8px; text-align: center; border-left: 4px solid #007bff; }
        .metric h3 { margin: 0; color: #666; font-size: 14px; text-transform: uppercase; }
        .metric .value { font-size: 24px; font-weight: bold; color: #333; margin: 10px 0; }
        .results-table { width: 100%; border-collapse: collapse; margin-top: 20px; }
        .results-table th, .results-table td { padding: 12px; text-align: left; border-bottom: 1px solid #ddd; }
        .results-table th { background-color: #007bff; color: white; }
        .results-table tr:hover { background-color: #f5f5f5; }
        .status-pass { color: #28a745; font-weight: bold; }
        .status-fail { color: #dc3545; font-weight: bold; }
        .progress-bar { width: 100%; height: 20px; background-color: #e9ecef; border-radius: 10px; overflow: hidden; }
        .progress-fill { height: 100%; background-color: #28a745; transition: width 0.3s ease; }
        .timestamp { text-align: center; color: #666; margin-top: 20px; font-size: 12px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🧪 Eventra Boundary Value Test Report</h1>
            <p>Comprehensive testing of edge cases and boundary conditions</p>
        </div>
        
        <div class="summary">
            <div class="metric">
                <h3>Total Tests</h3>
                <div class="value">${this.results.reduce((sum, r) => sum + r.total, 0)}</div>
            </div>
            <div class="metric">
                <h3>Passed</h3>
                <div class="value status-pass">${this.results.reduce((sum, r) => sum + r.passed, 0)}</div>
            </div>
            <div class="metric">
                <h3>Failed</h3>
                <div class="value status-fail">${this.results.reduce((sum, r) => sum + r.failed, 0)}</div>
            </div>
            <div class="metric">
                <h3>Success Rate</h3>
                <div class="value">${((this.results.reduce((sum, r) => sum + r.passed, 0) / this.results.reduce((sum, r) => sum + r.total, 0)) * 100).toFixed(1)}%</div>
            </div>
        </div>

        <h2>📋 Test Suite Results</h2>
        <table class="results-table">
            <thead>
                <tr>
                    <th>Test Suite</th>
                    <th>Status</th>
                    <th>Passed/Total</th>
                    <th>Success Rate</th>
                    <th>Duration</th>
                    <th>Progress</th>
                </tr>
            </thead>
            <tbody>
                ${this.results.map(result => {
                  const percentage = result.total > 0 ? ((result.passed / result.total) * 100) : 0;
                  const status = result.failed === 0 ? 'PASS' : 'FAIL';
                  const statusClass = result.failed === 0 ? 'status-pass' : 'status-fail';
                  
                  return `
                    <tr>
                        <td><strong>${result.suite}</strong></td>
                        <td class="${statusClass}">${status}</td>
                        <td>${result.passed}/${result.total}</td>
                        <td>${percentage.toFixed(1)}%</td>
                        <td>${result.duration}ms</td>
                        <td>
                            <div class="progress-bar">
                                <div class="progress-fill" style="width: ${percentage}%"></div>
                            </div>
                        </td>
                    </tr>
                  `;
                }).join('')}
            </tbody>
        </table>

        <div class="timestamp">
            Report generated on ${new Date().toLocaleString()}
        </div>
    </div>
</body>
</html>`;

    writeFileSync(join(process.cwd(), 'boundary-test-report.html'), html);
  }
}

// Run the tests if this script is executed directly
if (require.main === module) {
  const runner = new BoundaryTestRunner();
  runner.runAllTests().catch(console.error);
}

export default BoundaryTestRunner; 
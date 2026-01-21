#!/usr/bin/env node
/**
 * Custom yarn audit wrapper that only fails on moderate+ severity vulnerabilities
 * This script runs yarn audit and exits with code 0 if only low severity vulnerabilities are found
 */

const { execSync } = require('child_process');
const fs = require('fs');

try {
  // Run yarn audit with JSON output
  const auditOutput = execSync('yarn audit --json --level moderate', { 
    encoding: 'utf8',
    stdio: 'pipe'
  });
  
  const lines = auditOutput.trim().split('\n').filter(line => line.trim());
  let hasModerateOrHigher = false;
  let vulnerabilityCount = 0;
  
  // Parse JSON lines from yarn audit output
  for (const line of lines) {
    try {
      const data = JSON.parse(line);
      
      // Check for vulnerability advisories
      if (data.type === 'auditAdvisory') {
        vulnerabilityCount++;
        const severity = data.data.advisory?.severity?.toLowerCase() || 'low';
        
        console.log(`Found ${severity} severity vulnerability: ${data.data.advisory?.title || 'Unknown'}`);
        
        if (severity === 'moderate' || severity === 'high' || severity === 'critical') {
          hasModerateOrHigher = true;
        }
      }
      
      // Check for audit summary
      if (data.type === 'auditSummary') {
        const summary = data.data;
        console.log(`\nAudit Summary:`);
        console.log(`  Total vulnerabilities: ${summary.vulnerabilities?.total || 0}`);
        console.log(`  Low: ${summary.vulnerabilities?.low || 0}`);
        console.log(`  Moderate: ${summary.vulnerabilities?.moderate || 0}`);
        console.log(`  High: ${summary.vulnerabilities?.high || 0}`);
        console.log(`  Critical: ${summary.vulnerabilities?.critical || 0}`);
      }
    } catch (e) {
      // Skip non-JSON lines
      if (line.includes('vulnerabilities found') || line.includes('Packages audited')) {
        console.log(line);
      }
    }
  }
  
  // Also run regular audit to show full output
  console.log('\n--- Full Audit Output ---');
  execSync('yarn audit --level moderate', { stdio: 'inherit' });
  
  // Exit with appropriate code
  if (hasModerateOrHigher) {
    console.log('\n❌ Security audit failed: Found moderate or higher severity vulnerabilities');
    process.exit(1);
  } else if (vulnerabilityCount > 0) {
    console.log('\n✅ Security audit passed: Only low severity vulnerabilities found (acceptable)');
    process.exit(0);
  } else {
    console.log('\n✅ Security audit passed: No vulnerabilities found');
    process.exit(0);
  }
} catch (error) {
  // If yarn audit fails completely, check if it's because of vulnerabilities
  if (error.status === 2) {
    // Try to parse the output to check severity
    try {
      const output = error.stdout?.toString() || error.message || '';
      
      // Check if output mentions only low severity
      if (output.includes('Severity:') && output.match(/Severity:\s*\d+\s*Low/i) && 
          !output.match(/Moderate|High|Critical/i)) {
        console.log('✅ Security audit passed: Only low severity vulnerabilities found (acceptable)');
        process.exit(0);
      } else {
        console.error('❌ Security audit failed');
        process.exit(1);
      }
    } catch (e) {
      console.error('❌ Security audit failed');
      process.exit(1);
    }
  } else {
    console.error('Error running yarn audit:', error.message);
    process.exit(1);
  }
}


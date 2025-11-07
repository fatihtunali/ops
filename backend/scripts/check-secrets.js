const fs = require('fs');
const path = require('path');

/**
 * Security Scanner - Detects Hardcoded Secrets
 *
 * This script scans all code files for potential hardcoded secrets
 * and ensures all sensitive data uses environment variables.
 */

// Patterns that might indicate hardcoded secrets
const SECRET_PATTERNS = [
  // Passwords
  { pattern: /password\s*[:=]\s*['"][^'"]+['"]/gi, name: 'Hardcoded Password' },
  { pattern: /pwd\s*[:=]\s*['"][^'"]+['"]/gi, name: 'Hardcoded Password (pwd)' },

  // API Keys
  { pattern: /api[_-]?key\s*[:=]\s*['"][^'"]+['"]/gi, name: 'Hardcoded API Key' },
  { pattern: /apikey\s*[:=]\s*['"][^'"]+['"]/gi, name: 'Hardcoded API Key' },

  // Tokens
  { pattern: /token\s*[:=]\s*['"][^'"]+['"]/gi, name: 'Hardcoded Token' },
  { pattern: /auth[_-]?token\s*[:=]\s*['"][^'"]+['"]/gi, name: 'Hardcoded Auth Token' },
  { pattern: /bearer\s*[:=]\s*['"][^'"]+['"]/gi, name: 'Hardcoded Bearer Token' },

  // Database credentials
  { pattern: /db[_-]?password\s*[:=]\s*['"][^'"]+['"]/gi, name: 'Hardcoded DB Password' },
  { pattern: /database[_-]?password\s*[:=]\s*['"][^'"]+['"]/gi, name: 'Hardcoded DB Password' },

  // Email credentials
  { pattern: /smtp[_-]?password\s*[:=]\s*['"][^'"]+['"]/gi, name: 'Hardcoded SMTP Password' },
  { pattern: /email[_-]?password\s*[:=]\s*['"][^'"]+['"]/gi, name: 'Hardcoded Email Password' },

  // Secret keys
  { pattern: /secret[_-]?key\s*[:=]\s*['"][^'"]+['"]/gi, name: 'Hardcoded Secret Key' },
  { pattern: /private[_-]?key\s*[:=]\s*['"][^'"]+['"]/gi, name: 'Hardcoded Private Key' },

  // AWS/Cloud credentials
  { pattern: /aws[_-]?secret\s*[:=]\s*['"][^'"]+['"]/gi, name: 'Hardcoded AWS Secret' },
  { pattern: /aws[_-]?access[_-]?key\s*[:=]\s*['"][^'"]+['"]/gi, name: 'Hardcoded AWS Key' },

  // Connection strings with embedded credentials
  { pattern: /[a-z]+:\/\/[^:]+:[^@]+@[^\/]+/gi, name: 'Connection String with Credentials' },
];

// Safe patterns that should be ignored (using env variables correctly)
const SAFE_PATTERNS = [
  /process\.env\./gi,
  /\.env\.example/gi,
  /\.env\.template/gi,
  /\/\//gi, // Comments
  /\/\*/gi, // Block comments
];

// Files and directories to exclude from scanning
const EXCLUDE_PATTERNS = [
  'node_modules',
  '.git',
  'dist',
  'build',
  '.env.example',
  'check-secrets.js', // This file itself
  'package-lock.json',
  'package.json',
];

const issues = [];

/**
 * Check if a line is safe (uses environment variables or is a comment)
 */
function isSafeLine(line) {
  // Check if line uses process.env
  if (line.includes('process.env.')) {
    return true;
  }

  // Check if line is a comment
  const trimmed = line.trim();
  if (trimmed.startsWith('//') || trimmed.startsWith('*') || trimmed.startsWith('/*')) {
    return true;
  }

  return false;
}

/**
 * Scan a file for hardcoded secrets
 */
function scanFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split('\n');

    lines.forEach((line, lineNum) => {
      // Skip safe lines
      if (isSafeLine(line)) {
        return;
      }

      // Check each pattern
      SECRET_PATTERNS.forEach(({ pattern, name }) => {
        const matches = line.match(pattern);
        if (matches) {
          issues.push({
            file: filePath,
            line: lineNum + 1,
            issue: name,
            content: line.trim(),
            severity: 'HIGH'
          });
        }
      });
    });
  } catch (error) {
    console.error(`Error reading file ${filePath}:`, error.message);
  }
}

/**
 * Recursively scan directory
 */
function scanDirectory(dir) {
  const files = fs.readdirSync(dir);

  files.forEach(file => {
    const fullPath = path.join(dir, file);

    // Skip excluded patterns
    if (EXCLUDE_PATTERNS.some(pattern => fullPath.includes(pattern))) {
      return;
    }

    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      scanDirectory(fullPath);
    } else if (stat.isFile()) {
      // Only scan code files
      const ext = path.extname(fullPath);
      if (['.js', '.ts', '.jsx', '.tsx', '.json', '.env'].includes(ext)) {
        scanFile(fullPath);
      }
    }
  });
}

/**
 * Main execution
 */
console.log('🔍 Starting Security Scan for Hardcoded Secrets...\n');
console.log('=' + '='.repeat(60) + '\n');

// Scan backend directory
const backendDir = path.join(__dirname, '..');
scanDirectory(backendDir);

// Report results
if (issues.length === 0) {
  console.log('✅ No hardcoded secrets detected!\n');
  console.log('All sensitive data appears to be using environment variables.\n');
  process.exit(0);
} else {
  console.log(`❌ Found ${issues.length} potential security issue(s):\n`);

  issues.forEach((issue, index) => {
    console.log(`${index + 1}. ${issue.severity} - ${issue.issue}`);
    console.log(`   File: ${issue.file}:${issue.line}`);
    console.log(`   Code: ${issue.content}`);
    console.log('');
  });

  console.log('⚠️  SECURITY WARNING ⚠️');
  console.log('Please fix these issues by:');
  console.log('1. Moving secrets to .env file');
  console.log('2. Using process.env.VARIABLE_NAME in code');
  console.log('3. Adding .env to .gitignore');
  console.log('4. Never committing .env file to git\n');

  process.exit(1);
}

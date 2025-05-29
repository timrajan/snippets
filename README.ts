// Try multiple approaches to get tags
let tags: string[] = [];

// 1. Environment variable (highest priority)
if (process.env.JEST_TAGS) {
  tags = process.env.JEST_TAGS.split(',');
  console.log('Using environment variable tags:', tags);
}
// 2. Try to load from .env file manually (if dotenv not available)
else {
  try {
    const fs = require('fs');
    const path = require('path');
    const envPath = path.join(process.cwd(), '.env');
    
    if (fs.existsSync(envPath)) {
      const envContent = fs.readFileSync(envPath, 'utf8');
      const lines = envContent.split('\n');
      
      for (const line of lines) {
        if (line.startsWith('JEST_TAGS=')) {
          const value = line.replace('JEST_TAGS=', '').trim();
          tags = value.split(',');
          console.log('Using .env file tags:', tags);
          break;
        }
      }
    }
  } catch (error) {
    console.log('Could not read .env file');
  }
}

// 3. Fallback to config file
if (tags.length === 0) {
  try {
    const fs = require('fs');
    const path = require('path');
    const configPath = path.join(process.cwd(), 'test.config.json');
    
    if (fs.existsSync(configPath)) {
      const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
      tags = config.tags || [];
      console.log('Using config file tags:', tags);
    }
  } catch (error) {
    console.log('No test config found, running all tests');
  }
}

console.log('=== TAG CONFIGURATION ===');
console.log('Environment JEST_TAGS:', process.env.JEST_TAGS);
console.log('Final parsed tags:', tags);
console.log('Tags length:', tags.length);
console.log('Should filter tests:', tags.length > 0);
console.log('========================');

function shouldRunTest(testTags: string[]): boolean {
  if (tags.length === 0) {
    console.log('No tags specified, running all tests');
    return true;
  }
  
  const result = tags.every(tag => testTags.includes(tag));
  console.log(`Required tags: [${tags.join(', ')}]`);
  console.log(`Test tags: [${testTags.join(', ')}]`);
  console.log(`Every required tag found in test? ${result}`);
  
  return result;
}

// Store original Jest functions
const originalIt = global.it;
const originalDescribe = global.describe;

// Override global it() to skip when filtering is active
global.it = function(name: string, fn?: any, timeout?: number) {
  if (tags.length > 0) {
    console.log(`⏭️ Skipping untagged test: "${name}" (filtering active)`);
    return; // Don't create the test at all when filtering
  } else {
    console.log(`✅ Running untagged test: "${name}" (no filtering)`);
    return originalIt(name, fn, timeout);
  }
} as any;

// Override global describe() to skip when filtering is active  
global.describe = function(name: string, fn?: () => void) {
  if (tags.length > 0) {
    console.log(`⏭️ Skipping untagged describe: "${name}" (filtering active)`);
    return; // Don't create the describe block at all when filtering
  } else {
    console.log(`✅ Running untagged describe: "${name}" (no filtering)`);
    return originalDescribe(name, fn);
  }
} as any;

// Copy over Jest methods to maintain functionality
Object.keys(originalIt).forEach(key => {
  if (typeof originalIt[key as keyof typeof originalIt] === 'function') {
    (global.it as any)[key] = originalIt[key as keyof typeof originalIt];
  }
});

Object.keys(originalDescribe).forEach(key => {
  if (typeof originalDescribe[key as keyof typeof originalDescribe] === 'function') {
    (global.describe as any)[key] = originalDescribe[key as keyof typeof originalDescribe];
  }
});

// Simpler approach without complex typing
declare global {
  var taggedDescribe: any;
  var taggedIt: any;
}

global.taggedDescribe = function(testTags: string[], name: string, fn: any) {
  const shouldRun = shouldRunTest(testTags);
  console.log(`taggedDescribe - Name: "${name}", Tags: [${testTags.join(', ')}], Should run: ${shouldRun}`);
  
  if (shouldRun) {
    console.log('✅ Creating describe block');
    describe(name, fn);
  } else {
    console.log('⏭️ Completely skipping describe block - not creating it at all');
    // Don't create any describe block at all for non-matching tags
    return;
  }
};

global.taggedIt = function(testTags: string[], name: string, fn: any) {
  const shouldRun = shouldRunTest(testTags);
  console.log(`taggedIt - Name: "${name}", Tags: [${testTags.join(', ')}], Should run: ${shouldRun}`);
  
  if (shouldRun) {
    console.log('✅ Creating and running test');
    if (typeof fn === 'function') {
      return it(name, fn);
    } else {
      console.log('Function is not a function type!');
      return it(name);
    }
  } else {
    console.log('⏭️ Completely skipping test - not creating it at all');
    // Don't create any test at all for non-matching tags
    return;
  }
};

export {};

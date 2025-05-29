// Load environment variables from .env file
require('dotenv').config();

// Get tags from environment variable
const tags = process.env.JEST_TAGS ? process.env.JEST_TAGS.split(',').map(tag => tag.trim()) : [];

console.log('=== TAG CONFIGURATION ===');
console.log('Environment JEST_TAGS:', process.env.JEST_TAGS);
console.log('Parsed tags:', tags);
console.log('Filtering active:', tags.length > 0);
console.log('========================');

function shouldRunTest(testTags: string[]): boolean {
  if (tags.length === 0) {
    return true; // No filtering, run all tagged tests
  }
  
  const result = tags.every(tag => testTags.includes(tag));
  console.log(`Required: [${tags.join(', ')}], Test: [${testTags.join(', ')}], Match: ${result}`);
  return result;
}

// Store original Jest functions
const originalIt = global.it;
const originalDescribe = global.describe;

// Declare global functions
declare global {
  var taggedDescribe: (tags: string[], name: string, fn: () => void) => void;
  var taggedIt: (tags: string[], name: string, fn: () => void | Promise<void>) => void;
}

// Tagged describe function
global.taggedDescribe = function(testTags: string[], name: string, fn: () => void) {
  const shouldRun = shouldRunTest(testTags);
  
  if (shouldRun) {
    console.log(`✅ Creating describe: "${name}"`);
    originalDescribe(name, fn);
  } else {
    console.log(`⏭️ Skipping describe: "${name}"`);
    // Don't create anything - completely skip
  }
};

// Tagged it function  
global.taggedIt = function(testTags: string[], name: string, fn: () => void | Promise<void>) {
  const shouldRun = shouldRunTest(testTags);
  
  if (shouldRun) {
    console.log(`✅ Creating test: "${name}"`);
    originalIt(name, fn);
  } else {
    console.log(`⏭️ Skipping test: "${name}"`);
    // Don't create anything - completely skip
  }
};

// Override global it() and describe() to skip untagged tests when filtering
// BUT only when NOT in debug mode (IDE debugging typically sets NODE_ENV or other flags)
const isDebugging = process.env.NODE_ENV === 'test' || 
                   process.argv.includes('--inspect') || 
                   process.argv.includes('--inspect-brk') ||
                   !!process.env.VSCODE_PID ||
                   process.argv.some(arg => arg.endsWith('.test.ts') || arg.endsWith('.test.js'));

if (tags.length > 0 && !isDebugging) {
  console.log('🔍 Filtering mode: untagged tests will be skipped');
  
  global.it = function(name: string, fn?: any, timeout?: number) {
    console.log(`⏭️ Skipping untagged test: "${name}"`);
    // Don't create the test at all
  } as any;

  global.describe = function(name: string, fn?: () => void) {
    console.log(`⏭️ Skipping untagged describe: "${name}"`);
    // Don't create the describe block at all
  } as any;
  
  // Preserve Jest's static methods
  global.it.skip = originalIt.skip;
  global.it.only = originalIt.only;
  global.it.each = originalIt.each;
  global.it.todo = originalIt.todo;
  
  global.describe.skip = originalDescribe.skip;
  global.describe.only = originalDescribe.only;
  global.describe.each = originalDescribe.each;
} else if (tags.length > 0) {
  console.log('🐛 Debug/single file mode: keeping untagged tests for debugging');
} else {
  console.log('🌍 No filtering active - all tests will run');
}

export {};

type TaggedTestFunction = (tags: string[], name: string, fn: () => void) => void;

declare global {
  var taggedDescribe: TaggedTestFunction;
  var taggedIt: TaggedTestFunction;
}

const tags = process.env.JEST_TAGS ? process.env.JEST_TAGS.split(',') : [];

function shouldRunTest(testTags: string[]): boolean {
  if (tags.length === 0) return true;
  return tags.every(tag => testTags.includes(tag));
}

global.taggedDescribe = function(testTags: string[], name: string, fn: () => void) {
  if (shouldRunTest(testTags)) {
    return describe(name, fn);
  } else {
    return describe.skip(name, fn);
  }
};

global.taggedIt = function(testTags: string[], name: string, fn: () => void) {
  if (shouldRunTest(testTags)) {
    return it(name, fn);
  } else {
    return it.skip(name, fn);
  }
};

export {};


test-tags.ts


module.exports = {
  setupFilesAfterEnv: ['<rootDir>/test-tags.ts'],
  preset: 'ts-jest', // if you're using TypeScript
  testEnvironment: 'node',
  // ... your other Jest configuration
};



typescript// auth.test.ts
taggedDescribe(['smoke'], '[SMOKE] Authentication tests', () => {
  taggedIt(['smoke', 'login'], '[LOGIN] should authenticate user with valid credentials', () => {
    // Test implementation
    expect(true).toBe(true);
  });
  
  taggedIt(['smoke', 'logout'], '[LOGOUT] should log out user', () => {
    // Test implementation
    expect(true).toBe(true);
  });
});

taggedDescribe(['integration'], '[INTEGRATION] User management', () => {
  taggedIt(['integration', 'login'], '[LOGIN] should handle admin login', () => {
    // Test implementation
    expect(true).toBe(true);
  });
});



bash# Run only tests that have BOTH 'smoke' AND 'login' tags
JEST_TAGS=smoke,login jest ./src/tests

# Run only smoke tests (any test with 'smoke' tag)
JEST_TAGS=smoke jest ./src/tests

# Run only login tests (any test with 'login' tag)
JEST_TAGS=login jest ./src/tests

# Run tests with multiple required tags
JEST_TAGS=smoke,login,critical jest ./src/tests



{
  "scripts": {
    "test": "jest",
    "test:smoke": "cross-env JEST_TAGS=smoke jest ./src/tests",
    "test:smoke-login": "cross-env JEST_TAGS=smoke,login jest ./src/tests",
    "test:integration": "cross-env JEST_TAGS=integration jest ./src/tests"
  }
}

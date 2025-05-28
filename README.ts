const tags = process.env.JEST_TAGS ? process.env.JEST_TAGS.split(',') : [];

console.log('JEST_TAGS:', process.env.JEST_TAGS);
console.log('Parsed tags:', tags);

function shouldRunTest(testTags: string[]): boolean {
  if (tags.length === 0) return true;
  return tags.every(tag => testTags.includes(tag));
}

declare global {
  var taggedDescribe: (tags: string[], name: string, fn: () => void) => void;
  var taggedIt: (tags: string[], name: string, fn: () => void | Promise<void>) => void;
}

global.taggedDescribe = function(testTags: string[], name: string, fn: () => void) {
  const shouldRun = shouldRunTest(testTags);
  console.log(`taggedDescribe - "${name}", shouldRun: ${shouldRun}`);
  
  if (shouldRun) {
    describe(name, fn);
  } else {
    describe.skip(name, fn);
  }
};

global.taggedIt = function(testTags: string[], name: string, fn: () => void | Promise<void>) {
  const shouldRun = shouldRunTest(testTags);
  console.log(`taggedIt - "${name}", shouldRun: ${shouldRun}`);
  
  if (shouldRun) {
    it(name, fn);
  } else {
    it.skip(name, fn);
  }
};

export {};

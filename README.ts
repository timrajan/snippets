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

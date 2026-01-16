Argument of type 'String[]' is not assignable to parameter of type 'string[]'

function findStringWithSubstring(arr: string[], substring: string): string | undefined {
  return arr.find(str => str.includes(substring));
}

// Usage example
const fruits: string[] = ["apple", "banana", "orange", "grape"];

const result = findStringWithSubstring(fruits, "nana");
console.log(result);  // Output: "banana"

const result2 = findStringWithSubstring(fruits, "app");
console.log(result2);  // Output: "apple"

const result3 = findStringWithSubstring(fruits, "xyz");
console.log(result3);  // Output: undefined

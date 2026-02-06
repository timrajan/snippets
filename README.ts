{
  "compilerOptions": {
    "resolveJsonModule": true,
    "esModuleInterop": true
  }
}


{
  "mappings": [
    {
      "label": "ATest",
      "numbers": [111111, 222222]
    },
    {
      "label": "BTest",
      "numbers": [333333, 444444, 555555]
    }
  ]
}

import mappings from "./mappings.json";

function getLabel(number: number): string | undefined {
  const match = mappings.mappings.find((entry) =>
    entry.numbers.includes(number)
  );
  return match?.label;
}

// Usage
console.log(getLabel(111111)); // "ATest"
console.log(getLabel(444444)); // "BTest"
console.log(getLabel(999999)); // undefined

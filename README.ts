{
    "mappings": [
        { "fileName": "AAA.xlsx", "testId": [4811109] },
        { "fileName": "BBB.xlsx", "testId": [4822249] }     
    ]
}


// utils/updateJSON.ts
import * as fs from 'fs';
import * as path from 'path';

interface Mapping {
  fileName: string;
  testId: number[];
}

interface MappingFile {
  mappings: Mapping[];
}

const JSON_PATH = path.resolve(process.cwd(), 'mappings.json');

export function updateJSON(fileName: string, testId: number): void {
  const data: MappingFile = JSON.parse(fs.readFileSync(JSON_PATH, 'utf-8'));

  const existing = data.mappings.find(m => m.fileName === fileName);

  if (existing) {
    if (!existing.testId.includes(testId)) {
      existing.testId.push(testId);
    }
  } else {
    data.mappings.push({ fileName, testId: [testId] });
  }

  fs.writeFileSync(JSON_PATH, JSON.stringify(data, null, 4), 'utf-8');
}

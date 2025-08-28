{
  "name": "sharepoint-excel-reader",
  "version": "1.0.0",
  "description": "Read Excel data from SharePoint using TypeScript",
  "main": "dist/index.js",
  "scripts": {
    "build": "tsc",
    "start": "node dist/index.js",
    "dev": "ts-node src/index.ts",
    "clean": "rimraf dist"
  },
  "keywords": ["sharepoint", "excel", "typescript", "nodejs"],
  "author": "Your Name",
  "license": "MIT",
  "dependencies": {
    "@azure/msal-node": "^2.6.6",
    "axios": "^1.6.7",
    "xlsx": "^0.18.5"
  },
  "devDependencies": {
    "@types/node": "^20.11.19",
    "typescript": "^5.3.3",
    "ts-node": "^10.9.2",
    "rimraf": "^5.0.5"
  }
}

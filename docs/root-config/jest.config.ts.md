# jest.config.ts

**Location:** `/jest.config.ts`
**Type:** Test Configuration

## Purpose

Configures Jest testing framework for unit and integration tests. Jest runs tests in a simulated browser environment (jsdom) and handles TypeScript transformation.

## Key Configuration

### Test Environment
```typescript
testEnvironment: "jest-environment-jsdom"
```
Simulates browser DOM APIs (document, window, localStorage) for React component testing.

### Test File Locations
```typescript
roots: ["<rootDir>/src", "<rootDir>/tests"]
testMatch: [
  "<rootDir>/tests/**/*.test.{ts,tsx}",
  "<rootDir>/tests/**/*.spec.{ts,tsx}",
]
```
Tests live in `/tests` directory, named `*.test.ts` or `*.spec.tsx`.

### TypeScript Transformation
```typescript
transform: {
  "^.+\\.tsx?$": ["ts-jest", { /* config */ }]
}
```
Converts TypeScript to JavaScript before running tests.

### Path Aliases
```typescript
moduleNameMapper: {
  "^@/(.*)$": "<rootDir>/src/$1"
}
```
Maps `@/` imports to `src/` (matches app config).

### CSS Mocking
```typescript
"\\.(css|less|scss|sass)$": "identity-obj-proxy"
```
CSS imports return mock objects (tests don't need actual styles).

### Setup File
```typescript
setupFilesAfterEnv: ["<rootDir>/src/setupTests.ts"]
```
Runs before each test file, adds jest-dom matchers.

## How It Fits Into The Application

### Running Tests
```bash
npm test              # Run all tests once
npm run test:watch    # Run tests on file changes
```

### Test Coverage
```typescript
collectCoverageFrom: [
  "src/**/*.{ts,tsx}",
  "!src/**/*.test.{ts,tsx}",
  "!src/main.tsx",
]
```
Tracks which code is tested (excludes test files and entry point).

## Related Files
- [setupTests.ts](../src/setupTests.ts.md): Jest setup with @testing-library/jest-dom
- [package.json](./package.json.md): Defines Jest dependencies
- [tests/](../tests/): All test files

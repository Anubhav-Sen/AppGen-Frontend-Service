# setupTests.ts

**Location:** `/src/setupTests.ts`
**Type:** Jest Test Setup File

## Purpose

Configures the test environment for Jest by importing testing utilities and polyfilling missing browser APIs.

## Contents

```typescript
import "@testing-library/jest-dom";

if (typeof global.TextEncoder === "undefined") {
    const { TextEncoder, TextDecoder } = require("util");
    global.TextEncoder = TextEncoder;
    global.TextDecoder = TextDecoder;
}
```

## What It Does

### 1. Import Testing Library Matchers
```typescript
import "@testing-library/jest-dom";
```

**Adds custom Jest matchers for DOM testing:**
- `toBeInTheDocument()`
- `toHaveTextContent()`
- `toBeVisible()`
- `toBeDisabled()`
- Many more...

**Example:**
```typescript
test('renders button', () => {
  render(<button>Click me</button>);
  expect(screen.getByRole('button')).toBeInTheDocument();
  expect(screen.getByRole('button')).toHaveTextContent('Click me');
});
```

---

### 2. Polyfill TextEncoder/TextDecoder
```typescript
if (typeof global.TextEncoder === "undefined") {
    const { TextEncoder, TextDecoder } = require("util");
    global.TextEncoder = TextEncoder;
    global.TextDecoder = TextDecoder;
}
```

**Why needed:**
- Node.js test environment doesn't have browser APIs
- Some libraries (like `@xyflow/react`, crypto utils) require TextEncoder/TextDecoder
- Without this, tests would fail with "TextEncoder is not defined"

---

## Usage

This file is **automatically loaded** by Jest before running tests.

**jest.config.ts:**
```typescript
export default {
  setupFilesAfterEnv: ['<rootDir>/src/setupTests.ts'],
  // ...
};
```

You don't need to import it in test files - it runs globally.

---

## Example Tests Using These Utilities

### Using jest-dom Matchers
```typescript
import { render, screen } from '@testing-library/react';
import { LoginPage } from './LoginPage';

test('renders login form', () => {
  render(<LoginPage />);

  // These matchers come from @testing-library/jest-dom
  expect(screen.getByLabelText('Email')).toBeInTheDocument();
  expect(screen.getByRole('button', { name: /login/i })).toBeVisible();
});
```

### Component Using TextEncoder
```typescript
// Some component that uses crypto or encoding
function HashComponent({ text }) {
  const encoder = new TextEncoder();
  const data = encoder.encode(text);
  return <div>{data.length} bytes</div>;
}

// Test works because TextEncoder is polyfilled
test('encodes text', () => {
  render(<HashComponent text="hello" />);
  expect(screen.getByText('5 bytes')).toBeInTheDocument();
});
```

---

## Related Files

- [jest.config.ts](../../root-config/jest.config.ts.md): Jest configuration that loads this file
- [package.json](../../root-config/package.json.md): Defines test scripts

---

## Common Issues Without This File

### Missing jest-dom Matchers
```typescript
// ❌ Without setupTests.ts
expect(element).toBeInTheDocument();
// Error: Property 'toBeInTheDocument' does not exist

// ✅ With setupTests.ts
expect(element).toBeInTheDocument();
// Works!
```

### TextEncoder Not Defined
```typescript
// ❌ Without polyfill
new TextEncoder();
// Error: TextEncoder is not defined

// ✅ With polyfill
new TextEncoder();
// Works!
```

---

## Testing

This file itself doesn't need tests - it's configuration.

To verify it works:
```bash
npm test
```

If tests run without "TextEncoder is not defined" errors, the polyfill works.

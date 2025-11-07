import js from "@eslint/js";
import globals from "globals";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import react from "eslint-plugin-react";
import importPlugin from "eslint-plugin-import";
import simpleImportSort from "eslint-plugin-simple-import-sort";
import jsxA11y from "eslint-plugin-jsx-a11y";
import tseslint from "typescript-eslint";
import { defineConfig, globalIgnores } from "eslint/config";

export default defineConfig([
  globalIgnores(["dist"]),
  {
    files: ["**/*.{ts,tsx}"],
    extends: [
      js.configs.recommended,
      tseslint.configs.recommended,
      reactHooks.configs["recommended-latest"],
      reactRefresh.configs.vite,
    ],
    plugins: {
      react,
      import: importPlugin,
      "simple-import-sort": simpleImportSort,
      "jsx-a11y": jsxA11y,
    },
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      globals: globals.browser,
      parser: tseslint.parser,
      parserOptions: {
        ecmaFeatures: { jsx: true },
      },
    },
    settings: {
      react: { version: "detect" },
    },
    rules: {
      /* --- React & Hooks --- */
      "react/react-in-jsx-scope": "off", // not needed with React 17+
      "react/prop-types": "off", // using TypeScript for prop types
      "react/jsx-uses-react": "off",
      "react/jsx-uses-vars": "warn",

      /* --- Hooks --- */
      "react-hooks/rules-of-hooks": "error", // only call hooks at top level
      "react-hooks/exhaustive-deps": "warn", // ensures correct dependency arrays

      /* --- Accessibility (jsx-a11y) --- */
      "jsx-a11y/alt-text": "warn", // enforce alt text on <img> etc.
      "jsx-a11y/anchor-is-valid": "warn", // catch invalid <a> links
      "jsx-a11y/no-autofocus": "warn", // discourage auto-focus for accessibility
      "jsx-a11y/aria-role": "warn", // ensure ARIA roles are valid

      /* --- Imports & Sorting --- */
      "import/order": "off",
      "simple-import-sort/imports": "warn", // automatically sort imports
      "simple-import-sort/exports": "warn", // automatically sort exports
      "import/no-unresolved": "off", // TypeScript handles this
      "import/no-duplicates": "warn",

      /* --- TypeScript --- */
      "@typescript-eslint/no-unused-vars": [
        "warn",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
      ],
      "@typescript-eslint/no-explicit-any": "off", // allow flexibility during prototyping
      "@typescript-eslint/explicit-function-return-type": "off", // optional for cleaner code

      /* --- Style & Code Hygiene --- */
      "no-console": ["warn", { allow: ["warn", "error"] }],
      "no-debugger": "error",
    },
  },
]);

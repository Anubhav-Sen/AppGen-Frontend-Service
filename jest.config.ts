import type { Config } from "jest";

const config: Config = {
  testEnvironment: "jest-environment-jsdom",
  roots: ["<rootDir>/src", "<rootDir>/tests"],
  modulePaths: ["<rootDir>"],
  transform: {
    "^.+\\.tsx?$": [
      "ts-jest",
      {
        tsconfig: {
          jsx: "react-jsx",
          esModuleInterop: true,
          allowSyntheticDefaultImports: true,
          verbatimModuleSyntax: false,
          skipLibCheck: true,
          types: ["jest", "@testing-library/jest-dom", "node"],
          baseUrl: ".",
          paths: {
            "@/*": ["./src/*"]
          }
        },
      },
    ],
  },
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1",
    "\\.(css|less|scss|sass)$": "identity-obj-proxy",
    "^nanoid$": "<rootDir>/tests/mocks/nanoid.ts",
  },
  setupFilesAfterEnv: ["<rootDir>/src/setupTests.ts"],
  testMatch: [
    "<rootDir>/tests/**/*.test.{ts,tsx}",
    "<rootDir>/tests/**/*.spec.{ts,tsx}",
  ],
  testPathIgnorePatterns: ["/node_modules/", "/dist/"],
  transformIgnorePatterns: [
    "node_modules/(?!(nanoid)/)",
  ],
  collectCoverageFrom: [
    "src/**/*.{ts,tsx}",
    "!src/**/*.d.ts",
    "!src/**/*.test.{ts,tsx}",
    "!src/main.tsx",
    "!src/setupTests.ts",
  ],
};

export default config;

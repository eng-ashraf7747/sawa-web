// C:\sawa-web\jest.rules.config.js

module.exports = {
  testEnvironment: "node",
  testMatch: ["<rootDir>/__tests__/rules/**/*.test.ts"],
  transform: {
    "^.+\\.ts$": ["ts-jest", { tsconfig: "tsconfig.json" }],
  },
  testTimeout: 20000,
  maxWorkers: 1,
};
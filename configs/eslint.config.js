// ESLint Configuration
// ATS Resume Platform - Strict TypeScript Rules

module.exports = {
  root: true,
  parser: "@typescript-eslint/parser",
  parserOptions: {
    ecmaVersion: 2022,
    sourceType: "module",
    project: ["./tsconfig.json", "./apps/*/tsconfig.json", "./packages/*/tsconfig.json"],
  },
  plugins: [
    "@typescript-eslint",
    "import",
    "prettier",
  ],
  extends: [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:@typescript-eslint/recommended-requiring-type-checking",
    "plugin:@typescript-eslint/strict",
    "plugin:import/recommended",
    "plugin:import/typescript",
    "prettier",
  ],
  rules: {
    // ==================
    // TypeScript Strict
    // ==================
    "@typescript-eslint/no-explicit-any": "error",
    "@typescript-eslint/explicit-function-return-type": "error",
    "@typescript-eslint/explicit-module-boundary-types": "error",
    "@typescript-eslint/no-unused-vars": ["error", { argsIgnorePattern: "^_" }],
    "@typescript-eslint/no-floating-promises": "error",
    "@typescript-eslint/await-thenable": "error",
    "@typescript-eslint/no-misused-promises": "error",
    "@typescript-eslint/strict-boolean-expressions": "error",

    // ==================
    // Code Quality
    // ==================
    "no-console": ["error", { allow: ["warn", "error"] }],
    "no-debugger": "error",
    "no-alert": "error",
    "prefer-const": "error",
    "no-var": "error",
    "eqeqeq": ["error", "always"],
    "curly": ["error", "all"],

    // ==================
    // Import Rules
    // ==================
    "import/order": [
      "error",
      {
        groups: [
          "builtin",
          "external",
          "internal",
          "parent",
          "sibling",
          "index",
          "type",
        ],
        "newlines-between": "always",
        alphabetize: { order: "asc" },
      },
    ],
    "import/no-duplicates": "error",
    "import/no-unresolved": "error",
    "import/no-cycle": "error",

    // ==================
    // Naming Conventions
    // ==================
    "@typescript-eslint/naming-convention": [
      "error",
      { selector: "variable", format: ["camelCase", "UPPER_CASE", "PascalCase"] },
      { selector: "function", format: ["camelCase", "PascalCase"] },
      { selector: "typeLike", format: ["PascalCase"] },
      { selector: "enumMember", format: ["UPPER_CASE"] },
    ],
  },
  settings: {
    "import/resolver": {
      typescript: {
        project: ["./tsconfig.json", "./apps/*/tsconfig.json", "./packages/*/tsconfig.json"],
      },
    },
  },
  ignorePatterns: [
    "node_modules",
    "dist",
    "build",
    ".next",
    "coverage",
  ],
};

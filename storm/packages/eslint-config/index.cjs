/**
 * Base ESLint config for Storm.
 * Enforces decoupling rules from design/repo-bootstrap.md §7:
 *  - no service imports another service's src/
 *  - only packages/* may be imported across workspaces
 *  - no cross-app imports between apps/web and apps/admin
 */
module.exports = {
  root: false,
  parser: "@typescript-eslint/parser",
  parserOptions: {
    ecmaVersion: 2022,
    sourceType: "module",
  },
  plugins: ["@typescript-eslint", "import"],
  extends: [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:import/recommended",
    "plugin:import/typescript",
  ],
  env: {
    node: true,
    es2022: true,
  },
  rules: {
    "no-console": ["error", { allow: ["warn", "error"] }],
    "@typescript-eslint/no-unused-vars": [
      "error",
      { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
    ],
    "@typescript-eslint/no-explicit-any": "warn",
    "import/no-unresolved": "off",
    "import/order": "off",
    "no-restricted-imports": [
      "error",
      {
        patterns: [
          {
            group: ["**/services/*/src/**", "services/*/src/**"],
            message:
              "Do not import another service's src/. Cross-service contracts go through packages/contracts or events.",
          },
          {
            group: ["**/apps/web/**", "apps/web/**", "**/apps/admin/**", "apps/admin/**"],
            message: "Do not import across apps. Share via packages/*.",
          },
        ],
      },
    ],
  },
  ignorePatterns: [
    "dist/",
    "build/",
    ".next/",
    "coverage/",
    "node_modules/",
    "src/generated/",
  ],
};

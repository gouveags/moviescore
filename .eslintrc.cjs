module.exports = {
  root: true,
  ignorePatterns: [
    "**/node_modules/**",
    "**/.turbo/**",
    "**/.next/**",
    "**/.vercel/**",
    "**/dist/**",
    "**/coverage/**",
    "**/*.d.ts",
  ],
  overrides: [
    {
      files: ["apps/frontend/**/*.{ts,tsx}"],
      extends: ["next/core-web-vitals", "next/typescript", "prettier"],
    },
    {
      files: ["apps/backend/**/*.ts", "packages/shared/**/*.ts"],
      parser: "@typescript-eslint/parser",
      plugins: ["@typescript-eslint"],
      extends: [
        "eslint:recommended",
        "plugin:@typescript-eslint/recommended",
        "prettier",
      ],
      env: {
        es2023: true,
        node: true,
      },
    },
  ],
};

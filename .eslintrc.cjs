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
      files: ["apps/backend/**/*.ts"],
      parser: "@typescript-eslint/parser",
      plugins: ["@typescript-eslint"],
      extends: ["eslint:recommended", "plugin:@typescript-eslint/recommended", "prettier"],
      env: {
        es2023: true,
        node: true,
      },
    },
    {
      files: ["packages/shared/**/*.ts"],
      parser: "@typescript-eslint/parser",
      plugins: ["@typescript-eslint"],
      extends: ["eslint:recommended", "plugin:@typescript-eslint/recommended", "prettier"],
      env: {
        es2023: true,
        node: true,
      },
    },
    {
      files: ["apps/backend/src/modules/**/domain/**/*.ts"],
      rules: {
        "no-restricted-imports": [
          "error",
          {
            patterns: [
              "@backend/modules/**/application/**",
              "@backend/modules/**/infrastructure/**",
              "@backend/modules/**/delivery/**",
              "**/application/**",
              "**/infrastructure/**",
              "**/delivery/**",
            ],
          },
        ],
      },
    },
    {
      files: ["apps/backend/src/modules/**/application/**/*.ts"],
      rules: {
        "no-restricted-imports": [
          "error",
          {
            patterns: [
              "@backend/modules/**/infrastructure/**",
              "@backend/modules/**/delivery/**",
              "**/infrastructure/**",
              "**/delivery/**",
            ],
          },
        ],
      },
    },
    {
      files: ["apps/backend/src/modules/**/infrastructure/**/*.ts"],
      rules: {
        "no-restricted-imports": [
          "error",
          {
            patterns: ["@backend/modules/**/delivery/**", "**/delivery/**"],
          },
        ],
      },
    },
    {
      files: ["apps/backend/src/modules/**/delivery/**/*.ts"],
      rules: {
        "no-restricted-imports": [
          "error",
          {
            patterns: ["@backend/modules/**/infrastructure/**", "**/infrastructure/**"],
          },
        ],
      },
    },
  ],
};

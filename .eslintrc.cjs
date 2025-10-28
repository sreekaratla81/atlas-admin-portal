module.exports = {
  root: true,
  env: {
    browser: true,
    es2021: true,
    node: true,
  },
  parser: "@typescript-eslint/parser",
  parserOptions: {
    ecmaFeatures: {
      jsx: true,
    },
    ecmaVersion: "latest",
    sourceType: "module",
    project: "./tsconfig.json",
    tsconfigRootDir: __dirname,
  },
  settings: {
    react: {
      version: "detect",
    },
    "import/resolver": {
      typescript: {},
    },
  },
  plugins: [
    "@typescript-eslint",
    "react",
    "react-hooks",
    "import",
    "tailwindcss",
  ],
  extends: [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:react/recommended",
    "plugin:react-hooks/recommended",
    "plugin:import/recommended",
    "plugin:import/typescript",
    "plugin:tailwindcss/recommended",
    "prettier",
  ],
  rules: {
    "react/react-in-jsx-scope": "off",
    "import/order": [
      "warn",
      {
        groups: [["builtin", "external", "internal"], ["parent", "sibling", "index"]],
        alphabetize: {
          order: "asc",
          caseInsensitive: true,
        },
        "newlines-between": "always",
      },
    ],
    "no-unused-vars": "off",
    "@typescript-eslint/no-unused-vars": ["error", { argsIgnorePattern: "^_", varsIgnorePattern: "^_" }],
    "@typescript-eslint/no-explicit-any": "warn",
    "tailwindcss/no-custom-classname": "off",
  },
  overrides: [
    {
      files: ["*.test.ts", "*.test.tsx", "src/test/**/*"],
      env: {
        jest: true,
      },
    },
    {
      files: ["scripts/**/*.{js,ts}"],
      parserOptions: {
        project: null,
      },
      env: {
        node: true,
      },
    },
  ],
};

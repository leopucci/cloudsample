module.exports = {
  env: {
    browser: true,
    commonjs: true,
    es2021: true,
  },
  extends: [
    "plugin:react/recommended",
    "airbnb",
    "plugin:prettier/recommended",
  ],
  parserOptions: {
    ecmaVersion: 12,
    ecmaFeatures: {
      jsx: true,
    },
  },
  plugins: ["react", "@typescript-eslint", "formatjs"],
  rules: {
    "formatjs/no-offset": "error",
    "react/jsx-filename-extension": [1, { extensions: [".js", ".jsx"] }],
    camelcase: [
      "error",
      {
        ignoreImports: true,
      },
      // aqui tem muito exemplos de config https://github.com/standard/eslint-config-standard-with-typescript/issues/303
    ],
    "formatjs/enforce-id": [
      "error",
      {
        idInterpolationPattern: "",
      },
    ],
  },
};

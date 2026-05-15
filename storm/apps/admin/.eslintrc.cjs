module.exports = {
  root: true,
  extends: ["@storm/eslint-config/react.cjs"],
  parserOptions: { project: "./tsconfig.json", tsconfigRootDir: __dirname },
};

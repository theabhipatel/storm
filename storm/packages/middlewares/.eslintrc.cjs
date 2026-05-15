module.exports = {
  root: true,
  extends: ["@storm/eslint-config"],
  parserOptions: { project: "./tsconfig.json", tsconfigRootDir: __dirname },
};

module.exports = {
  root: true,
  extends: ["@storm/eslint-config/service.cjs"],
  parserOptions: { project: "./tsconfig.json", tsconfigRootDir: __dirname },
};

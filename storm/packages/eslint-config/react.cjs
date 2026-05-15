/** ESLint config for React apps (web + admin). */
module.exports = {
  extends: ["./index.cjs"],
  env: { browser: true, es2022: true },
  rules: {
    "no-console": ["warn", { allow: ["warn", "error"] }],
  },
};

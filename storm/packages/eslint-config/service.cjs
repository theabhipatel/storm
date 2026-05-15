/** ESLint config for backend services (Node + Express). */
module.exports = {
  extends: ["./index.cjs"],
  env: { node: true, es2022: true },
  rules: {
    "no-console": "error",
  },
};

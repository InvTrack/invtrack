module.exports = {
  "**/*.ts?(x)": () => ["npm run format", "sh scripts/typecheck.sh"],
  "*.{json, js}": () => ["npm run format"],
};

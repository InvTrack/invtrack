module.exports = {
  "**/*.ts?(x)": () => ["npm run format", "npm run typecheck"],
  "*.{json, js}": () => ["npm run format"],
};

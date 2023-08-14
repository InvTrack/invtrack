module.exports = {
  "**/*.{ts,js}?(x)": () => [
    "npm run format",
    "npm run typecheck",
    "npm run lint",
  ],
  "*.{json}": () => ["npm run format", "npm run typecheck"],
};

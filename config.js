const HR_HUB_CONFIG = {
  corsProxy: "",
  refreshIntervalMinutes: 30,
  defaultCountryCode: "WLD",
  gdelt: {
    language: "",
    country: "",
    keywords: ["labor union", "strike", "collective action", "walkout"],
    baseKeywords: ["union", "strike", "labor", "collective bargaining", "wage talks"],
  },
  negotiations: {
    keywords: [
      "collective bargaining",
      "union negotiations",
      "labor agreement",
      "collective agreement",
    ],
    baseKeywords: ["collective bargaining", "wage talks", "pay deal", "labor talks"],
  },
  // Negotiation intelligence cards now use macro-only metrics.
};

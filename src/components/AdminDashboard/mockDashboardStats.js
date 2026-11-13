/* -------------------------------------------------------------------------
 * Mock data — hand this shape to the backend engineer (Husnain).
 * GET /api/admin/dashboard-stats should return exactly this structure.
 *
 * popularCategories reflects SMFinTrack's actual category taxonomy (see
 * Project_Document.pdf → "Categorisation Engine → Category Taxonomy").
 * These are the system spending categories every transaction gets sorted
 * into by the rule-based engine (+ ML fallback) — not merchandise/product
 * categories.
 *   - transactionCount: how many parsed transactions fell into this
 *     category across all students, platform-wide (drives rank + share bar)
 *   - ruleCount: how many keyword/merchant rules are mapped to this
 *     category in the categorisation engine (Categories.rules in the data
 *     model) — useful context for the admin doing category-rule management
 * ---------------------------------------------------------------------- */

export const DASHBOARD_STATS_SHAPE = {
  metrics: {
    totalUsers: {
      value: 12450,
      badge: { direction: "up", value: "+14% this month" },
    },
    totalTransactions: {
      value: 3820,
      badge: { direction: "up", value: "+12.8% vs last week" },
    },
    signupsThisWeek: {
      value: 348,
      badge: { direction: "down", value: "-1.4% vs last week" },
    },
  },
  trafficHistory: [
    { day: "Mon", requests: 4200 },
    { day: "Tue", requests: 4900 },
    { day: "Wed", requests: 5800 },
    { day: "Thu", requests: 5100 },
    { day: "Fri", requests: 7200 },
    { day: "Sat", requests: 8400 },
    { day: "Sun", requests: 9100 },
  ],
  popularCategories: [
    {
      id: "cat_food",
      name: "Food & Dining",
      ruleCount: 34,
      transactionCount: 9840,
      color: "#2FA8A0",
    },
    {
      id: "cat_transport",
      name: "Transport",
      ruleCount: 21,
      transactionCount: 6720,
      color: "#004C48",
    },
    {
      id: "cat_bills",
      name: "Bills & Utilities",
      ruleCount: 18,
      transactionCount: 5310,
      color: "#F59E0B",
    },
    {
      id: "cat_entertainment",
      name: "Entertainment",
      ruleCount: 15,
      transactionCount: 3980,
      color: "#8B5CF6",
    },
    {
      id: "cat_shopping",
      name: "Shopping",
      ruleCount: 26,
      transactionCount: 3410,
      color: "#EF4444",
    },
    {
      id: "cat_subscriptions",
      name: "Subscriptions",
      ruleCount: 12,
      transactionCount: 2870,
      color: "#22C55E",
    },
    {
      id: "cat_education",
      name: "Education",
      ruleCount: 9,
      transactionCount: 1640,
      color: "#0EA5E9",
    },
    {
      id: "cat_health",
      name: "Health",
      ruleCount: 11,
      transactionCount: 1120,
      color: "#EC4899",
    },
    {
      id: "cat_savings",
      name: "Savings",
      ruleCount: 4,
      transactionCount: 760,
      color: "#14B8A6",
    },
    {
      id: "cat_misc",
      name: "Miscellaneous",
      ruleCount: 7,
      transactionCount: 420,
      color: "#94A3B8",
    },
  ],
};

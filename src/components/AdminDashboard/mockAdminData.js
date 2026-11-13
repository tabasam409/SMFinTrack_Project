/* -------------------------------------------------------------------------
 * Mock data — hand these shapes to the backend engineer (Husnain).
 *   - GET /api/admin/users       → { users: [...], total }
 *   - GET /api/admin/categories  → { categories: [...], total }
 *
 * NOTE: `account_status`, `last_active_at`, `spend_6mo`, `budgets`,
 * `subscriptions_detected`, `audit_log`, and `transactions` are UI-only
 * additions on top of the original contract (is_active / created_at) so
 * the details drawer has something to show. They're flagged in
 * API_CONTRACT.md as "nice to have, not blocking" — fall back gracefully
 * if the API doesn't send them.
 *
 * transaction: { id, merchant, category, color, type: "expense" | "deposit",
 *                amount, date } — newest first; the drawer shows the latest
 *                5 and a "+N more" footer.
 * ---------------------------------------------------------------------- */

export const MOCK_USERS = {
  users: [
    {
      id: "usr_001",
      first_name: "Aisha",
      last_name: "Khan",
      email: "aisha.khan@uni.edu",
      university_name: "National University",
      is_active: true,
      account_status: "active",
      created_at: "2026-07-12T09:24:00Z",
      last_active_at: "2026-08-14T10:40:00Z",
      subscriptions_detected: 3,
      spend_6mo: [7200, 8100, 6400, 9200, 8800, 9600],
      budgets: [
        { category: "Food & Dining", limit: 5000, used: 4200 },
        { category: "Transport", limit: 2000, used: 1450 },
        { category: "Entertainment", limit: 1500, used: 1610 },
      ],
      audit_log: [],
      transactions: [
        { id: "tx_a1", merchant: "Cafe Aroma", category: "Food & Dining", color: "#2FA8A0", type: "expense", amount: 850, date: "2026-08-14T09:20:00Z" },
        { id: "tx_a2", merchant: "Metro Card Top-up", category: "Transport", color: "#004C48", type: "expense", amount: 500, date: "2026-08-13T17:05:00Z" },
        { id: "tx_a3", merchant: "Panera Bakery", category: "Food & Dining", color: "#2FA8A0", type: "expense", amount: 1200, date: "2026-08-10T12:30:00Z" },
        { id: "tx_a4", merchant: "Monthly Salary", category: "Income", color: "#22C55E", type: "deposit", amount: 45000, date: "2026-08-01T08:00:00Z" },
      ],
    },
    {
      id: "usr_002",
      first_name: "Hamza",
      last_name: "Ahmed",
      email: "hamza.ahmed@uni.edu",
      university_name: "Punjab University",
      is_active: true,
      account_status: "active",
      created_at: "2026-07-18T14:02:00Z",
      last_active_at: "2026-08-14T06:15:00Z",
      subscriptions_detected: 2,
      spend_6mo: [5200, 6100, 5800, 6600, 7100, 6900],
      budgets: [
        { category: "Food & Dining", limit: 4500, used: 3100 },
        { category: "Bills & Utilities", limit: 3000, used: 2950 },
      ],
      audit_log: [],
      transactions: [
        { id: "tx_b1", merchant: "Cafe Aroma", category: "Food & Dining", color: "#2FA8A0", type: "expense", amount: 650, date: "2026-08-14T08:10:00Z" },
        { id: "tx_b2", merchant: "Careem Ride", category: "Transport", color: "#004C48", type: "expense", amount: 900, date: "2026-08-12T19:45:00Z" },
        { id: "tx_b3", merchant: "Hostel Rent", category: "Bills & Utilities", color: "#F59E0B", type: "expense", amount: 18000, date: "2026-08-05T10:00:00Z" },
        { id: "tx_b4", merchant: "Eid Gift", category: "Income", color: "#22C55E", type: "deposit", amount: 5000, date: "2026-08-02T14:20:00Z" },
      ],
    },
    {
      id: "usr_003",
      first_name: "Fatima",
      last_name: "Ali",
      email: "fatima.ali@tech.edu",
      university_name: "Tech University",
      is_active: false,
      account_status: "suspended",
      created_at: "2026-06-02T11:45:00Z",
      last_active_at: "2026-08-02T18:20:00Z",
      subscriptions_detected: 4,
      spend_6mo: [9800, 10400, 8900, 11200, 9600, 8200],
      budgets: [
        { category: "Shopping", limit: 4000, used: 4600 },
        { category: "Food & Dining", limit: 5000, used: 4100 },
      ],
      audit_log: [
        {
          who: "Nabeela Ashiq",
          action: "Suspended account",
          reason: "Uploaded statement failed authenticity check",
          at: "2026-08-10T09:00:00Z",
        },
      ],
      transactions: [
        { id: "tx_c1", merchant: "Boutique Mall", category: "Shopping", color: "#EF4444", type: "expense", amount: 4200, date: "2026-08-02T15:30:00Z" },
        { id: "tx_c2", merchant: "SuperMart", category: "Shopping", color: "#EF4444", type: "expense", amount: 3800, date: "2026-07-29T11:12:00Z" },
        { id: "tx_c3", merchant: "Netflix", category: "Subscriptions", color: "#EC4899", type: "expense", amount: 1100, date: "2026-07-25T06:00:00Z" },
        { id: "tx_c4", merchant: "Freelance Payment", category: "Income", color: "#22C55E", type: "deposit", amount: 22000, date: "2026-07-20T17:40:00Z" },
      ],
    },
    {
      id: "usr_004",
      first_name: "Usman",
      last_name: "Raza",
      email: "usman.raza@uni.edu",
      university_name: "National University",
      is_active: true,
      account_status: "active",
      created_at: "2026-05-29T08:15:00Z",
      last_active_at: "2026-08-13T21:05:00Z",
      subscriptions_detected: 1,
      spend_6mo: [4100, 4300, 3900, 4700, 5100, 4800],
      budgets: [{ category: "Transport", limit: 2500, used: 1900 }],
      audit_log: [],
      transactions: [
        { id: "tx_d1", merchant: "Careem Ride", category: "Transport", color: "#004C48", type: "expense", amount: 750, date: "2026-08-13T20:25:00Z" },
        { id: "tx_d2", merchant: "University Bookstore", category: "Education", color: "#0EA5E9", type: "expense", amount: 1600, date: "2026-08-09T13:15:00Z" },
        { id: "tx_d3", merchant: "Pocket Money", category: "Income", color: "#22C55E", type: "deposit", amount: 3000, date: "2026-08-01T09:00:00Z" },
      ],
    },
    {
      id: "usr_005",
      first_name: "Sana",
      last_name: "Malik",
      email: "sana.malik@law.edu",
      university_name: "Law University",
      is_active: true,
      account_status: "pending",
      created_at: "2026-08-01T16:33:00Z",
      last_active_at: "2026-08-01T16:40:00Z",
      subscriptions_detected: 0,
      spend_6mo: [0, 0, 0, 0, 1200, 2100],
      budgets: [{ category: "Food & Dining", limit: 3000, used: 900 }],
      audit_log: [],
      transactions: [
        { id: "tx_e1", merchant: "Campus Café", category: "Food & Dining", color: "#2FA8A0", type: "expense", amount: 350, date: "2026-08-01T12:10:00Z" },
      ],
    },
    {
      id: "usr_006",
      first_name: "Bilal",
      last_name: "Sheikh",
      email: "bilal.sheikh@uni.edu",
      university_name: "Punjab University",
      is_active: false,
      account_status: "suspended",
      created_at: "2026-04-19T10:20:00Z",
      last_active_at: "2026-07-29T13:10:00Z",
      subscriptions_detected: 5,
      spend_6mo: [6600, 7200, 6900, 7800, 7300, 6100],
      budgets: [
        { category: "Entertainment", limit: 1500, used: 2100 },
        { category: "Subscriptions", limit: 1200, used: 1650 },
      ],
      audit_log: [
        {
          who: "You (Admin)",
          action: "Suspended account",
          reason: "Requested by user",
          at: "2026-07-30T08:00:00Z",
        },
      ],
      transactions: [
        { id: "tx_f1", merchant: "Spotify", category: "Subscriptions", color: "#EC4899", type: "expense", amount: 1490, date: "2026-07-28T07:00:00Z" },
        { id: "tx_f2", merchant: "Cineplex", category: "Entertainment", color: "#8B5CF6", type: "expense", amount: 2000, date: "2026-07-25T21:15:00Z" },
        { id: "tx_f3", merchant: "Card Refund", category: "Income", color: "#22C55E", type: "deposit", amount: 1500, date: "2026-07-22T16:05:00Z" },
      ],
    },
    {
      id: "usr_007",
      first_name: "Zainab",
      last_name: "Qureshi",
      email: "zainab.q@med.edu",
      university_name: "Medical University",
      is_active: true,
      account_status: "active",
      created_at: "2026-07-27T12:08:00Z",
      last_active_at: "2026-08-14T11:55:00Z",
      subscriptions_detected: 2,
      spend_6mo: [5600, 5900, 6200, 5800, 6400, 6700],
      budgets: [
        { category: "Education", limit: 3500, used: 2200 },
        { category: "Food & Dining", limit: 4000, used: 3800 },
      ],
      audit_log: [],
      transactions: [
        { id: "tx_g1", merchant: "University Cafeteria", category: "Food & Dining", color: "#2FA8A0", type: "expense", amount: 700, date: "2026-08-14T11:30:00Z" },
        { id: "tx_g2", merchant: "Lab Fee", category: "Education", color: "#0EA5E9", type: "expense", amount: 5200, date: "2026-08-11T14:00:00Z" },
        { id: "tx_g3", merchant: "Metro Top-up", category: "Transport", color: "#004C48", type: "expense", amount: 400, date: "2026-08-08T18:45:00Z" },
        { id: "tx_g4", merchant: "Scholarship Grant", category: "Income", color: "#22C55E", type: "deposit", amount: 15000, date: "2026-08-01T10:30:00Z" },
      ],
    },
    {
      id: "usr_008",
      first_name: "Ali",
      last_name: "Hassan",
      email: "ali.hassan@eng.edu",
      university_name: "Engineering University",
      is_active: true,
      account_status: "pending",
      created_at: "2026-06-15T09:50:00Z",
      last_active_at: "2026-06-16T07:30:00Z",
      subscriptions_detected: 0,
      spend_6mo: [0, 0, 800, 0, 0, 0],
      budgets: [],
      audit_log: [],
      transactions: [],
    },
  ],
  total: 8,
};

// NOTE: MOCK_CATEGORIES has moved to ./mockCategoryData.js — it grew to a
// full 22 top-level / 84 subcategory taxonomy (Task 3, Ali Hamza) and got
// its own file so this one stays readable. Re-exported here too so any
// existing `import { MOCK_CATEGORIES } from "./mockAdminData"` still works.
export { MOCK_CATEGORIES } from "./mockCategoryData";
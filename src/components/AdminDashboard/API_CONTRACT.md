# SMFinTrack — Admin Dashboard API Contract

The frontend is ready. Return the **exact shapes** below — the frontend expects data in these structures.

Base URL: `https://unthematic-ta-soaringly.ngrok-free.dev`

The frontend sends an `Authorization: Bearer <token>` header on all these endpoints (token is stored in `localStorage` under the key `smfintrack_token`). If admin endpoints are protected, verify the token.

---

## 1. GET `/api/admin/dashboard-stats`

```json
{
  "metrics": {
    "totalUsers": {
      "value": 12450,
      "badge": { "direction": "up", "value": "+14% this month" }
    },
    "totalTransactions": {
      "value": 3820,
      "badge": { "direction": "up", "value": "+12.8% vs last week" }
    },
    "signupsThisWeek": {
      "value": 348,
      "badge": { "direction": "down", "value": "-1.4% vs last week" }
    }
  },
  "trafficHistory": [
    { "day": "Mon", "requests": 4200 },
    { "day": "Tue", "requests": 4900 },
    { "day": "Wed", "requests": 5800 },
    { "day": "Thu", "requests": 5100 },
    { "day": "Fri", "requests": 7200 },
    { "day": "Sat", "requests": 8400 },
    { "day": "Sun", "requests": 9100 }
  ],
  "popularCategories": [
    {
      "id": "cat_food",
      "name": "Food & Dining",
      "ruleCount": 34,
      "transactionCount": 9840,
      "color": "#2FA8A0"
    },
    {
      "id": "cat_transport",
      "name": "Transport",
      "ruleCount": 21,
      "transactionCount": 6720,
      "color": "#1B3A5C"
    },
    {
      "id": "cat_bills",
      "name": "Bills & Utilities",
      "ruleCount": 18,
      "transactionCount": 5310,
      "color": "#F59E0B"
    }
  ]
}
```

**Notes:**
- `trafficHistory` — trailing 7 days, one object per day
- `popularCategories` — ordered by rank across all platform transactions
- `badge.direction` — `"up"` or `"down"` (drives the trend icon)
- `color` — hex string (used for the category dot and progress bar)

---

## 2. GET `/api/admin/users`

```json
{
  "users": [
    {
      "id": "usr_001",
      "first_name": "Aisha",
      "last_name": "Khan",
      "email": "aisha.khan@uni.edu",
      "university_name": "National University",
      "is_active": true,
      "created_at": "2026-07-12T09:24:00Z"
    },
    {
      "id": "usr_002",
      "first_name": "Hamza",
      "last_name": "Ahmed",
      "email": "hamza.ahmed@uni.edu",
      "university_name": "Punjab University",
      "is_active": false,
      "created_at": "2026-07-18T14:02:00Z"
    }
  ],
  "total": 2
}
```

**Actions:**

### PATCH `/api/admin/users/{id}`

To block/unblock a user. Body:

```json
{
  "is_active": false
}
```

Response: the updated user object (same shape as above).

### POST `/api/admin/users`

To add a new user. Body:

```json
{
  "first_name": "Sana",
  "last_name": "Malik",
  "email": "sana.malik@uni.edu",
  "university_name": "National University",
  "password": "somepassword"
}
```

Response: the created user object.

**Details drawer fields (optional — the drawer falls back gracefully if missing):**

The frontend renders the user's details (transactions, budgets, subscriptions) from extra fields on each user object. Include them when convenient:

```json
{
  "id": "usr_001",
  "first_name": "Aisha",
  "last_name": "Khan",
  "account_status": "active",
  "last_active_at": "2026-08-14T10:40:00Z",
  "spend_6mo": [7200, 8100, 6400, 9200, 8800, 9600],
  "subscriptions_detected": 3,
  "budgets": [
    { "category": "Food & Dining", "limit": 5000, "used": 4200 }
  ],
  "transactions": [
    { "id": "tx_a1", "merchant": "Cafe Aroma", "category": "Food & Dining", "color": "#2FA8A0", "type": "expense", "amount": 850, "date": "2026-08-14T09:20:00Z" },
    { "id": "tx_a4", "merchant": "Monthly Salary", "category": "Income", "color": "#22C55E", "type": "deposit", "amount": 45000, "date": "2026-08-01T08:00:00Z" }
  ]
}
```

- `account_status` — `"active"` | `"suspended"` | `"pending"` (the UI derives the status badge from this; falls back to `is_active`)
- `transactions[].type` — `"expense"` or `"deposit"`; `color` is the category dot hex; `date` is an ISO string; list should be newest-first (drawer shows latest 5)
- `audit_log` — `{ who, action, reason, at }` entries, newest-first

---

## 3. GET `/api/admin/categories`

```json
{
  "categories": [
    {
      "id": "cat_food",
      "name": "Food & Dining",
      "color": "#2FA8A0",
      "ruleCount": 34,
      "transactionCount": 9840,
      "rules": ["restaurant", "cafe", "coffee", "pizza", "burger"]
    },
    {
      "id": "cat_transport",
      "name": "Transport",
      "color": "#1B3A5C",
      "ruleCount": 21,
      "transactionCount": 6720,
      "rules": ["uber", "careem", "petrol", "fuel", "toll"]
    }
  ],
  "total": 2
}
```

**Notes:**
- `rules` — keyword/merchant rules mapped to this category
- `transactionCount` — how many transactions were categorized into this category
- `color` — the category's hex color

**Actions:**

### POST `/api/admin/categories`

To create a new category. Body:

```json
{
  "name": "Groceries",
  "color": "#22C55E",
  "rules": ["supermarket", "market", "grocery"]
}
```

### DELETE `/api/admin/categories/{id}`

To delete a category.

### PATCH `/api/admin/categories/{id}`

To edit a category. Body (partial, any subset):

```json
{
  "name": "Groceries & Markets",
  "rules": ["supermarket", "market", "grocery", "mart"]
}
```

Response: the updated category object.

---

## Frontend Integration Steps

Once these endpoints are live:

1. In `src/components/AdminDashboard/adminApi.js`, set `USE_MOCK_DATA` to `false`
2. After login, store the token with `localStorage.setItem("smfintrack_token", token)` — the frontend will then automatically send it with every admin request

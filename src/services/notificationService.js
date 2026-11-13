/* =========================================================================
   SMFinTrack — Notification Service
   -------------------------------------------------------------------------
   Keeps all "talking to the backend" logic out of NotificationCenter.jsx.
   Right now there's no live backend, so every function returns mock data
   through a simulated network delay. The real fetch() call for each
   endpoint is written and commented directly above its mock — connecting
   the feature later just means uncommenting the fetch() and deleting the
   mock block underneath it.
   ========================================================================= */

const MOCK_DELAY_MS = 400;

const delay = (ms = MOCK_DELAY_MS) => new Promise((resolve) => setTimeout(resolve, ms));

let mockNotifications = [
  {
    id: "n1",
    category: "budget",
    message: "You've used 82% of your Food budget for this month.",
    date: "2d ago",
    read: false,
  },
  {
    id: "n2",
    category: "general",
    message: "Your bank statement for July was processed successfully.",
    date: "3d ago",
    read: false,
  },
  {
    id: "n3",
    category: "budget",
    message: "Entertainment spending is trending 15% higher than last month.",
    date: "4d ago",
    read: false,
  },
  {
    id: "n4",
    category: "general",
    message: "New feature: Spending Forecast is now available on your dashboard.",
    date: "6d ago",
    read: true,
  },
];

let mockSettings = {
  budgetAlerts: true,
  generalNotifications: false,
};

/* GET /api/notifications */
export async function getNotifications() {
  // const res = await fetch("/api/notifications");
  // if (!res.ok) throw new Error("Failed to load notifications");
  // return res.json();

  await delay();
  return mockNotifications.map((n) => ({ ...n }));
}

/* POST /api/notifications/mark-all-read */
export async function markAllRead() {
  // const res = await fetch("/api/notifications/mark-all-read", { method: "POST" });
  // if (!res.ok) throw new Error("Failed to mark notifications as read");
  // return res.json();

  await delay(200);
  mockNotifications = mockNotifications.map((n) => ({ ...n, read: true }));
  return mockNotifications.map((n) => ({ ...n }));
}

/* GET /api/notifications/settings */
export async function getSettings() {
  // const res = await fetch("/api/notifications/settings");
  // if (!res.ok) throw new Error("Failed to load notification settings");
  // return res.json();

  await delay(200);
  return { ...mockSettings };
}

/* PUT /api/notifications/settings */
export async function updateSettings(nextSettings) {
  // const res = await fetch("/api/notifications/settings", {
  //   method: "PUT",
  //   headers: { "Content-Type": "application/json" },
  //   body: JSON.stringify(nextSettings),
  // });
  // if (!res.ok) throw new Error("Failed to update notification settings");
  // return res.json();

  await delay(200);
  mockSettings = { ...mockSettings, ...nextSettings };
  return { ...mockSettings };
}

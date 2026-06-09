import type { Income, Expense, SavingsGoal, UserPrefs } from "@/types";

// ─── Incomes — 6 months, total = $39,590 ──────────────────────────────────
// Oct $6,500 | Nov $6,350 | Dec $6,630 | Jan $6,800 | Feb $6,770 | Mar $6,540
export const SEED_INCOMES: Income[] = [
  // October 2025
  { id: "i1",  date: "2025-10-01", source: "Monthly Salary",     category: "Salary",     amount: 5500 },
  { id: "i2",  date: "2025-10-15", source: "Freelance Web Work",  category: "Freelance",  amount: 850  },
  { id: "i3",  date: "2025-10-28", source: "Investment Returns",  category: "Investment", amount: 150  },
  // November 2025
  { id: "i4",  date: "2025-11-01", source: "Monthly Salary",     category: "Salary",     amount: 5500 },
  { id: "i5",  date: "2025-11-20", source: "Freelance Web Work",  category: "Freelance",  amount: 700  },
  { id: "i6",  date: "2025-11-28", source: "Investment Returns",  category: "Investment", amount: 150  },
  // December 2025
  { id: "i7",  date: "2025-12-01", source: "Monthly Salary",     category: "Salary",     amount: 5500 },
  { id: "i8",  date: "2025-12-10", source: "Freelance Web Work",  category: "Freelance",  amount: 1000 },
  { id: "i9",  date: "2025-12-28", source: "Investment Returns",  category: "Investment", amount: 130  },
  // January 2026
  { id: "i10", date: "2026-01-01", source: "Monthly Salary",     category: "Salary",     amount: 5500 },
  { id: "i11", date: "2026-01-15", source: "Freelance Web Work",  category: "Freelance",  amount: 1100 },
  { id: "i12", date: "2026-01-28", source: "Investment Returns",  category: "Investment", amount: 200  },
  // February 2026
  { id: "i13", date: "2026-02-01", source: "Monthly Salary",     category: "Salary",     amount: 5500 },
  { id: "i14", date: "2026-02-14", source: "Freelance Web Work",  category: "Freelance",  amount: 1050 },
  { id: "i15", date: "2026-02-28", source: "Investment Returns",  category: "Investment", amount: 220  },
  // March 2026
  { id: "i16", date: "2026-03-01", source: "Monthly Salary",     category: "Salary",     amount: 5500 },
  { id: "i17", date: "2026-03-15", source: "Freelance Web Work",  category: "Freelance",  amount: 890  },
  { id: "i18", date: "2026-03-28", source: "Investment Returns",  category: "Investment", amount: 150  },
];

// ─── Expenses — 6 months, total = $15,855 ─────────────────────────────────
// Oct $2,605 | Nov $2,850 | Dec $2,640 | Jan $2,705 | Feb $2,650 | Mar $2,405
export const SEED_EXPENSES: Expense[] = [
  // ── October 2025 — $2,605 ──
  { id: "e1",  date: "2025-10-01", description: "Monthly Rent",          category: "Housing",       amount: 1400, status: "Paid" },
  { id: "e2",  date: "2025-10-07", description: "Grocery Store",          category: "Food & Dining", amount: 240,  status: "Paid" },
  { id: "e3",  date: "2025-10-14", description: "Restaurant Dinner",      category: "Food & Dining", amount: 155,  status: "Paid" },
  { id: "e4",  date: "2025-10-20", description: "Coffee Shop",            category: "Food & Dining", amount: 30,   status: "Paid" },
  { id: "e5",  date: "2025-10-03", description: "Gas Station",            category: "Transport",     amount: 90,   status: "Paid" },
  { id: "e6",  date: "2025-10-11", description: "Monthly Metro Pass",     category: "Transport",     amount: 82,   status: "Paid" },
  { id: "e7",  date: "2025-10-17", description: "Rideshare",              category: "Transport",     amount: 78,   status: "Paid" },
  { id: "e8",  date: "2025-10-25", description: "Car Service",            category: "Transport",     amount: 70,   status: "Paid" },
  { id: "e9",  date: "2025-10-10", description: "Electricity Bill",       category: "Utilities",     amount: 95,   status: "Paid" },
  { id: "e10", date: "2025-10-10", description: "Internet Service",       category: "Utilities",     amount: 60,   status: "Paid" },
  { id: "e11", date: "2025-10-10", description: "Water Bill",             category: "Utilities",     amount: 45,   status: "Paid" },
  { id: "e12", date: "2025-10-20", description: "Phone Bill",             category: "Utilities",     amount: 80,   status: "Paid" },
  { id: "e13", date: "2025-10-20", description: "Gas Bill",               category: "Utilities",     amount: 70,   status: "Paid" },
  { id: "e14", date: "2025-10-01", description: "Netflix Subscription",   category: "Entertainment", amount: 15,   status: "Paid" },
  { id: "e15", date: "2025-10-01", description: "Gym Membership",         category: "Entertainment", amount: 55,   status: "Paid" },
  { id: "e16", date: "2025-10-22", description: "Movie Tickets",          category: "Entertainment", amount: 40,   status: "Paid" },
  // ── November 2025 — $2,850 ──
  { id: "e17", date: "2025-11-01", description: "Monthly Rent",          category: "Housing",       amount: 1400, status: "Paid" },
  { id: "e18", date: "2025-11-06", description: "Grocery Store",          category: "Food & Dining", amount: 290,  status: "Paid" },
  { id: "e19", date: "2025-11-15", description: "Restaurant Dinner",      category: "Food & Dining", amount: 175,  status: "Paid" },
  { id: "e20", date: "2025-11-23", description: "Coffee Shop",            category: "Food & Dining", amount: 55,   status: "Paid" },
  { id: "e21", date: "2025-11-04", description: "Gas Station",            category: "Transport",     amount: 105,  status: "Paid" },
  { id: "e22", date: "2025-11-11", description: "Monthly Metro Pass",     category: "Transport",     amount: 82,   status: "Paid" },
  { id: "e23", date: "2025-11-18", description: "Rideshare",              category: "Transport",     amount: 120,  status: "Paid" },
  { id: "e24", date: "2025-11-28", description: "Highway Toll",           category: "Transport",     amount: 73,   status: "Paid" },
  { id: "e25", date: "2025-11-10", description: "Electricity Bill",       category: "Utilities",     amount: 115,  status: "Paid" },
  { id: "e26", date: "2025-11-10", description: "Internet Service",       category: "Utilities",     amount: 60,   status: "Paid" },
  { id: "e27", date: "2025-11-10", description: "Water Bill",             category: "Utilities",     amount: 50,   status: "Paid" },
  { id: "e28", date: "2025-11-20", description: "Phone Bill",             category: "Utilities",     amount: 80,   status: "Paid" },
  { id: "e29", date: "2025-11-20", description: "Gas Bill",               category: "Utilities",     amount: 65,   status: "Paid" },
  { id: "e30", date: "2025-11-01", description: "Netflix Subscription",   category: "Entertainment", amount: 15,   status: "Paid" },
  { id: "e31", date: "2025-11-01", description: "Gym Membership",         category: "Entertainment", amount: 55,   status: "Paid" },
  { id: "e32", date: "2025-11-14", description: "Concert Tickets",        category: "Entertainment", amount: 70,   status: "Paid" },
  { id: "e33", date: "2025-11-26", description: "Books & Magazines",      category: "Entertainment", amount: 40,   status: "Paid" },
  // ── December 2025 — $2,640 ──
  { id: "e34", date: "2025-12-01", description: "Monthly Rent",          category: "Housing",       amount: 1400, status: "Paid" },
  { id: "e35", date: "2025-12-08", description: "Grocery Store",          category: "Food & Dining", amount: 260,  status: "Paid" },
  { id: "e36", date: "2025-12-20", description: "Holiday Dinner",         category: "Food & Dining", amount: 180,  status: "Paid" },
  { id: "e37", date: "2025-12-26", description: "Coffee Shop",            category: "Food & Dining", amount: 40,   status: "Paid" },
  { id: "e38", date: "2025-12-05", description: "Gas Station",            category: "Transport",     amount: 90,   status: "Paid" },
  { id: "e39", date: "2025-12-11", description: "Monthly Metro Pass",     category: "Transport",     amount: 82,   status: "Paid" },
  { id: "e40", date: "2025-12-18", description: "Rideshare",              category: "Transport",     amount: 90,   status: "Paid" },
  { id: "e41", date: "2025-12-23", description: "Airport Parking",        category: "Transport",     amount: 58,   status: "Paid" },
  { id: "e42", date: "2025-12-10", description: "Electricity Bill",       category: "Utilities",     amount: 80,   status: "Paid" },
  { id: "e43", date: "2025-12-10", description: "Internet Service",       category: "Utilities",     amount: 60,   status: "Paid" },
  { id: "e44", date: "2025-12-10", description: "Water Bill",             category: "Utilities",     amount: 45,   status: "Paid" },
  { id: "e45", date: "2025-12-20", description: "Phone Bill",             category: "Utilities",     amount: 80,   status: "Paid" },
  { id: "e46", date: "2025-12-20", description: "Gas Bill",               category: "Utilities",     amount: 15,   status: "Paid" },
  { id: "e47", date: "2025-12-01", description: "Netflix Subscription",   category: "Entertainment", amount: 15,   status: "Paid" },
  { id: "e48", date: "2025-12-01", description: "Gym Membership",         category: "Entertainment", amount: 55,   status: "Paid" },
  { id: "e49", date: "2025-12-22", description: "Christmas Gifts",        category: "Entertainment", amount: 90,   status: "Paid" },
  // ── January 2026 — $2,705 ──
  { id: "e50", date: "2026-01-01", description: "Monthly Rent",          category: "Housing",       amount: 1400, status: "Paid" },
  { id: "e51", date: "2026-01-07", description: "Grocery Store",          category: "Food & Dining", amount: 250,  status: "Paid" },
  { id: "e52", date: "2026-01-16", description: "Restaurant",             category: "Food & Dining", amount: 155,  status: "Paid" },
  { id: "e53", date: "2026-01-24", description: "Coffee Shop",            category: "Food & Dining", amount: 35,   status: "Paid" },
  { id: "e54", date: "2026-01-04", description: "Gas Station",            category: "Transport",     amount: 95,   status: "Paid" },
  { id: "e55", date: "2026-01-11", description: "Monthly Metro Pass",     category: "Transport",     amount: 82,   status: "Paid" },
  { id: "e56", date: "2026-01-19", description: "Rideshare",              category: "Transport",     amount: 110,  status: "Paid" },
  { id: "e57", date: "2026-01-27", description: "Parking",                category: "Transport",     amount: 73,   status: "Paid" },
  { id: "e58", date: "2026-01-10", description: "Electricity Bill",       category: "Utilities",     amount: 110,  status: "Paid" },
  { id: "e59", date: "2026-01-10", description: "Internet Service",       category: "Utilities",     amount: 60,   status: "Paid" },
  { id: "e60", date: "2026-01-10", description: "Water Bill",             category: "Utilities",     amount: 45,   status: "Paid" },
  { id: "e61", date: "2026-01-20", description: "Phone Bill",             category: "Utilities",     amount: 80,   status: "Paid" },
  { id: "e62", date: "2026-01-20", description: "Gas Bill",               category: "Utilities",     amount: 65,   status: "Paid" },
  { id: "e63", date: "2026-01-01", description: "Netflix Subscription",   category: "Entertainment", amount: 15,   status: "Paid" },
  { id: "e64", date: "2026-01-01", description: "Gym Membership",         category: "Entertainment", amount: 55,   status: "Paid" },
  { id: "e65", date: "2026-01-12", description: "Books & Magazines",      category: "Entertainment", amount: 35,   status: "Paid" },
  { id: "e66", date: "2026-01-25", description: "Spotify & Streaming",    category: "Entertainment", amount: 40,   status: "Paid" },
  // ── February 2026 — $2,650 ──
  { id: "e67", date: "2026-02-01", description: "Monthly Rent",          category: "Housing",       amount: 1400, status: "Paid" },
  { id: "e68", date: "2026-02-07", description: "Grocery Store",          category: "Food & Dining", amount: 230,  status: "Paid" },
  { id: "e69", date: "2026-02-15", description: "Restaurant",             category: "Food & Dining", amount: 135,  status: "Paid" },
  { id: "e70", date: "2026-02-22", description: "Coffee Shop",            category: "Food & Dining", amount: 35,   status: "Paid" },
  { id: "e71", date: "2026-02-04", description: "Gas Station",            category: "Transport",     amount: 85,   status: "Paid" },
  { id: "e72", date: "2026-02-11", description: "Monthly Metro Pass",     category: "Transport",     amount: 82,   status: "Paid" },
  { id: "e73", date: "2026-02-18", description: "Rideshare",              category: "Transport",     amount: 100,  status: "Paid" },
  { id: "e74", date: "2026-02-25", description: "Parking",                category: "Transport",     amount: 73,   status: "Paid" },
  { id: "e75", date: "2026-02-10", description: "Electricity Bill",       category: "Utilities",     amount: 105,  status: "Paid" },
  { id: "e76", date: "2026-02-10", description: "Internet Service",       category: "Utilities",     amount: 60,   status: "Paid" },
  { id: "e77", date: "2026-02-10", description: "Water Bill",             category: "Utilities",     amount: 40,   status: "Paid" },
  { id: "e78", date: "2026-02-20", description: "Phone Bill",             category: "Utilities",     amount: 80,   status: "Paid" },
  { id: "e79", date: "2026-02-20", description: "Gas Bill",               category: "Utilities",     amount: 55,   status: "Paid" },
  { id: "e80", date: "2026-02-01", description: "Netflix Subscription",   category: "Entertainment", amount: 15,   status: "Paid" },
  { id: "e81", date: "2026-02-01", description: "Gym Membership",         category: "Entertainment", amount: 55,   status: "Paid" },
  { id: "e82", date: "2026-02-14", description: "Valentine's Dinner",     category: "Entertainment", amount: 65,   status: "Paid" },
  { id: "e83", date: "2026-02-27", description: "Cinema",                 category: "Entertainment", amount: 35,   status: "Paid" },
  // ── March 2026 — $2,405 ──
  { id: "e84", date: "2026-03-01", description: "Monthly Rent",          category: "Housing",       amount: 1400, status: "Paid" },
  { id: "e85", date: "2026-03-07", description: "Grocery Store",          category: "Food & Dining", amount: 220,  status: "Paid" },
  { id: "e86", date: "2026-03-16", description: "Restaurant",             category: "Food & Dining", amount: 130,  status: "Paid" },
  { id: "e87", date: "2026-03-23", description: "Coffee Shop",            category: "Food & Dining", amount: 40,   status: "Paid" },
  { id: "e88", date: "2026-03-05", description: "Gas Station",            category: "Transport",     amount: 80,   status: "Paid" },
  { id: "e89", date: "2026-03-11", description: "Monthly Metro Pass",     category: "Transport",     amount: 82,   status: "Paid" },
  { id: "e90", date: "2026-03-18", description: "Rideshare",              category: "Transport",     amount: 65,   status: "Paid" },
  { id: "e91", date: "2026-03-25", description: "Parking",                category: "Transport",     amount: 43,   status: "Paid" },
  { id: "e92", date: "2026-03-10", description: "Electricity Bill",       category: "Utilities",     amount: 90,   status: "Paid" },
  { id: "e93", date: "2026-03-10", description: "Internet Service",       category: "Utilities",     amount: 60,   status: "Paid" },
  { id: "e94", date: "2026-03-10", description: "Water Bill",             category: "Utilities",     amount: 40,   status: "Paid" },
  { id: "e95", date: "2026-03-20", description: "Phone Bill",             category: "Utilities",     amount: 60,   status: "Paid" },
  { id: "e96", date: "2026-03-01", description: "Netflix Subscription",   category: "Entertainment", amount: 15,   status: "Paid" },
  { id: "e97", date: "2026-03-01", description: "Gym Membership",         category: "Entertainment", amount: 55,   status: "Paid" },
  { id: "e98", date: "2026-03-22", description: "Cinema",                 category: "Entertainment", amount: 25,   status: "Paid" },
];

// ─── Savings Goals ─────────────────────────────────────────────────────────
// Total target $70,000 | Total saved $22,500 | Remaining $47,500
export const SEED_GOALS: SavingsGoal[] = [
  { id: "g1", name: "Emergency Fund",  icon: "shield-check", saved: 8500,  target: 15000, targetDate: "2027-01-01" },
  { id: "g2", name: "Dream Vacation",  icon: "plane",        saved: 1200,  target: 3000,  targetDate: "2026-06-03" },
  { id: "g3", name: "New Laptop",      icon: "laptop",       saved: 800,   target: 2000,  targetDate: "2026-06-30" },
  { id: "g4", name: "Down Payment",    icon: "home",         saved: 12000, target: 50000, targetDate: "2027-12-31" },
];

// ─── Default user preferences ──────────────────────────────────────────────
export const DEFAULT_PREFS: UserPrefs = {
  currency: "USD",
  language: "en",
  theme: "system",
  displayName: "Alex",
};

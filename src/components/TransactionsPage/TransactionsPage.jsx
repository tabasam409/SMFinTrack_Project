import { useEffect, useMemo, useRef, useState } from "react";
import {
  Menu,
  Search,
  Tag,
  Calendar,
  SlidersHorizontal,
  ArrowUpDown,
  ChevronUp,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Download,
  Plus,
  MoreVertical,
  Pencil,
  Trash2,
  Utensils,
  Wallet,
  Car,
  BookOpen,
  FileText,
  ShoppingBag,
  ArrowUp,
  ArrowDown,
  X,
} from "lucide-react";

import { BudgetSidebar, SHELL_STYLES } from "../BudgetSetupPage/BudgetSetupPage";
import TopNavigation from "../TopNavigation/TopNavigation";
import "./TransactionsPage.css";

/* =========================================================================
   SMFinTrack — Transactions Page
   Ported from Awais's SMFinTrack_Project (src/components/Transactions),
   dropped into the same bsp-sidebar / TopNavigation shell every other
   page in this app uses (see BudgetSetupPage.jsx). "Add Transaction" and
   row "Edit" open a modal (tp-modal, mirrors the pattern used in
   BudgetTrackingPage's Quick Add modal) that adds/updates an entry in
   local state — there's no backend yet, so nothing persists across a
   page refresh.
   ========================================================================= */

// ---- Category metadata: color + icon per category, matching the mockup ----
const CATEGORY_META = {
  "Food & Dining": { bg: "#EAF9EE", color: "#1F9254", icon: Utensils },
  Income: { bg: "#E3F7F1", color: "#0E8C74", icon: Wallet },
  Transportation: { bg: "#FFF1E0", color: "#D97706", icon: Car },
  Education: { bg: "#F1EBFB", color: "#7C3AED", icon: BookOpen },
  "Bills & Utilities": { bg: "#E3F3F7", color: "#0E7C9C", icon: FileText },
  Shopping: { bg: "#FCEAF3", color: "#DB2777", icon: ShoppingBag },
};

const CATEGORIES = ["All Categories", ...Object.keys(CATEGORY_META)];
const DATE_RANGES = ["All Time", "Last 7 Days", "Last 30 Days", "This Month", "Last Month"];
const TYPES = ["All Types", "Income", "Expense"];
const PAGE_SIZE_OPTIONS = [10, 20, 50];

// Blank starting point for the Add/Edit Transaction form.
const EMPTY_FORM = {
  description: "",
  subtitle: "",
  category: Object.keys(CATEGORY_META)[0],
  type: "Expense",
  amount: "",
  date: "",
};

const SORT_FIELDS = [
  { value: "date", label: "Date" },
  { value: "description", label: "Description" },
  { value: "category", label: "Category" },
  { value: "amount", label: "Amount" },
  { value: "type", label: "Type" },
];

// Direction labels change based on what's being sorted, matching the mockup's "Newest First".
function directionOptions(field) {
  if (field === "date") return [{ value: "desc", label: "Newest First" }, { value: "asc", label: "Oldest First" }];
  if (field === "amount") return [{ value: "desc", label: "Highest First" }, { value: "asc", label: "Lowest First" }];
  return [{ value: "asc", label: "A to Z" }, { value: "desc", label: "Z to A" }];
}

// The mock data below always sits close to this fixed "today" so the
// date-range filters have something meaningful to show.
// TODO: once the transaction API is wired up, replace
// generateMockTransactions() with a real fetch and swap TODAY for `new Date()`.
const TODAY = new Date("2025-05-22");

const TEMPLATES = [
  { description: "Grocery Shopping", subtitle: "Imtiaz Super Market", category: "Food & Dining", amount: -3250 },
  { description: "Freelance Payment", subtitle: "UI/UX Project", category: "Income", amount: 15000 },
  { description: "Transport to University", subtitle: "By Metro Bus", category: "Transportation", amount: -500 },
  { description: "Online Course", subtitle: "React JS Course", category: "Education", amount: -2500 },
  { description: "Pocket Money", subtitle: "From Mom", category: "Income", amount: 10000 },
  { description: "Dinner with Friends", subtitle: "Cafe Alhamra", category: "Food & Dining", amount: -1800 },
  { description: "Book Purchase", subtitle: "University Book Shop", category: "Education", amount: -1200 },
  { description: "Freelance Payment", subtitle: "Mobile App Design", category: "Income", amount: 12000 },
  { description: "Internet Bill", subtitle: "PTCL", category: "Bills & Utilities", amount: -1500 },
  { description: "Shopping", subtitle: "Outfitters", category: "Shopping", amount: -4200 },
  { description: "Taxi Ride", subtitle: "Careem", category: "Transportation", amount: -650 },
  { description: "Electricity Bill", subtitle: "LESCO", category: "Bills & Utilities", amount: -3400 },
  { description: "Coffee with Classmates", subtitle: "Cafe Zouq", category: "Food & Dining", amount: -600 },
  { description: "Part-time Tuition", subtitle: "O-Level Student", category: "Income", amount: 8000 },
  { description: "Sneakers", subtitle: "Sports Zone", category: "Shopping", amount: -5200 },
];

// Generates 124 mock transactions, ~2 per day going backward from TODAY —
// enough to see real, multi-page pagination the way the mockup shows it.
function generateMockTransactions() {
  const rows = [];
  for (let i = 0; i < 124; i++) {
    const template = TEMPLATES[i % TEMPLATES.length];
    const daysBack = Math.floor(i / 2);
    const date = new Date(TODAY);
    date.setDate(date.getDate() - daysBack);

    rows.push({
      id: `tx${i + 1}`,
      date: date.toISOString().slice(0, 10),
      description: template.description,
      subtitle: template.subtitle,
      category: template.category,
      amount: template.amount,
    });
  }
  return rows;
}

function formatDateLabel(isoDate) {
  return new Date(isoDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function formatSignedPKR(amount) {
  const sign = amount >= 0 ? "+" : "-";
  return `${sign}PKR ${Math.abs(amount).toLocaleString("en-PK")}`;
}

function withinDateRange(isoDate, range) {
  if (range === "All Time") return true;
  const date = new Date(isoDate);
  const daysAgo = Math.round((TODAY - date) / (1000 * 60 * 60 * 24));

  if (range === "Last 7 Days") return daysAgo >= 0 && daysAgo <= 7;
  if (range === "Last 30 Days") return daysAgo >= 0 && daysAgo <= 30;
  if (range === "This Month") {
    return date.getFullYear() === TODAY.getFullYear() && date.getMonth() === TODAY.getMonth();
  }
  if (range === "Last Month") {
    const lastMonth = new Date(TODAY.getFullYear(), TODAY.getMonth() - 1, 1);
    return date.getFullYear() === lastMonth.getFullYear() && date.getMonth() === lastMonth.getMonth();
  }
  return true;
}

// Builds a compact page-number list with ellipses, e.g. 1 2 3 4 5 ... 7
function getPageNumbers(current, total) {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);

  const pages = [1];
  if (current > 3) pages.push("...");

  const start = Math.max(2, current - 1);
  const end = Math.min(total - 1, current + 1);
  for (let p = start; p <= end; p++) pages.push(p);

  if (current < total - 2) pages.push("...");
  pages.push(total);

  return pages;
}

function exportToCSV(rows) {
  const header = ["Date", "Description", "Source", "Category", "Amount", "Type"];
  const lines = rows.map((tx) => [
    tx.date,
    tx.description,
    tx.subtitle,
    tx.category,
    tx.amount,
    tx.amount >= 0 ? "Income" : "Expense",
  ].map((v) => `"${String(v).replace(/"/g, '""')}"`).join(","));

  const csv = [header.join(","), ...lines].join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "transactions.csv";
  link.click();
  URL.revokeObjectURL(url);
}

const WEEKDAY_LABELS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

function isSameDay(a, b) {
  return !!a && !!b && a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

function toISODate(d) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

// Builds a 7-column day grid for the given month, padded with the tail of
// the previous month and the start of the next so every row is full.
function buildCalendarCells(year, month) {
  const firstOfMonth = new Date(year, month, 1);
  const startDay = firstOfMonth.getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrevMonth = new Date(year, month, 0).getDate();

  const cells = [];
  for (let i = startDay - 1; i >= 0; i--) {
    cells.push({ date: new Date(year, month - 1, daysInPrevMonth - i), muted: true });
  }
  for (let d = 1; d <= daysInMonth; d++) {
    cells.push({ date: new Date(year, month, d), muted: false });
  }
  let nextDay = 1;
  while (cells.length % 7 !== 0) {
    cells.push({ date: new Date(year, month + 1, nextDay), muted: true });
    nextDay++;
  }
  return cells;
}

// Custom-styled replacement for a native <input type="date">, so the
// calendar dropdown matches the app's theme instead of the browser/OS
// default picker shown in the design review screenshot.
function DateField({ id, value, onChange, hasError }) {
  const selected = value ? new Date(`${value}T00:00:00`) : null;
  const [open, setOpen] = useState(false);
  const [viewDate, setViewDate] = useState(selected || new Date());
  const [openUpward, setOpenUpward] = useState(false);
  const wrapRef = useRef(null);

  useEffect(() => {
    function handleOutsideClick(e) {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false);
    }
    if (open) document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, [open]);

  const toggleOpen = () => {
    if (!open && wrapRef.current) {
      // Flip the panel above the field instead of below when there isn't
      // enough room left in the viewport, so it never gets cut off.
      const rect = wrapRef.current.getBoundingClientRect();
      const estimatedPanelHeight = 340;
      setOpenUpward(rect.bottom + estimatedPanelHeight > window.innerHeight);
    }
    setViewDate(selected || new Date());
    setOpen((v) => !v);
  };

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const monthLabel = viewDate.toLocaleDateString("en-US", { month: "long", year: "numeric" });
  const cells = useMemo(() => buildCalendarCells(year, month), [year, month]);

  const pick = (date) => {
    onChange(toISODate(date));
    setOpen(false);
  };

  const displayLabel = selected
    ? selected.toLocaleDateString("en-GB", { day: "2-digit", month: "2-digit", year: "numeric" })
    : "Select date";

  return (
    <div className={`tp-date-field${hasError ? " has-error" : ""}`} ref={wrapRef}>
      <button type="button" id={id} className="tp-date-trigger" onClick={toggleOpen}>
        <Calendar size={15} />
        <span className={selected ? "" : "tp-date-placeholder"}>{displayLabel}</span>
        <ChevronDown size={14} className="tp-date-trigger-arrow" />
      </button>

      {open && (
        <div className={`tp-date-dropdown${openUpward ? " upward" : ""}`}>
          <div className="tp-date-header">
            <span className="tp-date-month-label">{monthLabel}</span>
            <div className="tp-date-nav">
              <button
                type="button"
                className="tp-date-nav-btn"
                onClick={() => setViewDate(new Date(year, month - 1, 1))}
                aria-label="Previous month"
              >
                <ChevronLeft size={16} />
              </button>
              <button
                type="button"
                className="tp-date-nav-btn"
                onClick={() => setViewDate(new Date(year, month + 1, 1))}
                aria-label="Next month"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>

          <div className="tp-date-weekdays">
            {WEEKDAY_LABELS.map((d) => <span key={d}>{d}</span>)}
          </div>

          <div className="tp-date-grid">
            {cells.map((c, idx) => {
              const isSelected = isSameDay(c.date, selected);
              const isToday = isSameDay(c.date, today);
              return (
                <button
                  key={idx}
                  type="button"
                  className={`tp-date-cell${c.muted ? " muted" : ""}${isSelected ? " selected" : ""}${isToday && !isSelected ? " today" : ""}`}
                  onClick={() => pick(c.date)}
                >
                  {c.date.getDate()}
                </button>
              );
            })}
          </div>

          <div className="tp-date-footer">
            <button type="button" className="tp-date-link" onClick={() => { onChange(""); setOpen(false); }}>
              Clear
            </button>
            <button type="button" className="tp-date-link accent" onClick={() => pick(today)}>
              Today
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function TransactionsPage({ onNavigate }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [toast, setToast] = useState(null);
  const toastTimer = useRef(null);
  const showToast = (msg) => {
    setToast(msg);
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 2200);
  };

  const [transactions, setTransactions] = useState(generateMockTransactions);

  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All Categories");
  const [dateRangeFilter, setDateRangeFilter] = useState("All Time");
  const [typeFilter, setTypeFilter] = useState("All Types");
  const [showMoreFilters, setShowMoreFilters] = useState(false);

  const [sortField, setSortField] = useState("date");
  const [sortDirection, setSortDirection] = useState("desc");

  const [pageSize, setPageSize] = useState(20);
  const [currentPage, setCurrentPage] = useState(1);

  const [openMenuId, setOpenMenuId] = useState(null);

  // ---- Add / Edit Transaction modal ----
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState("add"); // "add" | "edit"
  const [editingTxId, setEditingTxId] = useState(null);
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [formErrors, setFormErrors] = useState({});

  const openAddModal = () => {
    setModalMode("add");
    setEditingTxId(null);
    setFormData({ ...EMPTY_FORM, date: TODAY.toISOString().slice(0, 10) });
    setFormErrors({});
    setModalOpen(true);
  };

  const openEditModal = (tx) => {
    setModalMode("edit");
    setEditingTxId(tx.id);
    setFormData({
      description: tx.description,
      subtitle: tx.subtitle || "",
      category: tx.category,
      type: tx.amount >= 0 ? "Income" : "Expense",
      amount: String(Math.abs(tx.amount)),
      date: tx.date,
    });
    setFormErrors({});
    setOpenMenuId(null);
    setModalOpen(true);
  };

  const closeModal = () => setModalOpen(false);

  const handleFormChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (formErrors[field]) setFormErrors((prev) => ({ ...prev, [field]: "" }));
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.description.trim()) errors.description = "Description is required.";
    const amountNum = Number(formData.amount);
    if (!formData.amount || Number.isNaN(amountNum) || amountNum <= 0) {
      errors.amount = "Enter a valid amount greater than 0.";
    }
    if (!formData.category) errors.category = "Select a category.";
    if (!formData.date) errors.date = "Select a date.";
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    const signedAmount =
      formData.type === "Income" ? Math.abs(Number(formData.amount)) : -Math.abs(Number(formData.amount));

    if (modalMode === "add") {
      const newTx = {
        id: `tx${Date.now()}`,
        date: formData.date,
        description: formData.description.trim(),
        subtitle: formData.subtitle.trim(),
        category: formData.category,
        amount: signedAmount,
      };
      setTransactions((prev) => [newTx, ...prev]);
      showToast("Transaction added");
    } else {
      setTransactions((prev) =>
        prev.map((t) =>
          t.id === editingTxId
            ? {
                ...t,
                date: formData.date,
                description: formData.description.trim(),
                subtitle: formData.subtitle.trim(),
                category: formData.category,
                amount: signedAmount,
              }
            : t
        )
      );
      showToast("Transaction updated");
    }

    setModalOpen(false);
    setCurrentPage(1);
  };

  const filteredAndSorted = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();

    const filtered = transactions.filter((tx) => {
      const type = tx.amount >= 0 ? "Income" : "Expense";
      const matchesSearch =
        !term ||
        tx.description.toLowerCase().includes(term) ||
        tx.subtitle.toLowerCase().includes(term);
      const matchesCategory = categoryFilter === "All Categories" || tx.category === categoryFilter;
      const matchesDateRange = withinDateRange(tx.date, dateRangeFilter);
      const matchesType = typeFilter === "All Types" || type === typeFilter;

      return matchesSearch && matchesCategory && matchesDateRange && matchesType;
    });

    const sorted = [...filtered].sort((a, b) => {
      let diff;
      if (sortField === "date") {
        diff = new Date(a.date) - new Date(b.date);
      } else if (sortField === "amount") {
        diff = a.amount - b.amount;
      } else if (sortField === "type") {
        const aType = a.amount >= 0 ? "Income" : "Expense";
        const bType = b.amount >= 0 ? "Income" : "Expense";
        diff = aType.localeCompare(bType);
      } else {
        diff = a[sortField].localeCompare(b[sortField]);
      }
      return sortDirection === "asc" ? diff : -diff;
    });

    return sorted;
  }, [transactions, searchTerm, categoryFilter, dateRangeFilter, typeFilter, sortField, sortDirection]);

  const totalPages = Math.max(1, Math.ceil(filteredAndSorted.length / pageSize));
  const safePage = Math.min(currentPage, totalPages);

  const pageItems = filteredAndSorted.slice((safePage - 1) * pageSize, safePage * pageSize);

  const rangeStart = filteredAndSorted.length === 0 ? 0 : (safePage - 1) * pageSize + 1;
  const rangeEnd = Math.min(safePage * pageSize, filteredAndSorted.length);

  // Any change to search/filters/sort/page-size lands the user back on page 1.
  function updateAndResetPage(setter) {
    return (value) => {
      setter(value);
      setCurrentPage(1);
    };
  }

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDirection(directionOptions(field)[0].value);
    }
    setCurrentPage(1);
  };

  const SortIcon = ({ field }) => {
    if (sortField !== field) return <ArrowUpDown size={13} className="sort-icon-idle" />;
    return sortDirection === "asc" ? <ChevronUp size={14} /> : <ChevronDown size={14} />;
  };

  const handleDelete = (id) => {
    setTransactions((prev) => prev.filter((tx) => tx.id !== id));
    setOpenMenuId(null);
    showToast("Transaction deleted");
  };

  return (
    <div className="bsp-app">
      <style>{SHELL_STYLES}</style>

      <BudgetSidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        activeId="transactions"
        onNavigate={onNavigate}
      />

      <main className="bsp-main">
        <TopNavigation
          title="Transactions"
          userInitials="NA"
          onSettingsClick={() => onNavigate && onNavigate("settings")}
        />

        <button
          type="button"
          className="bsp-menu-btn tp-mobile-menu"
          onClick={() => setSidebarOpen(true)}
          aria-label="Open menu"
        >
          <Menu size={20} />
        </button>

        <div className="transactions-page">

          {/* ================= PAGE HEADING ================= */}
          <section className="transactions-heading-row">
            <div className="transactions-heading-text">
              <h1>Transactions</h1>
              <p>View and manage all your income and expenses.</p>
            </div>
          </section>

          {/* ================= TOOLBAR: SEARCH + FILTERS ================= */}
          <section className="transactions-toolbar-card">

            <div className="toolbar-row">
              <div className="transactions-search">
                <Search size={18} />
                <input
                  type="text"
                  placeholder="Search transactions..."
                  value={searchTerm}
                  onChange={(e) => updateAndResetPage(setSearchTerm)(e.target.value)}
                />
              </div>

              <div className="toolbar-select has-icon">
                <Tag size={16} />
                <select value={categoryFilter} onChange={(e) => updateAndResetPage(setCategoryFilter)(e.target.value)}>
                  {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
                <ChevronDown size={15} className="toolbar-select-arrow" />
              </div>

              <div className="toolbar-select has-icon date-range-select">
                <Calendar size={16} />
                <select value={dateRangeFilter} onChange={(e) => updateAndResetPage(setDateRangeFilter)(e.target.value)}>
                  {DATE_RANGES.map((r) => (
                    <option key={r} value={r}>{r}</option>
                  ))}
                </select>
                <ChevronDown size={15} className="toolbar-select-arrow" />
              </div>

              <button
                type="button"
                className={`toolbar-more-filters ${showMoreFilters ? "active" : ""}`}
                onClick={() => setShowMoreFilters((v) => !v)}
              >
                <SlidersHorizontal size={16} />
                More Filters
                <ChevronDown size={15} />
              </button>
            </div>

            {showMoreFilters && (
              <div className="more-filters-panel">
                <div className="form-field-inline">
                  <label htmlFor="typeFilter">Type</label>
                  <div className="toolbar-select">
                    <select
                      id="typeFilter"
                      value={typeFilter}
                      onChange={(e) => updateAndResetPage(setTypeFilter)(e.target.value)}
                    >
                      {TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                    </select>
                    <ChevronDown size={15} className="toolbar-select-arrow" />
                  </div>
                </div>
              </div>
            )}

            <div className="toolbar-row sort-row">
              <span className="sort-by-label">Sort by:</span>

              <div className="toolbar-select sort-select">
                <select
                  value={sortField}
                  onChange={(e) => {
                    const field = e.target.value;
                    setSortField(field);
                    setSortDirection(directionOptions(field)[0].value);
                    setCurrentPage(1);
                  }}
                >
                  {SORT_FIELDS.map((f) => <option key={f.value} value={f.value}>{f.label}</option>)}
                </select>
                <ChevronDown size={15} className="toolbar-select-arrow" />
              </div>

              <div className="toolbar-select sort-select">
                <select
                  value={sortDirection}
                  onChange={(e) => { setSortDirection(e.target.value); setCurrentPage(1); }}
                >
                  {directionOptions(sortField).map((d) => (
                    <option key={d.value} value={d.value}>{d.label}</option>
                  ))}
                </select>
                <ChevronDown size={15} className="toolbar-select-arrow" />
              </div>

              <div className="toolbar-spacer" />

              <button type="button" className="toolbar-secondary-btn" onClick={() => exportToCSV(filteredAndSorted)}>
                <Download size={16} />
                Export
              </button>

              <button
                type="button"
                className="toolbar-primary-btn"
                onClick={openAddModal}
              >
                <Plus size={16} />
                Add Transaction
              </button>
            </div>

          </section>

          {/* ================= TRANSACTIONS TABLE ================= */}
          <section className="transactions-card">

            <div className="transactions-table-wrap">
              <table className="transactions-table">
                <thead>
                  <tr>
                    <th className="sortable" onClick={() => handleSort("date")}>
                      <span>Date <SortIcon field="date" /></span>
                    </th>
                    <th className="sortable" onClick={() => handleSort("description")}>
                      <span>Description <SortIcon field="description" /></span>
                    </th>
                    <th className="sortable" onClick={() => handleSort("category")}>
                      <span>Category <SortIcon field="category" /></span>
                    </th>
                    <th className="sortable amount-col" onClick={() => handleSort("amount")}>
                      <span>Amount <SortIcon field="amount" /></span>
                    </th>
                    <th className="sortable" onClick={() => handleSort("type")}>
                      <span>Type <SortIcon field="type" /></span>
                    </th>
                    <th className="actions-col">Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {pageItems.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="transactions-empty">
                        No transactions match your search and filters.
                      </td>
                    </tr>
                  ) : (
                    pageItems.map((tx) => {
                      const meta = CATEGORY_META[tx.category];
                      const CategoryIcon = meta.icon;
                      const isIncome = tx.amount >= 0;

                      return (
                        <tr key={tx.id}>
                          <td className="date-col">{formatDateLabel(tx.date)}</td>

                          <td>
                            <div className="description-cell">
                              <span className="description-title">{tx.description}</span>
                              <span className="description-subtitle">{tx.subtitle}</span>
                            </div>
                          </td>

                          <td>
                            <span className="category-badge" style={{ background: meta.bg, color: meta.color }}>
                              <CategoryIcon size={13} />
                              {tx.category}
                            </span>
                          </td>

                          <td className={`amount-col ${isIncome ? "positive" : "negative"}`}>
                            {formatSignedPKR(tx.amount)}
                          </td>

                          <td>
                            <span className={`type-badge ${isIncome ? "income" : "expense"}`}>
                              {isIncome ? <ArrowUp size={12} /> : <ArrowDown size={12} />}
                              {isIncome ? "Income" : "Expense"}
                            </span>
                          </td>

                          <td className="actions-col">
                            <div className="actions-menu-wrap">
                              <button
                                type="button"
                                className="actions-trigger"
                                onClick={() => setOpenMenuId((id) => (id === tx.id ? null : tx.id))}
                                aria-label="Row actions"
                              >
                                <MoreVertical size={16} />
                              </button>

                              {openMenuId === tx.id && (
                                <div className="actions-menu">
                                  <button
                                    type="button"
                                    onClick={() => openEditModal(tx)}
                                  >
                                    <Pencil size={14} /> Edit
                                  </button>
                                  <button type="button" className="danger" onClick={() => handleDelete(tx.id)}>
                                    <Trash2 size={14} /> Delete
                                  </button>
                                </div>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* ================= PAGINATION ================= */}
            <div className="transactions-pagination">
              <span className="pagination-summary">
                Showing {rangeStart} to {rangeEnd} of {filteredAndSorted.length} transactions
              </span>

              <div className="pagination-controls">
                <button
                  type="button"
                  className="pagination-btn"
                  disabled={safePage === 1}
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  aria-label="Previous page"
                >
                  <ChevronLeft size={16} />
                </button>

                {getPageNumbers(safePage, totalPages).map((p, idx) =>
                  p === "..." ? (
                    <span key={`ellipsis-${idx}`} className="pagination-ellipsis">...</span>
                  ) : (
                    <button
                      key={p}
                      type="button"
                      className={`pagination-page-btn ${p === safePage ? "active" : ""}`}
                      onClick={() => setCurrentPage(p)}
                    >
                      {p}
                    </button>
                  )
                )}

                <button
                  type="button"
                  className="pagination-btn"
                  disabled={safePage === totalPages}
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  aria-label="Next page"
                >
                  <ChevronRight size={16} />
                </button>
              </div>

              <div className="toolbar-select page-size-select">
                <select
                  value={pageSize}
                  onChange={(e) => { setPageSize(Number(e.target.value)); setCurrentPage(1); }}
                >
                  {PAGE_SIZE_OPTIONS.map((n) => <option key={n} value={n}>{n} per page</option>)}
                </select>
                <ChevronDown size={15} className="toolbar-select-arrow" />
              </div>
            </div>

          </section>

        </div>

        <div className={`tp-toast${toast ? " show" : ""}`}>{toast}</div>

        {/* ================= ADD / EDIT TRANSACTION MODAL ================= */}
        {modalOpen && (
          <div className="tp-modal-overlay" onClick={(e) => e.target === e.currentTarget && closeModal()}>
            <div className="tp-modal">
              <div className="tp-modal-head">
                <span className="tp-modal-icon">
                  {modalMode === "edit" ? <Pencil size={18} /> : <Plus size={18} strokeWidth={2.5} />}
                </span>
                <div>
                  <h3>{modalMode === "edit" ? "Edit Transaction" : "Add Transaction"}</h3>
                  <p>{modalMode === "edit" ? "Update the details below" : "Log a new income or expense"}</p>
                </div>
                <button type="button" className="tp-modal-close" onClick={closeModal} aria-label="Close">
                  <X size={16} />
                </button>
              </div>

              <form onSubmit={handleFormSubmit}>
                <div className="tp-field">
                  <label htmlFor="txDescription">Description</label>
                  <input
                    id="txDescription"
                    type="text"
                    placeholder="e.g. Grocery Shopping"
                    value={formData.description}
                    onChange={(e) => handleFormChange("description", e.target.value)}
                  />
                  {formErrors.description && <small className="tp-field-error">{formErrors.description}</small>}
                </div>

                <div className="tp-field">
                  <label htmlFor="txSubtitle">Source / Note (optional)</label>
                  <input
                    id="txSubtitle"
                    type="text"
                    placeholder="e.g. Imtiaz Super Market"
                    value={formData.subtitle}
                    onChange={(e) => handleFormChange("subtitle", e.target.value)}
                  />
                </div>

                <div className="tp-field-row">
                  <div className="tp-field">
                    <label htmlFor="txType">Type</label>
                    <select
                      id="txType"
                      value={formData.type}
                      onChange={(e) => handleFormChange("type", e.target.value)}
                    >
                      <option value="Expense">Expense</option>
                      <option value="Income">Income</option>
                    </select>
                  </div>

                  <div className="tp-field">
                    <label htmlFor="txAmount">Amount (PKR)</label>
                    <input
                      id="txAmount"
                      type="number"
                      min="1"
                      step="1"
                      placeholder="e.g. 2500"
                      value={formData.amount}
                      onChange={(e) => handleFormChange("amount", e.target.value)}
                    />
                    {formErrors.amount && <small className="tp-field-error">{formErrors.amount}</small>}
                  </div>
                </div>

                <div className="tp-field-row">
                  <div className="tp-field">
                    <label htmlFor="txCategory">Category</label>
                    <select
                      id="txCategory"
                      value={formData.category}
                      onChange={(e) => handleFormChange("category", e.target.value)}
                    >
                      {Object.keys(CATEGORY_META).map((c) => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>

                  <div className="tp-field">
                    <label htmlFor="txDate">Date</label>
                    <DateField
                      id="txDate"
                      value={formData.date}
                      onChange={(v) => handleFormChange("date", v)}
                      hasError={!!formErrors.date}
                    />
                    {formErrors.date && <small className="tp-field-error">{formErrors.date}</small>}
                  </div>
                </div>

                <div className="tp-modal-actions">
                  <button type="button" className="tp-btn-secondary" onClick={closeModal}>
                    Cancel
                  </button>
                  <button type="submit" className="tp-btn-primary">
                    {modalMode === "edit" ? "Save Changes" : "Add Transaction"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

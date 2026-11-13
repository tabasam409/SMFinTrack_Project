import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import "./CategoryManagementPage.css";

import {
  Search,
  Plus,
  Pencil,
  Trash2,
  AlertTriangle,
  ChevronDown,
  ChevronRight,
  ChevronsUpDown,
  ArrowUp,
  ArrowDown,
  X,
  Tag,
  FolderTree,
  GripVertical,
  MoreVertical,
} from "lucide-react";

/* -------------------------------------------------------------------------
 * T15 perf fix: this file used to do `import * as LucideIcons from
 * "lucide-react"`, which pulls the *entire* icon library into this page's
 * chunk (it measured 664 KB / 166 KB gzip on its own — bigger than the
 * whole rest of the app combined) because a wildcard import defeats
 * tree-shaking. Only the icons actually offered in ICON_CHOICES are ever
 * rendered, so we import those explicitly and look them up by name.
 * ---------------------------------------------------------------------- */
import {
  Utensils, ShoppingCart, UtensilsCrossed, Sandwich, Coffee, Bike,
  Car, CarFront, Bus, TrainFront, Fuel, SquareParking,
  Zap, Flame, Droplet, Wifi, Phone, Smartphone, Signal,
  Film, Clapperboard, Tv, Gamepad2, Ticket, Palette,
  RefreshCw, Cloud, BadgeCheck, ShoppingBag, Shirt, Laptop,
  Watch, Lamp, GraduationCap, School, BookOpen, MonitorPlay,
  Printer, HeartPulse, Stethoscope, Pill, Dumbbell,
  FlaskConical, Smile, Home, Key, Building2, Wrench,
  Armchair, Sparkles, Scissors, Gift, HandHeart, HeartHandshake,
  PiggyBank, Landmark, TrendingUp, CreditCard, Banknote,
  Handshake, Wallet, Briefcase, Award, Plane, Bed,
  FileText, PawPrint, Bone, Users, Send, Baby,
  Activity, Shield, ShieldPlus, ShieldCheck, ArrowLeftRight,
  Receipt, MoreHorizontal, Ellipsis, HelpCircle,
} from "lucide-react";

const ICON_MAP = {
  utensils: Utensils, "shopping-cart": ShoppingCart, "utensils-crossed": UtensilsCrossed,
  sandwich: Sandwich, coffee: Coffee, bike: Bike,
  car: Car, "car-front": CarFront, bus: Bus, "train-front": TrainFront, fuel: Fuel,
  "square-parking": SquareParking,
  zap: Zap, flame: Flame, droplet: Droplet, wifi: Wifi, phone: Phone,
  smartphone: Smartphone, signal: Signal,
  film: Film, clapperboard: Clapperboard, tv: Tv, "gamepad-2": Gamepad2, ticket: Ticket,
  palette: Palette,
  "refresh-cw": RefreshCw, cloud: Cloud, "badge-check": BadgeCheck,
  "shopping-bag": ShoppingBag, shirt: Shirt, laptop: Laptop,
  watch: Watch, lamp: Lamp, "graduation-cap": GraduationCap, school: School,
  "book-open": BookOpen, "monitor-play": MonitorPlay,
  pencil: Pencil, printer: Printer, "heart-pulse": HeartPulse,
  stethoscope: Stethoscope, pill: Pill, dumbbell: Dumbbell,
  "flask-conical": FlaskConical, smile: Smile, home: Home, key: Key,
  "building-2": Building2, wrench: Wrench,
  armchair: Armchair, sparkles: Sparkles, scissors: Scissors, gift: Gift,
  "hand-heart": HandHeart, "heart-handshake": HeartHandshake,
  "piggy-bank": PiggyBank, landmark: Landmark, "trending-up": TrendingUp,
  "credit-card": CreditCard, banknote: Banknote,
  handshake: Handshake, wallet: Wallet, briefcase: Briefcase, award: Award,
  plane: Plane, bed: Bed,
  "file-text": FileText, "paw-print": PawPrint, bone: Bone, users: Users,
  send: Send, baby: Baby,
  activity: Activity, shield: Shield, "shield-plus": ShieldPlus,
  "shield-check": ShieldCheck, "arrow-left-right": ArrowLeftRight,
  receipt: Receipt, "more-horizontal": MoreHorizontal, ellipsis: Ellipsis,
  "help-circle": HelpCircle,
};

import AdminPageHeader from "./AdminPageHeader";
import Button from "../Button";
import { ENDPOINTS, USE_MOCK_DATA, apiRequest } from "./adminApi";
import { MOCK_CATEGORIES } from "./mockCategoryData";

/* -------------------------------------------------------------------------
 * SMFinTrack — Category Management (Task 3 taxonomy: Ali Hamza)
 * -----------------------------------------------------------------------
 * Data contract: GET /api/admin/categories → { categories: [...], total }
 *   category: { id, name, icon, color, parentId, sortOrder }
 *   - icon is a Lucide icon name (kebab-case)
 *   - parentId is null for top-level categories
 *   - sortOrder is 1-based, scoped to sibling group
 * Actions:
 *   POST   /api/admin/categories          body { name, icon, color, parentId }
 *   PATCH  /api/admin/categories/{id}     body partial category
 *   DELETE /api/admin/categories/{id}     (cascades to subcategories)
 *   PATCH  /api/admin/categories/reorder  body { updates: [{ id, sortOrder }] }
 * ---------------------------------------------------------------------- */

/* Curated pickers — every value already used across the taxonomy, so any
   existing category always resolves to something selected in the form. */
const ICON_CHOICES = [
  "utensils", "shopping-cart", "utensils-crossed", "sandwich", "coffee", "bike",
  "car", "car-front", "bus", "train-front", "fuel", "square-parking",
  "zap", "flame", "droplet", "wifi", "phone", "smartphone", "signal",
  "film", "clapperboard", "tv", "gamepad-2", "ticket", "palette",
  "refresh-cw", "cloud", "badge-check", "shopping-bag", "shirt", "laptop",
  "watch", "lamp", "graduation-cap", "school", "book-open", "monitor-play",
  "pencil", "printer", "heart-pulse", "stethoscope", "pill", "dumbbell",
  "flask-conical", "smile", "home", "key", "building-2", "wrench",
  "armchair", "sparkles", "scissors", "gift", "hand-heart", "heart-handshake",
  "piggy-bank", "landmark", "trending-up", "credit-card", "banknote",
  "handshake", "wallet", "briefcase", "award", "plane", "bed",
  "file-text", "paw-print", "bone", "users", "send", "baby",
  "activity", "shield", "shield-plus", "shield-check", "arrow-left-right",
  "receipt", "more-horizontal", "ellipsis", "help-circle",
];

const COLOR_CHOICES = [
  "#E07A5F", "#3D5A80", "#F4A261", "#2FA8A0", "#9B5DE5", "#F15BB5",
  "#FF6B6B", "#1B3A5C", "#EF4444", "#4A5568", "#F59E0B", "#22C55E",
  "#3B82F6", "#A16207", "#6366F1", "#14B8A6", "#64748B", "#94A3B8", "#9CA3AF",
];

function CategoryIcon({ name, size = 15, ...rest }) {
  const Cmp = ICON_MAP[name || ""] || Tag;
  return <Cmp size={size} {...rest} />;
}

function isValidHex(v) {
  return /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(v);
}

function highlight(text, query) {
  if (!query || !text) return text;
  const i = text.toLowerCase().indexOf(query.toLowerCase());
  if (i === -1) return text;
  return (
    <>
      {text.slice(0, i)}
      <mark className="cmx-highlight">{text.slice(i, i + query.length)}</mark>
      {text.slice(i + query.length)}
    </>
  );
}

function CategorySkeleton() {
  return (
    <div className="admin-skeleton admin-skeleton-table">
      <div className="shimmer-line w-30 h-12" />
      {Array.from({ length: 7 }).map((_, i) => (
        <div key={i} className="shimmer-line w-100 h-16" />
      ))}
    </div>
  );
}

/* ============================== MAIN PAGE ============================== */

function CategoryManagementPage({ onOpenMenu = () => {} }) {
  const [categories, setCategories] = useState(null);
  const [status, setStatus] = useState("loading"); // loading | success | error
  const [errorMessage, setErrorMessage] = useState("");
  const [query, setQuery] = useState("");
  const [expanded, setExpanded] = useState(() => new Set());
  const [panel, setPanel] = useState(null); // { mode: "create"|"edit", parentId?, category? }
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [busyId, setBusyId] = useState(null);
  const [actionError, setActionError] = useState("");
  const [toast, setToast] = useState(null);

  const load = useCallback(async (signal) => {
    setStatus("loading");
    try {
      let data;
      if (USE_MOCK_DATA) {
        await new Promise((resolve) => setTimeout(resolve, 500));
        data = MOCK_CATEGORIES;
      } else {
        data = await apiRequest(ENDPOINTS.categories, { signal });
      }
      setCategories(data.categories);
      setStatus("success");
    } catch (err) {
      if (err.name === "AbortError") return;
      setErrorMessage(err.message || "Couldn't load categories.");
      setStatus("error");
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load(controller.signal);
    return () => controller.abort();
  }, [load]);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 3000);
    return () => clearTimeout(t);
  }, [toast]);

  /* ------------------------------ derived tree ------------------------------ */

  const tops = useMemo(() => {
    if (!categories) return [];
    return categories
      .filter((c) => !c.parentId)
      .sort((a, b) => a.sortOrder - b.sortOrder);
  }, [categories]);

  const childrenOf = useMemo(() => {
    const map = new Map();
    if (!categories) return map;
    categories
      .filter((c) => c.parentId)
      .forEach((c) => {
        if (!map.has(c.parentId)) map.set(c.parentId, []);
        map.get(c.parentId).push(c);
      });
    map.forEach((list) => list.sort((a, b) => a.sortOrder - b.sortOrder));
    return map;
  }, [categories]);

  const q = query.trim().toLowerCase();

  const visibleTops = useMemo(() => {
    if (!q) return tops;
    return tops.filter((top) => {
      if (top.name.toLowerCase().includes(q)) return true;
      const kids = childrenOf.get(top.id) || [];
      return kids.some((k) => k.name.toLowerCase().includes(q));
    });
  }, [tops, childrenOf, q]);

  const matchedChildren = useCallback(
    (topId) => {
      const kids = childrenOf.get(topId) || [];
      if (!q) return kids;
      const topMatches = tops.find((t) => t.id === topId)?.name.toLowerCase().includes(q);
      if (topMatches) return kids;
      return kids.filter((k) => k.name.toLowerCase().includes(q));
    },
    [childrenOf, tops, q]
  );

  const isExpanded = (id) => q.length > 0 || expanded.has(id);

  const toggleExpand = (id) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const totalCount = categories ? categories.length : 0;
  const totalTop = tops.length;

  /* -------------------------------- reorder -------------------------------- */

  const move = (category, direction) => {
    setCategories((prev) => {
      const siblings = prev
        .filter((c) => c.parentId === category.parentId)
        .sort((a, b) => a.sortOrder - b.sortOrder);
      const idx = siblings.findIndex((c) => c.id === category.id);
      const swapIdx = idx + direction;
      if (swapIdx < 0 || swapIdx >= siblings.length) return prev;
      const a = siblings[idx];
      const b = siblings[swapIdx];
      return prev.map((c) => {
        if (c.id === a.id) return { ...c, sortOrder: b.sortOrder };
        if (c.id === b.id) return { ...c, sortOrder: a.sortOrder };
        return c;
      });
    });
  };

  /* ---------------------------------- CRUD ---------------------------------- */

  const openCreateRoot = () => {
    setActionError("");
    setPanel({ mode: "create", parentId: null });
  };

  const openCreateSub = (parentId) => {
    setActionError("");
    setPanel({ mode: "create", parentId });
  };

  const openEdit = (category) => {
    setActionError("");
    setPanel({ mode: "edit", category });
  };

  const closePanel = () => setPanel(null);

  const persist = async (isEdit, targetId, formValues) => {
    setActionError("");
    const nextSortOrder = () => {
      const siblings = categories.filter((c) => c.parentId === formValues.parentId);
      return siblings.length ? Math.max(...siblings.map((c) => c.sortOrder)) + 1 : 1;
    };

    try {
      if (isEdit) {
        const payload = { ...formValues };
        if (USE_MOCK_DATA) {
          await new Promise((resolve) => setTimeout(resolve, 350));
        } else {
          await apiRequest(ENDPOINTS.categoryById(targetId), {
            method: "PATCH",
            body: payload,
          });
        }
        setCategories((prev) =>
          prev.map((c) => (c.id === targetId ? { ...c, ...payload } : c))
        );
        setToast(`"${formValues.name}" updated.`);
      } else {
        const newCategory = {
          id: `cat_${Date.now().toString(36)}`,
          ...formValues,
          sortOrder: nextSortOrder(),
        };
        if (USE_MOCK_DATA) {
          await new Promise((resolve) => setTimeout(resolve, 350));
        } else {
          const created = await apiRequest(ENDPOINTS.categories, {
            method: "POST",
            body: formValues,
          });
          newCategory.id = created.id || newCategory.id;
        }
        setCategories((prev) => [...prev, newCategory]);
        if (formValues.parentId) {
          setExpanded((prev) => new Set(prev).add(formValues.parentId));
        }
        setToast(`"${formValues.name}" added.`);
      }
      setPanel(null);
    } catch (err) {
      setActionError(err.message || "Couldn't save this category. Try again.");
    }
  };

  const handleSave = (formValues) =>
    persist(panel.mode === "edit", panel.category?.id, formValues);

  const askDelete = (category) => {
    const kids = childrenOf.get(category.id) || [];
    setDeleteTarget({ category, childCount: kids.length });
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    const { category, childCount } = deleteTarget;
    setBusyId(category.id);
    setActionError("");
    try {
      if (USE_MOCK_DATA) {
        await new Promise((resolve) => setTimeout(resolve, 400));
      } else {
        await apiRequest(ENDPOINTS.categoryById(category.id), { method: "DELETE" });
      }
      setCategories((prev) =>
        prev.filter((c) => c.id !== category.id && c.parentId !== category.id)
      );
      setToast(
        childCount > 0
          ? `"${category.name}" and ${childCount} subcategor${childCount === 1 ? "y" : "ies"} removed.`
          : `"${category.name}" removed.`
      );
      if (panel?.category?.id === category.id) setPanel(null);
    } catch (err) {
      setActionError(err.message || "Failed to delete category.");
    } finally {
      setBusyId(null);
      setDeleteTarget(null);
    }
  };

  /* ---------------------------------- render ---------------------------------- */

  return (
    <>
      <AdminPageHeader
        eyebrow="Admin"
        title="Category Management"
        onOpenMenu={onOpenMenu}
      />

      {status === "error" && (
        <div className="admin-error-box">
          <div className="admin-error-icon">
            <AlertTriangle size={20} strokeWidth={1.8} />
          </div>
          <h3>Couldn't load categories</h3>
          <p>{errorMessage}</p>
          <Button variant="danger" size="medium" onClick={() => load()}>
            Retry connection
          </Button>
        </div>
      )}

      {status !== "error" && (
        <div className={`cmx-shell ${panel ? "with-panel" : ""}`}>
          <div className="cmx-table-col">
            <div className="admin-panel cmx-toolbar-panel">
              <div className="admin-panel-header">
                <div>
                  <h2>Spending Categories</h2>
                  <p>
                    {status === "loading"
                      ? "Loading the taxonomy…"
                      : `${totalTop} top-level, ${totalCount - totalTop} subcategories, ${totalCount} total.`}
                  </p>
                </div>
                <div className="admin-toolbar">
                  <div className="cmx-search">
                    <Search size={15} className="cmx-search-icon" />
                    <input
                      className="cmx-search-input"
                      placeholder="Search categories…"
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                    />
                    {query && (
                      <button
                        className="cmx-search-clear"
                        onClick={() => setQuery("")}
                        aria-label="Clear search"
                      >
                        <X size={13} />
                      </button>
                    )}
                  </div>
                  <button
                    type="button"
                    className="cmx-expand-toggle"
                    onClick={() =>
                      setExpanded((prev) =>
                        prev.size === tops.length ? new Set() : new Set(tops.map((t) => t.id))
                      )
                    }
                  >
                    <ChevronsUpDown size={14} />
                    {expanded.size === tops.length && tops.length > 0 ? "Collapse all" : "Expand all"}
                  </button>
                  <Button
                    variant="primary"
                    size="medium"
                    iconLeft={<Plus size={15} />}
                    onClick={openCreateRoot}
                  >
                    Add Category
                  </Button>
                </div>
              </div>

              {actionError && <p className="admin-action-error">{actionError}</p>}
            </div>

            <div className="admin-panel cmx-table-panel">
              {status === "loading" ? (
                <CategorySkeleton />
              ) : (
                <div className="admin-table-scroll">
                  <table className="admin-table cmx-table">
                    <thead>
                      <tr>
                        <th className="cmx-col-name">Category</th>
                        <th>Color</th>
                        <th>Sort</th>
                        <th className="admin-table-action-col">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {visibleTops.length === 0 && (
                        <tr>
                          <td colSpan={4} className="admin-table-empty">
                            <div className="cmx-empty">
                              <div className="cmx-empty-art">
                                <FolderTree size={22} />
                              </div>
                              <p className="cmx-empty-title">No categories match "{query}"</p>
                              <Button variant="secondary" size="small" onClick={() => setQuery("")}>
                                Clear search
                              </Button>
                            </div>
                          </td>
                        </tr>
                      )}

                      {visibleTops.map((top, topIdx) => {
                        const kids = matchedChildren(top.id);
                        const open = isExpanded(top.id);
                        return (
                          <TopRowGroup
                            key={top.id}
                            top={top}
                            kids={kids}
                            open={open}
                            isFirst={topIdx === 0}
                            isLast={topIdx === visibleTops.length - 1}
                            query={q}
                            busyId={busyId}
                            onToggle={() => toggleExpand(top.id)}
                            onEdit={openEdit}
                            onAddSub={openCreateSub}
                            onDelete={askDelete}
                            onMoveTopUp={() => move(top, -1)}
                            onMoveTopDown={() => move(top, 1)}
                            onMoveChildUp={(child) => move(child, -1)}
                            onMoveChildDown={(child) => move(child, 1)}
                          />
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>

          {panel && (
            <CategoryFormPanel
              mode={panel.mode}
              category={panel.category}
              parentId={panel.mode === "edit" ? panel.category.parentId : panel.parentId}
              topLevelOptions={tops.filter((t) => !panel.category || t.id !== panel.category.id)}
              onCancel={closePanel}
              onSave={handleSave}
              onDelete={panel.mode === "edit" ? () => askDelete(panel.category) : null}
            />
          )}
        </div>
      )}

      {deleteTarget && (
        <DeleteConfirmModal
          category={deleteTarget.category}
          childCount={deleteTarget.childCount}
          busy={busyId === deleteTarget.category.id}
          onCancel={() => setDeleteTarget(null)}
          onConfirm={confirmDelete}
        />
      )}

      {toast && <div className="cmx-toast">{toast}</div>}
    </>
  );
}

/* ============================ TABLE ROW GROUP ============================ */

function TopRowGroup({
  top,
  kids,
  open,
  isFirst,
  isLast,
  query,
  busyId,
  onToggle,
  onEdit,
  onAddSub,
  onDelete,
  onMoveTopUp,
  onMoveTopDown,
  onMoveChildUp,
  onMoveChildDown,
}) {
  return (
    <>
      <tr className="cmx-row cmx-row-top">
        <td className="cmx-col-name">
          <div className="cmx-name-cell">
            <button
              type="button"
              className={`cmx-expander ${kids.length === 0 ? "cmx-expander-empty" : ""}`}
              onClick={kids.length ? onToggle : undefined}
              aria-label={open ? "Collapse" : "Expand"}
              disabled={kids.length === 0}
            >
              {kids.length > 0 ? (
                open ? <ChevronDown size={15} /> : <ChevronRight size={15} />
              ) : (
                <span className="cmx-expander-dot" />
              )}
            </button>
            <span className="cmx-icon-badge" style={{ background: top.color }}>
              <CategoryIcon name={top.icon} size={15} color="#fff" />
            </span>
            <span className="cmx-name-text">{highlight(top.name, query)}</span>
            {kids.length > 0 && <span className="cmx-child-count">{kids.length}</span>}
          </div>
        </td>
        <td>
          <span className="cmx-color-chip" style={{ background: top.color }} title={top.color} />
          <span className="cmx-color-hex">{top.color}</span>
        </td>
        <td className="admin-table-muted">
          <div className="cmx-sort-cell">
            <span>#{top.sortOrder}</span>
            <div className="cmx-sort-arrows">
              <button
                type="button"
                aria-label="Move up"
                disabled={isFirst}
                onClick={onMoveTopUp}
              >
                <ArrowUp size={12} />
              </button>
              <button
                type="button"
                aria-label="Move down"
                disabled={isLast}
                onClick={onMoveTopDown}
              >
                <ArrowDown size={12} />
              </button>
            </div>
          </div>
        </td>
        <td className="admin-table-action-col">
          <RowActionsMenu
            onAdd={() => onAddSub(top.id)}
            addLabel="Add subcategory"
            onEdit={() => onEdit(top)}
            editLabel="Edit category"
            onDelete={() => onDelete(top)}
            deleteLabel="Delete category"
            busy={busyId === top.id}
          />
        </td>
      </tr>

      {open &&
        kids.map((child, childIdx) => (
          <tr key={child.id} className="cmx-row cmx-row-child">
            <td className="cmx-col-name">
              <div className="cmx-name-cell cmx-name-cell-child">
                <GripVertical size={13} className="cmx-drag-hint" />
                <span className="cmx-icon-badge cmx-icon-badge-sm" style={{ background: child.color }}>
                  <CategoryIcon name={child.icon} size={13} color="#fff" />
                </span>
                <span className="cmx-name-text">{highlight(child.name, query)}</span>
              </div>
            </td>
            <td>
              <span className="cmx-color-chip" style={{ background: child.color }} title={child.color} />
              <span className="cmx-color-hex">{child.color}</span>
            </td>
            <td className="admin-table-muted">
              <div className="cmx-sort-cell">
                <span>#{child.sortOrder}</span>
                <div className="cmx-sort-arrows">
                  <button
                    type="button"
                    aria-label="Move up"
                    disabled={childIdx === 0}
                    onClick={() => onMoveChildUp(child)}
                  >
                    <ArrowUp size={12} />
                  </button>
                  <button
                    type="button"
                    aria-label="Move down"
                    disabled={childIdx === kids.length - 1}
                    onClick={() => onMoveChildDown(child)}
                  >
                    <ArrowDown size={12} />
                  </button>
                </div>
              </div>
            </td>
            <td className="admin-table-action-col">
              <RowActionsMenu
                onEdit={() => onEdit(child)}
                editLabel="Edit subcategory"
                onDelete={() => onDelete(child)}
                deleteLabel="Delete subcategory"
                busy={busyId === child.id}
              />
            </td>
          </tr>
        ))}
    </>
  );
}

/* ------------------------- Row action menu (3-dot) ------------------------- */

function RowActionsMenu({ onAdd, addLabel, onEdit, editLabel, onDelete, deleteLabel, busy }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    function onClick(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  return (
    <div className="cmx-menu" ref={ref}>
      <button
        type="button"
        className="cmx-menu-btn"
        onClick={() => setOpen((o) => !o)}
        aria-label="Row actions"
        disabled={busy}
      >
        <MoreVertical size={16} />
      </button>
      {open && (
        <div className="cmx-menu-panel">
          {onAdd && (
            <button
              type="button"
              className="cmx-menu-item"
              onClick={() => {
                setOpen(false);
                onAdd();
              }}
            >
              <Plus size={14} /> {addLabel}
            </button>
          )}
          <button
            type="button"
            className="cmx-menu-item"
            onClick={() => {
              setOpen(false);
              onEdit();
            }}
          >
            <Pencil size={14} /> {editLabel}
          </button>
          <button
            type="button"
            className="cmx-menu-item cmx-menu-item-danger"
            onClick={() => {
              setOpen(false);
              onDelete();
            }}
          >
            <Trash2 size={14} /> {deleteLabel}
          </button>
        </div>
      )}
    </div>
  );
}

/* ============================ ADD / EDIT PANEL ============================ */

function CategoryFormPanel({ mode, category, parentId, topLevelOptions, onCancel, onSave, onDelete }) {
  const [name, setName] = useState(category?.name || "");
  const [icon, setIcon] = useState(category?.icon || ICON_CHOICES[0]);
  const [color, setColor] = useState(category?.color || COLOR_CHOICES[0]);
  const [customHex, setCustomHex] = useState(category?.color || "");
  const [selectedParent, setSelectedParent] = useState(parentId || "");
  const [iconQuery, setIconQuery] = useState("");
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});
  const nameRef = useRef(null);

  useEffect(() => {
    nameRef.current?.focus();
  }, []);

  const filteredIcons = useMemo(() => {
    const q = iconQuery.trim().toLowerCase();
    if (!q) return ICON_CHOICES;
    return ICON_CHOICES.filter((i) => i.includes(q));
  }, [iconQuery]);

  const validate = () => {
    const next = {};
    if (!name.trim()) next.name = "Name is required.";
    if (!isValidHex(color)) next.color = "Pick a color or enter a valid hex code.";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setSaving(true);
    await onSave({
      name: name.trim(),
      icon,
      color,
      parentId: selectedParent || null,
    });
    setSaving(false);
  };

  const applyCustomHex = (v) => {
    setCustomHex(v);
    if (isValidHex(v)) setColor(v);
  };

  const parentName =
    mode === "create" && parentId
      ? topLevelOptions.find((t) => t.id === parentId)?.name
      : null;

  return (
    <aside className="cmx-panel">
      <div className="cmx-panel-head">
        <div>
          <p className="cmx-panel-eyebrow">
            {mode === "edit" ? "Edit category" : parentId ? "New subcategory" : "New top-level category"}
          </p>
          <h3>{mode === "edit" ? category.name : parentName ? `Under ${parentName}` : "Add category"}</h3>
        </div>
        <button className="cmx-panel-close" onClick={onCancel} aria-label="Close panel">
          <X size={17} />
        </button>
      </div>

      <div className="cmx-panel-body">
        <div className="cmx-field">
          <label htmlFor="cmx-name">Name</label>
          <input
            id="cmx-name"
            ref={nameRef}
            className={`cmx-text-input ${errors.name ? "cmx-input-error" : ""}`}
            placeholder="e.g. Coffee Shops"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
          />
          {errors.name && <p className="cmx-field-error">{errors.name}</p>}
        </div>

        <div className="cmx-field">
          <label htmlFor="cmx-parent">Parent category</label>
          <select
            id="cmx-parent"
            className="cmx-select"
            value={selectedParent || ""}
            onChange={(e) => setSelectedParent(e.target.value || null)}
          >
            <option value="">— Top-level category —</option>
            {topLevelOptions.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </select>
        </div>

        <div className="cmx-field">
          <label>Color</label>
          <div className="cmx-swatch-grid">
            {COLOR_CHOICES.map((c) => (
              <button
                key={c}
                type="button"
                className={`cmx-swatch ${color.toLowerCase() === c.toLowerCase() ? "active" : ""}`}
                style={{ background: c }}
                onClick={() => {
                  setColor(c);
                  setCustomHex(c);
                }}
                aria-label={c}
              />
            ))}
          </div>
          <div className="cmx-hex-row">
            <span className="cmx-hex-preview" style={{ background: isValidHex(color) ? color : "#eee" }} />
            <input
              className={`cmx-text-input cmx-hex-input ${errors.color ? "cmx-input-error" : ""}`}
              placeholder="#2FA8A0"
              value={customHex}
              onChange={(e) => applyCustomHex(e.target.value)}
              maxLength={7}
            />
          </div>
          {errors.color && <p className="cmx-field-error">{errors.color}</p>}
        </div>

        <div className="cmx-field">
          <label>Icon</label>
          <div className="cmx-icon-search">
            <Search size={13} />
            <input
              placeholder="Search icons…"
              value={iconQuery}
              onChange={(e) => setIconQuery(e.target.value)}
            />
          </div>
          <div className="cmx-icon-grid">
            {filteredIcons.map((i) => (
              <button
                key={i}
                type="button"
                className={`cmx-icon-option ${icon === i ? "active" : ""}`}
                onClick={() => setIcon(i)}
                title={i}
              >
                <CategoryIcon name={i} size={16} />
              </button>
            ))}
            {filteredIcons.length === 0 && <p className="cmx-icon-empty">No icons match.</p>}
          </div>
        </div>

        <div className="cmx-preview-row">
          <span className="cmx-preview-label">Preview</span>
          <div className="cmx-preview-pill">
            <span className="cmx-icon-badge" style={{ background: isValidHex(color) ? color : "#94a3b8" }}>
              <CategoryIcon name={icon} size={14} color="#fff" />
            </span>
            <span>{name.trim() || "Category name"}</span>
          </div>
        </div>

        <div className="cmx-panel-actions">
          {onDelete && (
            <button type="button" className="cmx-panel-delete" onClick={onDelete}>
              <Trash2 size={14} /> Delete
            </button>
          )}
          <div className="cmx-panel-actions-right">
            <Button variant="secondary" size="medium" onClick={onCancel}>
              Cancel
            </Button>
            <Button variant="primary" size="medium" loading={saving} onClick={handleSubmit}>
              {mode === "edit" ? "Save changes" : "Add category"}
            </Button>
          </div>
        </div>
      </div>
    </aside>
  );
}

/* ============================ DELETE CONFIRM MODAL ============================ */

function DeleteConfirmModal({ category, childCount, busy, onCancel, onConfirm }) {
  return (
    <div className="cmx-modal-backdrop" onClick={onCancel}>
      <div className="cmx-modal" onClick={(e) => e.stopPropagation()}>
        <div className="cmx-modal-head">
          <div className="cmx-modal-icon">
            <AlertTriangle size={17} />
          </div>
          <div>
            <h3>Delete "{category.name}"?</h3>
            {childCount > 0 ? (
              <p>
                This category has <strong>{childCount}</strong> subcategor{childCount === 1 ? "y" : "ies"}.
                Deleting it will remove {childCount === 1 ? "that subcategory" : "all of them"} too. This
                can't be undone.
              </p>
            ) : (
              <p>This can't be undone. Any transactions using this category will need to be recategorised.</p>
            )}
          </div>
        </div>
        <div className="cmx-modal-actions">
          <Button variant="secondary" size="medium" onClick={onCancel}>
            Cancel
          </Button>
          <Button
            variant="danger"
            size="medium"
            iconLeft={<Trash2 size={14} />}
            loading={busy}
            onClick={onConfirm}
          >
            Delete{childCount > 0 ? ` (${childCount + 1})` : ""}
          </Button>
        </div>
      </div>
    </div>
  );
}

export default CategoryManagementPage;
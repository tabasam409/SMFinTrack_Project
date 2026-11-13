import { Navigate } from "react-router-dom";

/* -------------------------------------------------------------------------
 * ProtectedRoute
 * -----------------------------------------------------------------------
 * Guards routes so they can't be opened just by typing the URL.
 *
 *  - requireAdmin=false (default, used for /dashboard): only checks that
 *    someone is logged in.
 *  - requireAdmin=true (used for /admin): also checks the role saved at
 *    login ("smfintrackRole"). A logged-in student hitting /admin is sent
 *    to their own /dashboard instead of the admin panel.
 *
 * No backend call — this is a frontend-only gate until Husnain's admin
 * API (with real tokens/roles) is live.
 *
 * TODO once the admin API exists: replace this localStorage check with a
 * real token check (verify "smfintrack_token" against the backend and
 * confirm the account's role server-side), so the role can't be spoofed
 * by editing localStorage.
 * ---------------------------------------------------------------------- */
function ProtectedRoute({ children, requireAdmin = false }) {
  const isLoggedIn = localStorage.getItem("smfintrackLoggedIn") === "true";

  if (!isLoggedIn) {
    return <Navigate to="/login" replace />;
  }

  if (requireAdmin) {
    const role = localStorage.getItem("smfintrackRole");
    if (role !== "admin") {
      return <Navigate to="/dashboard" replace />;
    }
  }

  return children;
}

export default ProtectedRoute;

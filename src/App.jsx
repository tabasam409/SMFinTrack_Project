import "./App.css";
import { Routes, Route, Navigate } from "react-router-dom";

import ProtectedRoute from "./components/ProtectedRoute";
import LandingPage from "./components/LandingPage/LandingPage";
import AdminDashboard from "./components/AdminDashboard/AdminDashboard";
import LoginPage from "./components/SignupForm/LoginPage/LoginPage";
import SignupForm from "./components/SignupForm/SignupForm";
import FinanceApp from "./components/FinanceApp/FinanceApp";

function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignupForm />} />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <FinanceApp />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin"
        element={
          <ProtectedRoute requireAdmin>
            <AdminDashboard />
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

export default App;
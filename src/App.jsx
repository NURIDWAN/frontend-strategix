import { useState, useEffect, lazy, Suspense } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import Dashboard from "./pages/Dashboard";
import Login from "./pages/Login";
import Register from "./pages/Register";
import RegisterConsultant from "./pages/RegisterConsultant";
import LandingPage from "./pages/LandingPage";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import OtpVerification from "./pages/OtpVerification";
import FAQ from "./pages/FAQ";
import Terms from "./pages/Terms";
import FeaturesPage from "./pages/FeaturesPage";
import PricingPage from "./pages/PricingPage";
import CheckoutPage from "./pages/CheckoutPage";
import PaymentSuccess from "./pages/PaymentSuccess";
import ArticlePublicList from "./pages/ArticlePublicList";
import ArticlePublicDetail from "./pages/ArticlePublicDetail";

import AffiliateLinkRedirect from "./components/Affiliate/AffiliateLinkRedirect";
import TestPaymentPage from "./pages/TestPaymentPage";

// Admin Layout
import AdminLayout from "./components/AdminLayout/AdminLayout";
import ConsultantLayout from "./components/ConsultantLayout/ConsultantLayout";

// Lazy-loaded Admin Pages
const AdminDashboard = lazy(() => import("./components/Admin/AdminDashboard"));
const AdminUserManagement = lazy(() => import("./components/Admin/AdminUserManagement"));
const AdminArticlesPage = lazy(() => import("./pages/admin/AdminArticlesPage"));
const AdminArticleFormPage = lazy(() => import("./pages/admin/AdminArticleFormPage"));
const AdminPayments = lazy(() => import("./pages/admin/AdminPayments"));
const AdminAffiliates = lazy(() => import("./pages/admin/AdminAffiliates"));
const AdminLogs = lazy(() => import("./pages/admin/AdminLogs"));
const AdminSettings = lazy(() => import("./pages/admin/AdminSettings"));
const AdminSeoPages = lazy(() => import("./pages/admin/AdminSeoPages"));
const AdminConsultations = lazy(() => import("./pages/admin/AdminConsultations"));

// Lazy-loaded Consultant Pages
const ConsultantDashboard = lazy(() => import("./pages/consultant/ConsultantDashboard"));
const ConsultantSchedule = lazy(() => import("./pages/consultant/ConsultantSchedule"));
const ConsultantSessions = lazy(() => import("./pages/consultant/ConsultantSessions"));
const ConsultantProfile = lazy(() => import("./pages/consultant/ConsultantProfile"));

// Import react-toastify
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// Loading Spinner Component
const LoadingSpinner = () => (
  <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
  </div>
);

// Protected Route Component (for regular authenticated users)
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

// Admin Route Component (for admin users only)
const AdminRoute = ({ children }) => {
  const { isAuthenticated, isAdmin, isLoading } = useAuth();

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (!isAdmin) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

// Consultant Route Component (for consultant users only)
const ConsultantRoute = ({ children }) => {
  const { isAuthenticated, isConsultant, isLoading } = useAuth();

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (!isConsultant) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

// Public Route Component (redirects authenticated users)
const PublicRoute = ({ children }) => {
  const { isAuthenticated, isAdmin, isConsultant, isLoading } = useAuth();

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (isAuthenticated) {
    // Admin users go to admin panel, consultants go to consultant dashboard, regular users go to dashboard
    if (isAdmin) return <Navigate to="/admin" replace />;
    if (isConsultant) return <Navigate to="/consultant/dashboard" replace />;
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

// Catch-all Redirect Component
const NavigateToCorrectRoot = () => {
  const { isAuthenticated, isAdmin, isConsultant } = useAuth();

  if (isAuthenticated) {
    if (isAdmin) return <Navigate to="/admin" replace />;
    if (isConsultant) return <Navigate to="/consultant/dashboard" replace />;
    return <Navigate to="/dashboard" replace />;
  }

  return <Navigate to="/" replace />;
};

// Verification Route Component (accessible regardless of auth state)
const VerificationRoute = ({ children }) => {
  const { isLoading } = useAuth();

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return children;
};

function AppContent() {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    return localStorage.getItem("theme") === "dark";
  });

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme === "dark") {
      document.documentElement.classList.add("dark");
    } else if (savedTheme === "light") {
      document.documentElement.classList.remove("dark");
    } else if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
      document.documentElement.classList.add("dark");
      setIsDarkMode(true);
    }
  }, []);

  const toggleDarkMode = () => {
    const newDarkMode = !isDarkMode;
    setIsDarkMode(newDarkMode);

    if (newDarkMode) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  };

  return (
    <div className={`min-h-screen ${isDarkMode ? "dark" : ""}`}>
      <Router basename={import.meta.env.BASE_URL}>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<LandingPage isDarkMode={isDarkMode} toggleDarkMode={toggleDarkMode} />} />
          <Route path="/features" element={<FeaturesPage isDarkMode={isDarkMode} toggleDarkMode={toggleDarkMode} />} />
          <Route path="/pricing" element={<PricingPage isDarkMode={isDarkMode} toggleDarkMode={toggleDarkMode} />} />
          <Route path="/checkout/:packageId" element={<CheckoutPage isDarkMode={isDarkMode} toggleDarkMode={toggleDarkMode} />} />
          <Route path="/faq" element={<FAQ isDarkMode={isDarkMode} toggleDarkMode={toggleDarkMode} />} />
          <Route path="/terms" element={<Terms isDarkMode={isDarkMode} toggleDarkMode={toggleDarkMode} />} />
          <Route path="/articles" element={<ArticlePublicList isDarkMode={isDarkMode} toggleDarkMode={toggleDarkMode} />} />
          <Route path="/articles/:slug" element={<ArticlePublicDetail isDarkMode={isDarkMode} toggleDarkMode={toggleDarkMode} />} />

          {/* Payment Success/Callback Route */}
          <Route path="/payment/success" element={<PaymentSuccess isDarkMode={isDarkMode} />} />

          {/* Test Payment Page (dev/debug only) */}
          <Route path="/test-payment" element={<TestPaymentPage />} />

          {/* Affiliate Link Redirect */}
          <Route path="/affiliate/:slug" element={<AffiliateLinkRedirect />} />

          {/* Auth Routes */}
          <Route
            path="/login"
            element={
              <PublicRoute>
                <Login isDarkMode={isDarkMode} toggleDarkMode={toggleDarkMode} />
              </PublicRoute>
            }
          />
          <Route
            path="/register"
            element={
              <PublicRoute>
                <Register isDarkMode={isDarkMode} toggleDarkMode={toggleDarkMode} />
              </PublicRoute>
            }
          />
          <Route
            path="/register-consultant"
            element={
              <PublicRoute>
                <RegisterConsultant isDarkMode={isDarkMode} toggleDarkMode={toggleDarkMode} />
              </PublicRoute>
            }
          />
          <Route
            path="/verify-otp"
            element={
              <VerificationRoute>
                <OtpVerification isDarkMode={isDarkMode} toggleDarkMode={toggleDarkMode} />
              </VerificationRoute>
            }
          />
          <Route
            path="/forgot-password"
            element={
              <PublicRoute>
                <ForgotPassword isDarkMode={isDarkMode} toggleDarkMode={toggleDarkMode} />
              </PublicRoute>
            }
          />
          <Route
            path="/reset-password"
            element={
              <PublicRoute>
                <ResetPassword isDarkMode={isDarkMode} toggleDarkMode={toggleDarkMode} />
              </PublicRoute>
            }
          />

          {/* Admin Routes */}
          <Route
            path="/admin"
            element={
              <AdminRoute>
                <AdminLayout isDarkMode={isDarkMode} toggleDarkMode={toggleDarkMode} />
              </AdminRoute>
            }
          >
            <Route index element={<AdminDashboard />} />
            <Route path="users" element={<AdminUserManagement />} />
            <Route path="articles" element={<AdminArticlesPage />} />
            <Route path="articles/create" element={<AdminArticleFormPage />} />
            <Route path="articles/:id/edit" element={<AdminArticleFormPage />} />
            <Route path="payments" element={<AdminPayments />} />
            <Route path="affiliates" element={<AdminAffiliates />} />
            <Route path="logs" element={<AdminLogs />} />
            <Route path="settings" element={<AdminSettings />} />
            <Route path="seo" element={<AdminSeoPages />} />
            <Route path="consultations" element={<AdminConsultations />} />
          </Route>

          {/* Consultant Routes */}
          <Route
            path="/consultant"
            element={
              <ConsultantRoute>
                <ConsultantLayout isDarkMode={isDarkMode} toggleDarkMode={toggleDarkMode} />
              </ConsultantRoute>
            }
          >
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<ConsultantDashboard />} />
            <Route path="schedule" element={<ConsultantSchedule />} />
            <Route path="sessions" element={<ConsultantSessions />} />
            <Route path="profile" element={<ConsultantProfile />} />
            <Route path="availability" element={<ConsultantProfile />} />
          </Route>

          {/* Member Dashboard Routes */}
          <Route
            path="/dashboard/*"
            element={
              <ProtectedRoute>
                <Dashboard isDarkMode={isDarkMode} toggleDarkMode={toggleDarkMode} />
              </ProtectedRoute>
            }
          />

          {/* Catch-all */}
          <Route path="*" element={<NavigateToCorrectRoot />} />
        </Routes>
      </Router>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} newestOnTop={false} closeOnClick pauseOnFocusLoss draggable pauseOnHover theme="colored" style={{ zIndex: 9999 }} />
    </AuthProvider>
  );
}

export default App;

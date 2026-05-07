import { useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000/api";

const AffiliateLinkRedirect = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const hasProcessed = useRef(false);

  useEffect(() => {
    // Prevent double execution in React StrictMode
    if (hasProcessed.current) return;
    hasProcessed.current = true;

    const handleAffiliateClick = async () => {
      console.log("[Affiliate] Starting redirect for slug:", slug);

      // 1. Save referral code to localStorage FIRST (before any async operations)
      localStorage.setItem("affiliate_ref", slug);
      localStorage.setItem("affiliate_ref_timestamp", Date.now().toString());

      console.log("[Affiliate] LocalStorage saved:", {
        affiliate_ref: localStorage.getItem("affiliate_ref"),
        affiliate_ref_timestamp: localStorage.getItem("affiliate_ref_timestamp"),
      });



      // 3. Small delay to ensure localStorage is saved before redirect
      setTimeout(() => {
        console.log("[Affiliate] Redirecting to landing page...");
        navigate("/", { replace: true });
      }, 100);
    };

    if (slug) {
      handleAffiliateClick();
    } else {
      navigate("/", { replace: true });
    }
  }, [slug, navigate]);

  // Show loading while redirecting
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="text-center">
        <div className="w-12 h-12 mx-auto mb-4 border-b-2 border-green-600 rounded-full animate-spin"></div>
        <p className="text-gray-600 dark:text-gray-400">Redirecting...</p>
      </div>
    </div>
  );
};

export default AffiliateLinkRedirect;

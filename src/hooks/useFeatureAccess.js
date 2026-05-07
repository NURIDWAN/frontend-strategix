import { useState, useEffect, useCallback } from "react";
import singapayApi from "../services/singapayApi";
import { authAPI } from "../services/authApi";

/**
 * Hook for checking Pro access and feature flags.
 *
 * Returns:
 * - hasProAccess: boolean — whether the current user has active Pro subscription
 * - featureFlags: object — { feature_forecast, feature_pdf_export, feature_articles, ... }
 * - isFeatureEnabled: (key) => boolean — check if a specific feature is enabled
 * - loading: boolean — initial loading state
 * - refreshAccess: () => void — manually refresh Pro access check
 * - refreshFlags: () => void — manually refresh feature flags
 */
const useFeatureAccess = () => {
  const [hasProAccess, setHasProAccess] = useState(false);
  const [featureFlags, setFeatureFlags] = useState({});
  const [loadingAccess, setLoadingAccess] = useState(true);
  const [loadingFlags, setLoadingFlags] = useState(true);

  const fetchProAccess = useCallback(async () => {
    try {
      setLoadingAccess(true);
      const response = await singapayApi.checkAccess();
      if (response.data.success && response.data.has_access) {
        setHasProAccess(true);
      } else {
        setHasProAccess(false);
      }
    } catch {
      setHasProAccess(false);
    } finally {
      setLoadingAccess(false);
    }
  }, []);

  const fetchFeatureFlags = useCallback(async () => {
    try {
      setLoadingFlags(true);
      const response = await authAPI.getFeatureFlags();
      if (response.data.success) {
        setFeatureFlags(response.data.data || {});
      }
    } catch {
      // If feature flags endpoint fails, assume all enabled (fail-open)
      setFeatureFlags({});
    } finally {
      setLoadingFlags(false);
    }
  }, []);

  useEffect(() => {
    fetchProAccess();
    fetchFeatureFlags();
  }, [fetchProAccess, fetchFeatureFlags]);

  const isFeatureEnabled = useCallback(
    (key) => {
      // If key not in featureFlags, assume enabled (fail-open)
      if (!(key in featureFlags)) return true;
      return !!featureFlags[key];
    },
    [featureFlags]
  );

  return {
    hasProAccess,
    featureFlags,
    isFeatureEnabled,
    loading: loadingAccess || loadingFlags,
    refreshAccess: fetchProAccess,
    refreshFlags: fetchFeatureFlags,
  };
};

export default useFeatureAccess;

import React, { createContext, useContext, useState, useCallback, useEffect, useMemo } from "react";
import { api, onTenantLocked } from "@/lib/api";
import { useAuth } from "@/auth/AuthContext";

export interface Entitlements {
  isLocked: boolean;
  lockReason: string | null;
  creditsBalance: number;
  subscriptionStatus: string | null;
  isWithinGracePeriod: boolean;
  planCode: string | null;
  periodEndUtc: string | null;
  overdueInvoiceId: number | null;
}

interface BillingContextValue {
  entitlements: Entitlements | null;
  isLocked: boolean;
  lockReason: string | null;
  creditsBalance: number;
  loading: boolean;
  refresh: () => Promise<void>;
  markLocked: (reason: string) => void;
}

const defaults: BillingContextValue = {
  entitlements: null,
  isLocked: false,
  lockReason: null,
  creditsBalance: 0,
  loading: true,
  refresh: async () => {},
  markLocked: () => {},
};

const BillingContext = createContext<BillingContextValue>(defaults);

export function BillingProvider({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();
  const [entitlements, setEntitlements] = useState<Entitlements | null>(null);
  const [loading, setLoading] = useState(true);
  const [lockedOverride, setLockedOverride] = useState<string | null>(null);

  const fetchEntitlements = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.get("/billing/entitlements");
      setEntitlements(res.data);
      if (res.data.isLocked) {
        setLockedOverride(res.data.lockReason);
      } else {
        setLockedOverride(null);
      }
    } catch {
      // entitlements unavailable – treat as not locked
    } finally {
      setLoading(false);
    }
  }, []);

  const markLocked = useCallback((reason: string) => {
    setLockedOverride(reason);
    setEntitlements((prev) =>
      prev ? { ...prev, isLocked: true, lockReason: reason } : prev,
    );
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      fetchEntitlements();
    } else {
      setEntitlements(null);
      setLockedOverride(null);
      setLoading(false);
    }
  }, [isAuthenticated, fetchEntitlements]);

  useEffect(() => {
    return onTenantLocked((reason) => {
      markLocked(reason);
    });
  }, [markLocked]);

  const value = useMemo<BillingContextValue>(() => ({
    entitlements,
    isLocked: entitlements?.isLocked ?? !!lockedOverride,
    lockReason: entitlements?.lockReason ?? lockedOverride,
    creditsBalance: entitlements?.creditsBalance ?? 0,
    loading,
    refresh: fetchEntitlements,
    markLocked,
  }), [entitlements, lockedOverride, loading, fetchEntitlements, markLocked]);

  return <BillingContext.Provider value={value}>{children}</BillingContext.Provider>;
}

export function useBilling(): BillingContextValue {
  return useContext(BillingContext);
}

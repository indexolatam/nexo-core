import { createContext, useContext, useState, useEffect, useMemo, ReactNode } from "react";
import { apiRequest } from "../services/apiClient";
import { CLIENT } from "../config/client";

export interface BankConfig {
  id: string;
  name: string;
  active: boolean;
  display_order: number;
  account_number?: string;
  account_holder?: string;
}

interface BankConfigContextValue {
  banks: BankConfig[];
  enabledBanks: BankConfig[];
  addBank: (name: string) => Promise<void>;
  removeBank: (id: string) => Promise<void>;
  toggleBank: (id: string) => Promise<void>;
}

const BankConfigContext = createContext<BankConfigContextValue | undefined>(undefined);

const defaultBanks: BankConfig[] = [
  { id: "bank-1", name: "Banco 1", active: true, display_order: 1 },
  { id: "bank-2", name: "Banco 2", active: true, display_order: 2 },
  { id: "bank-3", name: "Banco 3", active: false, display_order: 3 },
];

const STORAGE_KEY = `${CLIENT.id}-banks`;

export function BankConfigProvider({ children }: { children: ReactNode }) {
  const [banks, setBanks] = useState<BankConfig[]>(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : defaultBanks;
  });

  useEffect(() => {
    apiRequest<BankConfig[]>("/settings/banks")
      .then((data) => {
        setBanks(data);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      })
      .catch(() => {});
  }, []);

  const addBank = async (name: string) => {
    const optimistic: BankConfig = {
      id: `tmp-${Date.now()}`,
      name,
      active: true,
      display_order: banks.length + 1,
    };
    const withOptimistic = [...banks, optimistic];
    setBanks(withOptimistic);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(withOptimistic));

    try {
      const created = await apiRequest<BankConfig>("/settings/banks", {
        method: "POST",
        body: {
          name,
          active: true,
          display_order: banks.length + 1,
        },
      });
      const synced = withOptimistic.map((b) => (b.id === optimistic.id ? created : b));
      setBanks(synced);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(synced));
    } catch {
      const rollback = banks;
      setBanks(rollback);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(rollback));
    }
  };

  const removeBank = async (id: string) => {
    const previous = banks;
    const updated = banks.filter((b) => b.id !== id);
    setBanks(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));

    if (id.startsWith("tmp-")) return;

    try {
      await apiRequest<BankConfig>(`/settings/banks?id=${encodeURIComponent(id)}`, {
        method: "PATCH",
        body: { active: false },
      });
    } catch {
      setBanks(previous);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(previous));
    }
  };

  const toggleBank = async (id: string) => {
    const previous = banks;
    const updated = banks.map((b) =>
      b.id === id ? { ...b, active: !b.active } : b
    );
    setBanks(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));

    const changed = updated.find((b) => b.id === id);
    if (!changed || id.startsWith("tmp-")) return;

    try {
      await apiRequest<BankConfig>(`/settings/banks?id=${encodeURIComponent(id)}`, {
        method: "PATCH",
        body: { active: changed.active },
      });
    } catch {
      setBanks(previous);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(previous));
    }
  };

  const enabledBanks = useMemo(() => banks.filter((b) => b.active), [banks]);

  return (
    <BankConfigContext.Provider value={{ banks, enabledBanks, addBank, removeBank, toggleBank }}>
      {children}
    </BankConfigContext.Provider>
  );
}

export function useBankConfig(): BankConfigContextValue {
  const context = useContext(BankConfigContext);
  if (!context) throw new Error("useBankConfig must be used within a BankConfigProvider");
  return context;
}

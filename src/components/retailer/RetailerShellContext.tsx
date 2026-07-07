'use client';

import { createContext, useContext, useState, type ReactNode } from 'react';

interface RetailerShellContextValue {
  mobileOpen: boolean;
  setMobileOpen: (open: boolean) => void;
  toggleMobile: () => void;
}

const RetailerShellContext = createContext<RetailerShellContextValue | null>(null);

export function RetailerShellProvider({ children }: { children: ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <RetailerShellContext.Provider
      value={{
        mobileOpen,
        setMobileOpen,
        toggleMobile: () => setMobileOpen((prev) => !prev),
      }}
    >
      {children}
    </RetailerShellContext.Provider>
  );
}

export function useRetailerShell() {
  const context = useContext(RetailerShellContext);
  if (!context) {
    throw new Error('useRetailerShell must be used within RetailerShellProvider');
  }
  return context;
}

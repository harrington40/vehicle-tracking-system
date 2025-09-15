import React, { createContext, useContext, useState, useCallback } from 'react';

const LayoutContext = createContext();

export function LayoutProvider({ children }) {
  const [collapsed, setCollapsed] = useState(false);
  const toggle = useCallback(() => setCollapsed(c => !c), []);
  return (
    <LayoutContext.Provider value={{ collapsed, toggle }}>
      {children}
    </LayoutContext.Provider>
  );
}

export function useLayout() {
  return useContext(LayoutContext);
}
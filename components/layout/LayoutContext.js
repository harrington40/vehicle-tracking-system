import React from "react";

const LayoutCtx = React.createContext({ collapsed: false, toggle: () => {} });

export function LayoutProvider({ children }) {
  const [collapsed, setCollapsed] = React.useState(false);
  const toggle = React.useCallback(() => setCollapsed(v => !v), []);
  const value = React.useMemo(() => ({ collapsed, toggle }), [collapsed, toggle]);
  return <LayoutCtx.Provider value={value}>{children}</LayoutCtx.Provider>;
}

export const useLayout = () => React.useContext(LayoutCtx);

#!/usr/bin/env bash
set -euo pipefail

echo "▶ Ensuring we're in an Expo project root..."
test -f app.json || { echo "✖ app.json not found. Run this from your Expo project root."; exit 1; }

echo "▶ Installing required dependencies (safe to re-run)..."
npx expo install react-native-svg @expo/vector-icons react-native-safe-area-context react-native-screens >/dev/null

echo "▶ Creating folders..."
mkdir -p components/ui components/charts components/layout lib app

###############################################################################
# THEME (refined spacing/shadows/brand)
###############################################################################
echo "• Writing lib/theme.js"
cat > lib/theme.js <<'EOF'
export const COLORS = {
  bg: "#F3F5FA",
  card: "#FFFFFF",
  text: "#0F172A",
  subtext: "#6B7280",
  primary: "#4F46E5",
  success: "#10B981",
  warn: "#F59E0B",
  danger: "#EF4444",
  border: "#E9EAEE"
};
export const SPACING = { xs: 6, sm: 10, md: 14, lg: 18, xl: 24, xxl: 32 };
export const RADIUS = { md: 14, lg: 18 };
EOF

###############################################################################
# CORE UI
###############################################################################
echo "• Writing components/ui/Card.js"
cat > components/ui/Card.js <<'EOF'
import React from "react";
import { View, StyleSheet } from "react-native";
import { COLORS, SPACING, RADIUS } from "../../lib/theme";

export default function Card({ style, children }) {
  return <View style={[styles.card, style]}>{children}</View>;
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: "#0B1220",
    shadowOpacity: 0.06,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 6 },
    elevation: 2
  }
});
EOF

echo "• Writing components/ui/StatCard.js"
cat > components/ui/StatCard.js <<'EOF'
import React from "react";
import { View, Text, StyleSheet } from "react-native";
import Card from "./Card";
import { COLORS, SPACING } from "../../lib/theme";
import { Ionicons } from "@expo/vector-icons";

export default function StatCard({ icon="stats-chart", title, value, delta, deltaType="up" }) {
  const deltaColor = deltaType === "up" ? COLORS.success : COLORS.danger;
  const deltaIcon  = deltaType === "up" ? "trending-up" : "trending-down";

  return (
    <Card style={styles.card}>
      <View style={styles.row}>
        <Ionicons name={icon} size={18} color={COLORS.primary} />
        <Text style={styles.title}>{title}</Text>
      </View>
      <Text style={styles.value}>{value}</Text>
      {delta != null && (
        <View style={styles.deltaRow}>
          <Ionicons name={deltaIcon} size={14} color={deltaColor} />
          <Text style={[styles.delta, { color: deltaColor }]}>{delta}</Text>
          <Text style={styles.deltaNote}> from last month</Text>
        </View>
      )}
    </Card>
  );
}

const styles = StyleSheet.create({
  card: { flex: 1, minWidth: 260 },
  row: { flexDirection: "row", alignItems: "center", gap: SPACING.sm, marginBottom: SPACING.sm },
  title: { color: COLORS.subtext, fontSize: 14, fontWeight: "600" },
  value: { color: COLORS.text, fontSize: 28, fontWeight: "800", marginBottom: SPACING.sm },
  deltaRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  delta: { fontWeight: "700" },
  deltaNote: { color: COLORS.subtext }
});
EOF

echo "• Writing components/ui/Chip.js"
cat > components/ui/Chip.js <<'EOF'
import React from "react";
import { Text, View, StyleSheet } from "react-native";
import { COLORS } from "../../lib/theme";
export default function Chip({ text, tone="success" }) {
  const map = { success: COLORS.success, danger: COLORS.danger, warn: COLORS.warn, primary: COLORS.primary };
  return (
    <View style={[styles.tag, { borderColor: map[tone] }]}>
      <Text style={[styles.txt, { color: map[tone] }]}>{text}</Text>
    </View>
  );
}
const styles = StyleSheet.create({
  tag: { alignSelf: "flex-start", borderWidth: 1, backgroundColor: "#F8FAFF", paddingHorizontal: 8, paddingVertical: 2, borderRadius: 999 },
  txt: { fontSize: 12, fontWeight: "700" }
});
EOF

echo "• Writing components/ui/ProgressBar.js"
cat > components/ui/ProgressBar.js <<'EOF'
import React from "react";
import { View, StyleSheet } from "react-native";
import { COLORS } from "../../lib/theme";
export default function ProgressBar({ value=0 }) {
  return (
    <View style={styles.wrap}>
      <View style={[styles.fill, { width: `${Math.max(0, Math.min(100, value))}%` }]} />
    </View>
  );
}
const styles = StyleSheet.create({
  wrap: { height: 8, borderRadius: 99, backgroundColor: "#EEF1F6", overflow: "hidden" },
  fill: { height: "100%", backgroundColor: COLORS.primary, borderRadius: 99 }
});
EOF

echo "• Writing components/ui/RingProgress.js"
cat > components/ui/RingProgress.js <<'EOF'
import React from "react";
import Svg, { Circle } from "react-native-svg";
import { Text, View, StyleSheet } from "react-native";
import { COLORS } from "../../lib/theme";

export default function RingProgress({ value=65, size=140, stroke=10, color=COLORS.primary, label="Monthly" }) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const pct = Math.max(0, Math.min(100, typeof value === "number" ? value : 65));
  const dash = (pct / 100) * c;
  return (
    <View style={{ alignItems: "center" }}>
      <Svg width={size} height={size}>
        <Circle cx={size/2} cy={size/2} r={r} stroke="#EEF1F6" strokeWidth={stroke} fill="none" />
        <Circle cx={size/2} cy={size/2} r={r} stroke={color} strokeWidth={stroke} fill="none"
          strokeDasharray={`${dash}, ${c}`} strokeLinecap="round" rotation="-90" originX={size/2} originY={size/2} />
      </Svg>
      <View style={styles.center}>
        <Text style={styles.main}>{typeof value === "number" ? value.toLocaleString() : value}</Text>
        <Text style={styles.sub}>{label}</Text>
      </View>
    </View>
  );
}
const styles = StyleSheet.create({
  center: { position: "absolute", alignItems: "center", top: 0, bottom: 0, left: 0, right: 0, justifyContent: "center" },
  main: { fontSize: 18, fontWeight: "800", color: COLORS.text },
  sub: { color: "#6B7280" }
});
EOF

###############################################################################
# CHARTS
###############################################################################
echo "• Writing components/charts/Sparkline.js"
cat > components/charts/Sparkline.js <<'EOF'
import React from "react";
import { View } from "react-native";
import Svg, { Path } from "react-native-svg";

export default function Sparkline({ data = [4,6,5,8,7,9,6], width=220, height=60, stroke="#4F46E5" }) {
  if (!data.length) return <View style={{ width, height }} />;

  const max = Math.max(...data), min = Math.min(...data);
  const stepX = width / (data.length - 1 || 1);
  const norm = v => (max === min ? height/2 : height - ((v - min) / (max - min)) * height);

  let d = `M 0 ${norm(data[0])}`;
  data.forEach((v, i) => { if (i) d += ` L ${i * stepX} ${norm(v)}`; });

  return (
    <Svg width={width} height={height}>
      <Path d={d} fill="none" stroke={stroke} strokeWidth={3} />
    </Svg>
  );
}
EOF

echo "• Writing components/charts/BarMini.js"
cat > components/charts/BarMini.js <<'EOF'
import React from "react";
import Svg, { Rect } from "react-native-svg";

export default function BarMini({ data=[10,24,17,38,30,12,22], width=520, height=140, color="#111" }) {
  if (!data.length) return null;
  const max = Math.max(...data);
  const gap = 6;
  const bw = width / data.length - gap;

  return (
    <Svg width={width} height={height}>
      {data.map((v, i) => {
        const h = max ? (v / max) * (height - 16) : 0;
        const x = i * (bw + gap);
        const y = height - h;
        return <Rect key={i} x={x} y={y} width={bw} height={h} rx="4" />;
      })}
    </Svg>
  );
}
EOF

###############################################################################
# LAYOUT CONTEXT (for collapsing drawer)
###############################################################################
echo "• Writing components/layout/LayoutContext.js"
cat > components/layout/LayoutContext.js <<'EOF'
import React from "react";

const LayoutCtx = React.createContext({ collapsed: false, toggle: () => {} });

export function LayoutProvider({ children }) {
  const [collapsed, setCollapsed] = React.useState(false);
  const toggle = React.useCallback(() => setCollapsed(v => !v), []);
  const value = React.useMemo(() => ({ collapsed, toggle }), [collapsed, toggle]);
  return <LayoutCtx.Provider value={value}>{children}</LayoutCtx.Provider>;
}

export const useLayout = () => React.useContext(LayoutCtx);
EOF

###############################################################################
# SIDEBAR (collapsible)
###############################################################################
echo "• Writing components/layout/Sidebar.js"
cat > components/layout/Sidebar.js <<'EOF'
import React from "react";
import { View, Text, StyleSheet, Pressable, ScrollView } from "react-native";
import { Link, usePathname } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { COLORS, SPACING } from "../../lib/theme";
import { useLayout } from "./LayoutContext";

const NavItem = ({ href, label, icon, collapsed }) => {
  const pathname = usePathname();
  const active = pathname === href || (href === "/" && pathname === "/");
  return (
    <Link href={href} asChild>
      <Pressable style={[styles.item, active && styles.itemActive]}>
        <Ionicons name={icon} size={18} color={active ? COLORS.primary : COLORS.subtext} />
        {!collapsed && <Text style={[styles.itemText, active && { color: COLORS.primary, fontWeight: "700" }]}>{label}</Text>}
      </Pressable>
    </Link>
  );
};

export default function Sidebar() {
  const { collapsed } = useLayout();
  const width = collapsed ? 72 : 240;
  return (
    <View style={[styles.sidebar, { width }]}>
      <View style={styles.brand}>
        <Ionicons name="triangle" size={18} color="white" />
        {!collapsed && <Text style={styles.brandText}>Metoxi</Text>}
      </View>
      <ScrollView contentContainerStyle={{ paddingVertical: SPACING.md }}>
        <Text style={[styles.section, collapsed && { opacity: 0 }]}>Dashboard</Text>
        <NavItem href="/" label="eCommerce" icon="grid-outline" collapsed={collapsed} />
        <Text style={[styles.section, collapsed && { opacity: 0 }]}>UI Elements</Text>
        <NavItem href="/widgets" label="Widgets" icon="apps-outline" collapsed={collapsed} />
        <NavItem href="/ecommerce" label="eCommerce" icon="cart-outline" collapsed={collapsed} />
        <NavItem href="/forms" label="Forms" icon="create-outline" collapsed={collapsed} />
        <NavItem href="/settings" label="Settings" icon="settings-outline" collapsed={collapsed} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  sidebar: { backgroundColor: "white", borderRightWidth: 1, borderRightColor: "#E9EAEE" },
  brand: {
    height: 56, backgroundColor: COLORS.primary, paddingHorizontal: 14,
    flexDirection: "row", alignItems: "center", gap: 8
  },
  brandText: { color: "white", fontSize: 16, fontWeight: "800" },
  section: { color: COLORS.subtext, fontSize: 12, marginTop: 18, marginBottom: 8, paddingHorizontal: 14, textTransform: "uppercase" },
  item: {
    flexDirection: "row", alignItems: "center", gap: 10, paddingVertical: 10, paddingHorizontal: 14,
    borderRadius: 10, marginHorizontal: 8
  },
  itemActive: { backgroundColor: "#EEF2FF" },
  itemText: { color: COLORS.text }
});
EOF

###############################################################################
# TOPBAR with hamburger toggle + badges
###############################################################################
echo "• Writing components/layout/Topbar.js"
cat > components/layout/Topbar.js <<'EOF'
import React from "react";
import { View, TextInput, StyleSheet, Pressable, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { COLORS, SPACING } from "../../lib/theme";
import { useLayout } from "./LayoutContext";
import { Link } from "expo-router";

export default function Topbar() {
  const { toggle } = useLayout();
  return (
    <View style={styles.wrap}>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
        <Pressable onPress={toggle} style={styles.iconBtn}>
          <Ionicons name="menu" size={20} color={COLORS.text} />
        </Pressable>
        <View style={styles.search}>
          <Ionicons name="search" size={18} color={COLORS.subtext} />
          <TextInput placeholder="Search" placeholderTextColor={COLORS.subtext} style={styles.input} />
        </View>
      </View>
      <View style={styles.actions}>
        <IconBtn name="checkmark-done-outline" />
        <IconBtn name="grid-outline" />
        <IconBtn name="notifications-outline" badge="5" />
        <Link href="/settings" asChild><Pressable style={styles.iconBtn}><Ionicons name="settings-outline" size={20} color={COLORS.text} /></Pressable></Link>
        <IconBtn name="person-circle-outline" />
      </View>
    </View>
  );
}

function IconBtn({ name, badge }) {
  return (
    <Pressable style={styles.iconBtn}>
      <Ionicons name={name} size={20} color={COLORS.text} />
      {badge ? <View style={styles.badge}><Text style={styles.badgeTxt}>{badge}</Text></View> : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrap: {
    height: 56, backgroundColor: "white", flexDirection: "row", alignItems: "center",
    justifyContent: "space-between", paddingHorizontal: SPACING.lg, borderBottomWidth: 1, borderBottomColor: "#E9EAEE"
  },
  search: {
    flexDirection: "row", alignItems: "center", gap: 8,
    backgroundColor: "#F5F7FB", paddingHorizontal: 12, borderRadius: 12, height: 36, minWidth: 320
  },
  input: { flex: 1, paddingVertical: 0, color: COLORS.text },
  actions: { flexDirection: "row", alignItems: "center", gap: 10 },
  iconBtn: { width: 36, height: 36, borderRadius: 12, backgroundColor: "#F5F7FB", alignItems: "center", justifyContent: "center", position: "relative" },
  badge: { position: "absolute", top: -4, right: -4, backgroundColor: COLORS.primary, borderRadius: 10, minWidth: 18, height: 18, alignItems: "center", justifyContent: "center", paddingHorizontal: 4 },
  badgeTxt: { color: "white", fontSize: 11, fontWeight: "700" }
});
EOF

###############################################################################
# ROOT LAYOUT (wrap Stack in LayoutProvider + layout chrome)
###############################################################################
echo "• Writing app/_layout.js"
cat > app/_layout.js <<'EOF'
import React from "react";
import { Stack } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { View, StyleSheet } from "react-native";
import { COLORS } from "../lib/theme";
import Sidebar from "../components/layout/Sidebar";
import Topbar from "../components/layout/Topbar";
import { LayoutProvider } from "../components/layout/LayoutContext";

export default function RootLayout() {
  return (
    <LayoutProvider>
      <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.bg }}>
        <View style={styles.row}>
          <Sidebar />
          <View style={styles.content}>
            <Topbar />
            <View style={{ flex: 1 }}>
              <Stack screenOptions={{ headerShown: false }} />
            </View>
          </View>
        </View>
      </SafeAreaView>
    </LayoutProvider>
  );
}

const styles = StyleSheet.create({
  row: { flex: 1, flexDirection: "row", backgroundColor: COLORS.bg },
  content: { flex: 1 }
});
EOF

###############################################################################
# DASHBOARD (adds Settings button on big card, legends, progress)
###############################################################################
echo "• Writing app/index.js"
cat > app/index.js <<'EOF'
import React from "react";
import { View, Text, StyleSheet, ScrollView, useWindowDimensions, Pressable } from "react-native";
import { COLORS, SPACING } from "../lib/theme";
import Card from "../components/ui/Card";
import StatCard from "../components/ui/StatCard";
import Sparkline from "../components/charts/Sparkline";
import BarMini from "../components/charts/BarMini";
import Chip from "../components/ui/Chip";
import ProgressBar from "../components/ui/ProgressBar";
import RingProgress from "../components/ui/RingProgress";
import { Link } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

export default function Dashboard() {
  const { width } = useWindowDimensions();
  const wide = width >= 1200;

  return (
    <ScrollView style={{ flex: 1, backgroundColor: COLORS.bg }} contentContainerStyle={{ padding: SPACING.xl, gap: SPACING.lg }}>
      <Text style={styles.breadcrumb}>Dashboard  ·  <Text style={{ color: COLORS.subtext }}>eCommerce</Text></Text>

      {/* Top strip */}
      <View style={[styles.grid, { gap: SPACING.md }]}>
        <Card style={{ flexBasis: wide ? "48%" : "100%" }}>
          <View style={styles.rowBetween}>
            <Text style={styles.cardTitle}>Average Weekly Sales</Text>
            <View style={{ flexDirection: "row", gap: 8, alignItems: "center" }}>
              <Chip text="▼ 8.6%" tone="danger" />
              <Link href="/settings" asChild>
                <Pressable style={styles.settingsBtn}>
                  <Ionicons name="settings-outline" size={16} color="white" />
                  <Text style={{ color: "white", fontWeight: "700" }}>Settings</Text>
                </Pressable>
              </Link>
            </View>
          </View>
          <View style={{ marginVertical: SPACING.sm }}>
            <Sparkline data={[3,5,4,7,6,9,5,6]} width={wide ? 520 : 680} height={80} stroke={COLORS.success} />
          </View>
          <Text style={styles.kpiLarge}>$9,568</Text>
          <Text style={styles.sub}>from last month</Text>
        </Card>

        <Card style={{ flexBasis: wide ? "48%" : "100%", flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
          <KPI title="Orders" value="85,246" icon="cart-outline" />
          <Divider />
          <KPI title="Income" value="$96,147" icon="card-outline" />
          <Divider />
          <KPI title="Notifications" value="846" icon="notifications-outline" />
          <Divider />
          <KPI title="Payment" value="$84,472" icon="wallet-outline" />
        </Card>
      </View>

      {/* Middle */}
      <View style={[styles.grid, { gap: SPACING.md }]}>
        <Card style={{ flexBasis: wide ? "24%" : "48%" }}>
          <Text style={styles.cardTitle}>Total Users</Text>
          <Sparkline data={[10,18,14,22,26,20,28]} height={64} />
          <Text style={styles.kpi}>97.4K</Text>
          <Text style={[styles.sub, { color: COLORS.success }]}>12.5% from last month</Text>
        </Card>

        <Card style={{ flexBasis: wide ? "24%" : "48%" }}>
          <Text style={styles.cardTitle}>Active Users</Text>
          <Sparkline data={[8,9,11,13,16,18,17]} height={64} stroke={COLORS.success} />
          <Text style={styles.kpi}>42.5K</Text>
          <Text style={styles.sub}>24K users increased from last month</Text>
        </Card>

        <Card style={{ flexBasis: wide ? "50%" : "100%" }}>
          <Text style={styles.cardTitle}>Sales & Views</Text>
          <BarMini data={[12,22,60,45,10,20,28,18,32,26,14,24]} height={140} />
          <View style={{ flexDirection: "row", gap: 12, marginTop: 8 }}>
            <Legend swatch="#111">Sales</Legend>
            <Legend swatch="#666">Views</Legend>
          </View>
        </Card>
      </View>

      {/* Bottom */}
      <View style={[styles.grid, { gap: SPACING.md }]}>
        <Card style={{ flexBasis: wide ? "48%" : "100%" }}>
          <Text style={styles.kpi}>$65,129  <Text style={{ color: COLORS.success }}>↑ 8.6%</Text></Text>
          <Text style={styles.sub}>Sales This Year</Text>
          <View style={{ marginTop: SPACING.md }}>
            <ProgressBar value={78} />
          </View>
          <Text style={[styles.sub, { marginTop: 6 }]}>285 left to Goal</Text>
        </Card>

        <Card style={{ flexBasis: wide ? "48%" : "100%", flexDirection: "row", gap: 20, alignItems: "center" }}>
          <RingProgress value={65} label="Monthly" />
          <RingProgress value={84} label="Yearly" />
        </Card>
      </View>

      {/* footer quick nav */}
      <View style={{ marginTop: SPACING.lg, flexDirection: "row", gap: SPACING.md, flexWrap: "wrap" }}>
        <NavButton href="/ecommerce" label="Go to eCommerce" />
        <NavButton href="/widgets" label="Widgets" />
        <NavButton href="/forms" label="Forms" />
        <NavButton href="/settings" label="Settings" />
      </View>
    </ScrollView>
  );
}

function KPI({ title, value, icon }) {
  return (
    <View style={{ alignItems: "flex-start", gap: 6 }}>
      <View style={{ flexDirection: "row", gap: 6, alignItems: "center" }}>
        <Ionicons name={icon} size={18} color={COLORS.primary} />
        <Text style={styles.cardTitle}>{title}</Text>
      </View>
      <Text style={styles.kpi}>{value}</Text>
      <Text style={styles.sub}>from last month</Text>
    </View>
  );
}
const Divider = () => <View style={{ width: 1, backgroundColor: COLORS.border, height: 56 }} />;
function Legend({ children, swatch }) {
  return (
    <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
      <View style={{ width: 12, height: 12, borderRadius: 3, backgroundColor: swatch }} />
      <Text style={{ color: COLORS.subtext }}>{children}</Text>
    </View>
  );
}
function NavButton({ href, label }) {
  return (
    <Link href={href} asChild>
      <Pressable style={({ pressed }) => [styles.navBtn, pressed && { opacity: 0.85 }]}>
        <Text style={styles.navBtnText}>{label}</Text>
      </Pressable>
    </Link>
  );
}

const styles = StyleSheet.create({
  breadcrumb: { fontSize: 22, fontWeight: "800", color: COLORS.text },
  grid: { flexDirection: "row", flexWrap: "wrap" },
  rowBetween: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  cardTitle: { color: COLORS.subtext, fontWeight: "600" },
  kpiLarge: { fontSize: 28, fontWeight: "800", color: COLORS.text },
  kpi: { fontSize: 22, fontWeight: "800", color: COLORS.text, marginTop: 6 },
  sub: { color: COLORS.subtext },
  navBtn: {
    backgroundColor: COLORS.primary, paddingVertical: 10, paddingHorizontal: 16, borderRadius: 12,
    shadowColor: "#000", shadowOpacity: 0.08, shadowRadius: 10, shadowOffset: { width: 0, height: 6 }, elevation: 3
  },
  navBtnText: { color: "white", fontWeight: "700" },
  settingsBtn: { flexDirection: "row", gap: 6, alignItems: "center", backgroundColor: COLORS.primary, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 10 }
});
EOF

###############################################################################
# Ensure expo-router plugin + experiments in app.json (idempotent)
###############################################################################
if ! grep -q '"plugins"' app.json; then
  echo "• Adding \"plugins\": [\"expo-router\"] to app.json"
  node - <<'NODE'
const fs=require('fs');const j=JSON.parse(fs.readFileSync('app.json','utf8'));
j.expo=j.expo||{}; j.expo.plugins=j.expo.plugins||[]; if(!j.expo.plugins.includes('expo-router')) j.expo.plugins.push('expo-router');
fs.writeFileSync('app.json',JSON.stringify(j,null,2));
NODE
fi

if ! grep -q '"experiments"' app.json; then
  echo "• Adding \"experiments\": { \"typedRoutes\": false } to app.json"
  node - <<'NODE'
const fs=require('fs');const j=JSON.parse(fs.readFileSync('app.json','utf8'));
j.expo=j.expo||{}; j.expo.experiments=j.expo.experiments||{};
if(typeof j.expo.experiments.typedRoutes==='undefined') j.expo.experiments.typedRoutes=false;
fs.writeFileSync('app.json',JSON.stringify(j,null,2));
NODE
fi

echo "✔ All done. Start your app with: npm run start -- --clear"

#!/usr/bin/env bash
set -euo pipefail

# Ensure we're in an Expo project root
if [[ ! -f "app.json" ]]; then
  echo "✖ app.json not found. Run this from your Expo project root."
  exit 1
fi

mkdir -p app components/ui components/charts lib

echo "• Creating lib/theme.js"
cat > lib/theme.js <<'EOF'
export const COLORS = {
  bg: "#F4F6FA",
  card: "#FFFFFF",
  text: "#0F172A",
  subtext: "#64748B",
  primary: "#4F46E5",
  success: "#10B981",
  warn: "#F59E0B",
  danger: "#EF4444",
  border: "#E5E7EB"
};

export const SPACING = { xs: 6, sm: 10, md: 14, lg: 18, xl: 24, xxl: 32 };
export const RADIUS = { md: 14, lg: 20 };
EOF

echo "• Creating components/ui/Card.js"
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
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 4
  }
});
EOF

echo "• Creating components/ui/StatCard.js"
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
        <Ionicons name={icon} size={22} color={COLORS.primary} />
        <Text style={styles.title}>{title}</Text>
      </View>
      <Text style={styles.value}>{value}</Text>
      {delta != null && (
        <View style={styles.deltaRow}>
          <Ionicons name={deltaIcon} size={16} color={deltaColor} />
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
  title: { color: COLORS.subtext, fontSize: 14 },
  value: { color: COLORS.text, fontSize: 28, fontWeight: "800", marginBottom: SPACING.sm },
  deltaRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  delta: { fontWeight: "700" },
  deltaNote: { color: COLORS.subtext }
});
EOF

echo "• Creating components/charts/Sparkline.js"
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

echo "• Creating components/charts/BarMini.js"
cat > components/charts/BarMini.js <<'EOF'
import React from "react";
import Svg, { Rect } from "react-native-svg";

export default function BarMini({ data=[10,24,17,38,30,12,22], width=260, height=120, color="#6366F1" }) {
  if (!data.length) return null;
  const max = Math.max(...data);
  const bw = width / data.length - 6;

  return (
    <Svg width={width} height={height}>
      {data.map((v, i) => {
        const h = max ? (v / max) * (height - 10) : 0;
        const x = i * (bw + 6);
        const y = height - h;
        return <Rect key={i} x={x} y={y} width={bw} height={h} rx={4} />;
      })}
    </Svg>
  );
}
EOF

echo "• Creating app/_layout.js"
cat > app/_layout.js <<'EOF'
import React from "react";
import { Stack } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { View, StyleSheet } from "react-native";
import { COLORS } from "../lib/theme";

export default function RootLayout() {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.bg }}>
      <View style={styles.container}>
        <Stack screenOptions={{ headerShown: true, headerTitle: "Trans Tech VTracking" }} />
      </View>
      <StatusBar style="dark" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg }
});
EOF

echo "• Creating app/index.js (Dashboard)"
cat > app/index.js <<'EOF'
import React from "react";
import { View, Text, StyleSheet, ScrollView, useWindowDimensions, Pressable } from "react-native";
import { COLORS, SPACING } from "../lib/theme";
import StatCard from "../components/ui/StatCard";
import Card from "../components/ui/Card";
import Sparkline from "../components/charts/Sparkline";
import BarMini from "../components/charts/BarMini";
import { Link } from "expo-router";

const stats = [
  { title: "Average Weekly Sales", value: "$9,568", delta: "▼ 8.6%", deltaType: "down", icon: "cash" },
  { title: "Orders", value: "85,246", delta: "—", icon: "cart" },
  { title: "Income", value: "$96,147", delta: "—", icon: "card" },
  { title: "Payment", value: "$84,472", delta: "—", icon: "wallet" },
];

export default function Dashboard() {
  const { width } = useWindowDimensions();
  const isWide = width >= 1000;

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ padding: SPACING.xl }}>
      <Text style={styles.h1}>Dashboard · eCommerce</Text>

      <View style={[styles.row, { flexWrap: "wrap", gap: SPACING.md }]}>
        {stats.map((s, i) => (
          <View key={i} style={{ flexBasis: isWide ? "24%" : "48%", flexGrow: 1 }}>
            <StatCard {...s} />
          </View>
        ))}
      </View>

      <View style={[styles.row, { marginTop: SPACING.xl, gap: SPACING.md, flexWrap: "wrap" }]}>
        <Card style={{ flexBasis: isWide ? "24%" : "48%", flexGrow: 1 }}>
          <Text style={styles.cardTitle}>Total Users</Text>
          <Sparkline data={[12,18,14,20,26,22,28]} />
          <Text style={styles.kpi}>97.4K</Text>
          <Text style={styles.subGreen}>12.5% from last month</Text>
        </Card>

        <Card style={{ flexBasis: isWide ? "24%" : "48%", flexGrow: 1 }}>
          <Text style={styles.cardTitle}>Active Users</Text>
          <Sparkline data={[8,9,7,10,11,14,13]} stroke={COLORS.success} />
          <Text style={styles.kpi}>42.5K</Text>
          <Text style={styles.subText}>24K users increased from last month</Text>
        </Card>

        <Card style={{ flexBasis: isWide ? "49%" : "100%", flexGrow: 1 }}>
          <Text style={styles.cardTitle}>Sales & Views</Text>
          <BarMini data={[12,22,60,45,10,20,28,18,32]} />
        </Card>
      </View>

      <View style={{ marginTop: SPACING.xl, flexDirection: "row", gap: SPACING.md, flexWrap: "wrap" }}>
        <NavButton href="/ecommerce" label="Go to eCommerce" />
        <NavButton href="/widgets" label="Widgets" />
        <NavButton href="/forms" label="Forms" />
        <NavButton href="/settings" label="Settings" />
      </View>
    </ScrollView>
  );
}

function NavButton({ href, label }) {
  return (
    <Link href={href} asChild>
      <Pressable style={({ pressed }) => [styles.navBtn, pressed && { opacity: 0.8 }]}>
        <Text style={styles.navBtnText}>{label}</Text>
      </Pressable>
    </Link>
  );
}

const styles = StyleSheet.create({
  container: { backgroundColor: COLORS.bg },
  h1: { fontSize: 22, fontWeight: "800", color: COLORS.text, marginBottom: SPACING.lg },
  row: { flexDirection: "row" },
  cardTitle: { color: COLORS.subtext, marginBottom: SPACING.sm, fontWeight: "600" },
  kpi: { fontSize: 26, fontWeight: "800", color: COLORS.text, marginTop: SPACING.sm },
  subText: { color: COLORS.subtext, marginTop: 4 },
  subGreen: { color: COLORS.success, marginTop: 4 },
  navBtn: {
    backgroundColor: COLORS.primary,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    shadowColor: "#000", shadowOpacity: 0.08, shadowRadius: 10, shadowOffset: { width: 0, height: 6 },
    elevation: 3
  },
  navBtnText: { color: "white", fontWeight: "700" }
});
EOF

echo "• Creating app/ecommerce.js"
cat > app/ecommerce.js <<'EOF'
import React from "react";
import { ScrollView, Text, StyleSheet } from "react-native";
import { SPACING, COLORS } from "../lib/theme";
import Card from "../components/ui/Card";

export default function Ecommerce() {
  return (
    <ScrollView style={{ backgroundColor: COLORS.bg }} contentContainerStyle={{ padding: SPACING.xl, gap: SPACING.md }}>
      <Text style={styles.h1}>eCommerce</Text>
      <Card><Text>Orders list, KPIs, and recent transactions go here.</Text></Card>
    </ScrollView>
  );
}
const styles = StyleSheet.create({ h1: { fontSize: 22, fontWeight: "800", color: COLORS.text, marginBottom: SPACING.lg }});
EOF

echo "• Creating app/widgets.js"
cat > app/widgets.js <<'EOF'
import React from "react";
import { ScrollView, Text, StyleSheet } from "react-native";
import { SPACING, COLORS } from "../lib/theme";
import Card from "../components/ui/Card";

export default function Widgets() {
  return (
    <ScrollView style={{ backgroundColor: COLORS.bg }} contentContainerStyle={{ padding: SPACING.xl, gap: SPACING.md }}>
      <Text style={styles.h1}>Widgets</Text>
      <Card><Text>Reusable UI widgets library.</Text></Card>
    </ScrollView>
  );
}
const styles = StyleSheet.create({ h1: { fontSize: 22, fontWeight: "800", color: COLORS.text, marginBottom: SPACING.lg }});
EOF

echo "• Creating app/forms.js"
cat > app/forms.js <<'EOF'
import React from "react";
import { ScrollView, Text, StyleSheet } from "react-native";
import { SPACING, COLORS } from "../lib/theme";
import Card from "../components/ui/Card";

export default function Forms() {
  return (
    <ScrollView style={{ backgroundColor: COLORS.bg }} contentContainerStyle={{ padding: SPACING.xl, gap: SPACING.md }}>
      <Text style={styles.h1}>Forms</Text>
      <Card><Text>Build your registration / settings forms here.</Text></Card>
    </ScrollView>
  );
}
const styles = StyleSheet.create({ h1: { fontSize: 22, fontWeight: "800", color: COLORS.text, marginBottom: SPACING.lg }});
EOF

echo "• Creating app/settings.js"
cat > app/settings.js <<'EOF'
import React from "react";
import { ScrollView, Text, StyleSheet } from "react-native";
import { SPACING, COLORS } from "../lib/theme";
import Card from "../components/ui/Card";

export default function Settings() {
  return (
    <ScrollView style={{ backgroundColor: COLORS.bg }} contentContainerStyle={{ padding: SPACING.xl, gap: SPACING.md }}>
      <Text style={styles.h1}>Settings</Text>
      <Card><Text>App preferences, theme toggles, account, etc.</Text></Card>
    </ScrollView>
  );
}
const styles = StyleSheet.create({ h1: { fontSize: 22, fontWeight: "800", color: COLORS.text, marginBottom: SPACING.lg }});
EOF

echo "✔ Finished. Start the app with: npm run start"

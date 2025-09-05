import React, { useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Pressable,
  Platform,
  AccessibilityInfo,
} from "react-native";
import { COLORS } from '../../lib/theme';

/* ========== helpers ========== */
const getByPath = (obj, path) => {
  if (!obj || !path) return undefined;
  return path.split(".").reduce((acc, k) => (acc ? acc[k] : undefined), obj);
};

const asFlex = (width, fallback = 1) => {
  if (!width) return fallback;
  const m = width.match(/(\d+(?:\.\d+)?)%/);
  if (!m) return fallback;
  const pct = parseFloat(m[1]);
  if (pct <= 6) return 0.6;
  if (pct <= 12) return 0.8;
  if (pct <= 18) return 1.0;
  if (pct <= 25) return 1.25;
  return fallback;
};

const mergeStyles = (base, overrides) => {
  if (!overrides) return base;
  const out = { ...base };
  Object.keys(overrides).forEach((k) => {
    out[k] = [base[k], overrides[k]];
  });
  return out;
};

/* ========== child (nested) table ========== */
function NestedTable({ rows, columns, s, zebra = true }) {
  if (!rows || rows.length === 0) {
    return <Text style={s.emptyNested}>No activity events</Text>;
  }

  return (
    <View style={s.nestedContainer}>
      {/* header */}
      <View style={[s.row, s.nestedHeaderRow, Platform.OS === "web" && s.stickyHeader]}>
        {columns.map((c, i) => (
          <View key={String(c.key) + i} style={[s.cell, { flex: c.flex ?? asFlex(c.width, 1) }]}>
            <Text style={[s.text, s.nestedHeaderText]} numberOfLines={1}>
              {c.title}
            </Text>
          </View>
        ))}
      </View>

      {rows.map((r, ridx) => {
        const stripe = zebra && ridx % 2 ? s.nestedZebraAlt : null;
        return (
          <View key={String(r?.id ?? ridx)} style={[s.row, s.nestedRow, stripe]}>
            {columns.map((c, i) => {
              const content = c.render
                ? c.render(r, ridx)
                : typeof c.key === "string"
                ? getByPath(r, c.key)
                : r[c.key];
              return (
                <View key={String(c.key) + i} style={[s.cell, { flex: c.flex ?? asFlex(c.width, 1) }]}>
                  <Text style={s.nestedText} numberOfLines={2}>
                    {content == null ? "-" : String(content)}
                  </Text>
                </View>
              );
            })}
          </View>
        );
      })}
    </View>
  );
}

/* ========== tiny pagination ========== */
function Pagination({ page, setPage, pageCount, s }) {
  if (pageCount <= 1) return null;
  const pages = [];
  const max = Math.min(pageCount, 7); // Reduced for better mobile display
  let start = Math.max(1, page - 3);
  let end = Math.min(pageCount, start + max - 1);
  start = Math.max(1, end - max + 1);
  for (let i = start; i <= end; i++) pages.push(i);

  return (
    <View style={s.paginationBar}>
      <Pressable
        onPress={() => setPage(Math.max(1, page - 1))}
        style={({ pressed }) => [s.pageBtn, pressed && s.pageBtnPressed]}
        disabled={page === 1}
      >
        <Text style={[s.pageBtnText, page === 1 && s.pageBtnDisabled]}>‹</Text>
      </Pressable>
      {pages.map((p) => (
        <Pressable
          key={p}
          onPress={() => setPage(p)}
          style={({ pressed }) => [
            s.pageBtn,
            page === p && s.pageBtnActive,
            pressed && s.pageBtnPressed,
          ]}
        >
          <Text style={[s.pageBtnText, page === p && s.pageBtnTextActive]}>{p}</Text>
        </Pressable>
      ))}
      <Pressable
        onPress={() => setPage(Math.min(pageCount, page + 1))}
        style={({ pressed }) => [s.pageBtn, pressed && s.pageBtnPressed]}
        disabled={page === pageCount}
      >
        <Text style={[s.pageBtnText, page === pageCount && s.pageBtnDisabled]}>›</Text>
      </Pressable>
    </View>
  );
}

function RowsPerPage({ value, setValue, options = [3, 5, 10], s }) {
  const onPress = () => {
    const idx = options.indexOf(value);
    const next = options[(idx + 1) % options.length];
    setValue(next);
  };
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [s.rowsPerPage, pressed && { opacity: 0.9 }]}>
      <Text style={s.rowsPerPageText}>{value} rows</Text>
    </Pressable>
  );
}

/* ========== main component ========== */
export default function NestedTableRN({
  configuration,
  columns,
  data = [],
  nestedConfiguration,
  nestedColumns,
  nestedData,
  getNestedDataForRow,
  onRowClickEvent,
  controlledToggledRows,
  onToggleChange,
  styleOverrides,
  zebra = true,
  stickyHeader = true,
  pagination = true,
  initialRowsPerPage = 3,
  style,
}) {
  const [uncontrolledToggled, setUncontrolledToggled] = useState(new Set());
  const toggledRows = controlledToggledRows ?? uncontrolledToggled;

  const [rowsPerPage, setRowsPerPage] = useState(initialRowsPerPage);
  const [page, setPage] = useState(1);

  const effectiveConfig = {
    detailsTemplate: true,
    tableLayout: { hover: true },
    rows: undefined,
    testID: "vehicle-table",
    ...(configuration || {}),
  };

  const childConfig = {
    detailsTemplate: false,
    tableLayout: { hover: false },
    rows: undefined,
    testID: "vehicle-events-table",
    ...(nestedConfiguration || {}),
  };

  // Vehicle tracking themed columns
  const parentColumns = useMemo(() => {
    if (columns?.length) return columns;
    return [
      { key: "vehicle", title: "Vehicle", width: "25%" },
      { key: "driver", title: "Driver", width: "20%" },
      { key: "status", title: "Status", width: "15%" },
      { key: "location", title: "Location", width: "25%" },
      { key: "lastUpdate", title: "Updated", width: "15%" },
    ];
  }, [columns]);

  const childColumns = useMemo(() => {
    if (nestedColumns?.length) return nestedColumns;
    return [
      { key: "timestamp", title: "Time", width: "20%" },
      { key: "event", title: "Event", width: "25%" },
      { key: "location", title: "Location", width: "30%" },
      { key: "details", title: "Details", width: "25%" },
    ];
  }, [nestedColumns]);

  // pagination slice
  const pageCount = Math.max(1, Math.ceil((data?.length || 0) / rowsPerPage));
  const startIdx = (page - 1) * rowsPerPage;
  const pageData = useMemo(() => (pagination ? data?.slice(startIdx, startIdx + rowsPerPage) : data), [data, pagination, startIdx, rowsPerPage]);

  const setNextToggled = (next) => {
    if (controlledToggledRows && onToggleChange) onToggleChange(next);
    else setUncontrolledToggled(next);
  };

  const toggleRow = (index) => {
    const next = new Set(toggledRows);
    if (next.has(index)) next.delete(index);
    else next.add(index);
    setNextToggled(next);
  };

  const s = mergeStyles(styles, styleOverrides);

  const renderHeader = () => (
    <View style={[s.row, s.headerRow, Platform.OS === "web" && stickyHeader && s.stickyHeader]}>
      {parentColumns.map((c, i) => (
        <View key={String(c.key) + i} style={[s.cell, { flex: c.flex ?? asFlex(c.width, 1) }]}>
          <Text style={[s.text, s.headerText]} numberOfLines={1}>
            {c.title}
          </Text>
        </View>
      ))}
      <View style={[s.cell, { flex: asFlex("10%", 0.8) }]}>
        <Text style={[s.text, s.headerText]} numberOfLines={1}>Details</Text>
      </View>
    </View>
  );

  if (!data || data.length === 0) {
    return (
      <View style={[s.container, style]}>
        <Text style={s.emptyTable}>No vehicle data available</Text>
      </View>
    );
  }

  return (
    <View
      style={[s.container, style]}
      testID={effectiveConfig.testID}
      accessibilityLabel={effectiveConfig.testID}
    >
      {renderHeader()}

      <FlatList
        data={pageData}
        keyExtractor={(_, i) => String(startIdx + i)}
        contentContainerStyle={{ paddingBottom: 8 }}
        showsVerticalScrollIndicator={false}
        renderItem={({ item, index }) => {
          const globalIndex = startIdx + index;
          const isOpen = toggledRows.has(globalIndex);
          const rowId = `expandButton-${globalIndex}`;
          const rows =
            item?.events ??
            item?.children ??
            (typeof getNestedDataForRow === "function" ? getNestedDataForRow(item) : undefined) ??
            nestedData ??
            [];

          const onExpandPress = (e) => {
            onRowClickEvent && onRowClickEvent(e, globalIndex);
            toggleRow(globalIndex);
            if (Platform.OS === "web") {
              AccessibilityInfo.announceForAccessibility?.(`Vehicle ${globalIndex + 1} ${isOpen ? "collapsed" : "expanded"}`);
            }
          };

          const stripe = zebra && globalIndex % 2 ? s.zebraAlt : null;

          return (
            <View style={[s.parentBlock, stripe]}>
              {/* Parent row */}
              <View style={s.row}>
                {parentColumns.map((c, i) => {
                  const content = c.render
                    ? c.render(item, globalIndex)
                    : typeof c.key === "string"
                    ? getByPath(item, c.key)
                    : item[c.key];
                  return (
                    <Pressable
                      key={String(c.key) + i}
                      onHoverIn={() => {}}
                      onHoverOut={() => {}}
                      style={({ hovered }) => [
                        s.cell,
                        { flex: c.flex ?? asFlex(c.width, 1) },
                        effectiveConfig.tableLayout?.hover && hovered && s.hoverCell,
                      ]}
                    >
                      <Text style={s.text} numberOfLines={2}>
                        {content == null ? "-" : String(content)}
                      </Text>
                    </Pressable>
                  );
                })}

                {/* Action button */}
                <View style={[s.cell, { flex: asFlex("10%", 0.8) }]}>
                  <Pressable
                    onPress={onExpandPress}
                    accessibilityRole="button"
                    accessibilityLabel={rowId}
                    testID={rowId}
                    style={({ pressed, hovered }) => [
                      s.expandBtn,
                      (pressed || hovered) && s.expandBtnPressed,
                    ]}
                  >
                    <Text style={s.expandBtnText}>{isOpen ? "▾" : "▸"}</Text>
                  </Pressable>
                </View>
              </View>

              {/* Nested events */}
              {effectiveConfig.detailsTemplate && isOpen && (
                <View style={s.nestedWrap}>
                  <NestedTable rows={rows} columns={childColumns} s={s} zebra={zebra} />
                </View>
              )}
            </View>
          );
        }}
        ListFooterComponent={
          pagination && pageCount > 1 ? (
            <View style={s.footerBar}>
              <Pagination page={page} setPage={setPage} pageCount={pageCount} s={s} />
              <View style={{ flex: 1 }} />
              <RowsPerPage value={rowsPerPage} setValue={(v) => { setRowsPerPage(v); setPage(1); }} s={s} />
            </View>
          ) : null
        }
      />
    </View>
  );
}

/* ========== themed styles for vehicle tracking ========== */
const styles = StyleSheet.create({
  container: {
    backgroundColor: "#ffffff",
    borderRadius: 8,
    overflow: "hidden",
  },
  row: {
    flexDirection: "row",
    alignItems: "stretch",
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: "#e5e7eb",
    backgroundColor: "#ffffff",
    minHeight: 44,
  },
  headerRow: {
    backgroundColor: COLORS.primary || "#8BC34A",
  },
  nestedRow: {
    minHeight: 36,
  },
  nestedHeaderRow: {
    backgroundColor: "#f8fafc",
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
  },
  stickyHeader: {
    position: "sticky",
    top: 0,
    zIndex: 10,
  },
  zebraAlt: {
    backgroundColor: "#f9fafb",
  },
  nestedZebraAlt: {
    backgroundColor: "#f1f5f9",
  },
  cell: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 12,
    justifyContent: "center",
  },
  text: {
    fontSize: 13,
    color: "#0f172a",
    lineHeight: 18,
  },
  nestedText: {
    fontSize: 12,
    color: "#475569",
    lineHeight: 16,
  },
  headerText: {
    fontSize: 12,
    color: "#ffffff",
    fontWeight: "600",
  },
  nestedHeaderText: {
    fontSize: 11,
    color: "#64748b",
    fontWeight: "600",
    textTransform: "uppercase",
  },
  hoverCell: {
    backgroundColor: "#f5f7fb",
  },
  parentBlock: {
    backgroundColor: "#ffffff",
  },
  expandBtn: {
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderRadius: 4,
    backgroundColor: COLORS.primary || "#8BC34A",
    alignSelf: "center",
    minWidth: 24,
    alignItems: "center",
  },
  expandBtnPressed: {
    opacity: 0.9,
  },
  expandBtnText: {
    color: "#ffffff",
    fontWeight: "600",
    fontSize: 12,
  },
  nestedWrap: {
    padding: 12,
    backgroundColor: "#f8fafc",
    borderTopWidth: 1,
    borderTopColor: "#e5e7eb",
  },
  nestedContainer: {
    borderRadius: 6,
    overflow: "hidden",
    backgroundColor: "#ffffff",
  },
  emptyNested: {
    color: "#94a3b8",
    padding: 12,
    textAlign: "center",
    fontStyle: "italic",
    fontSize: 12,
  },
  emptyTable: {
    color: "#64748b",
    padding: 24,
    textAlign: "center",
    fontSize: 14,
  },
  footerBar: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: "#e5e7eb",
    flexDirection: "row",
    alignItems: "center",
  },
  paginationBar: {
    flexDirection: "row",
    gap: 4,
  },
  pageBtn: {
    minWidth: 28,
    height: 28,
    borderRadius: 4,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "#d1d5db",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#ffffff",
    paddingHorizontal: 6,
  },
  pageBtnActive: {
    backgroundColor: COLORS.primary || "#8BC34A",
    borderColor: COLORS.primary || "#8BC34A",
  },
  pageBtnPressed: {
    opacity: 0.9,
  },
  pageBtnText: {
    fontSize: 12,
    color: "#4b5563",
    fontWeight: "500",
  },
  pageBtnTextActive: {
    color: "#ffffff",
    fontWeight: "600",
  },
  pageBtnDisabled: {
    color: "#d1d5db",
  },
  rowsPerPage: {
    height: 28,
    borderRadius: 4,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "#d1d5db",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#ffffff",
    paddingHorizontal: 8,
  },
  rowsPerPageText: {
    fontSize: 12,
    color: "#4b5563",
    fontWeight: "500",
  },
});
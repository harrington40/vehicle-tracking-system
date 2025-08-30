// components/layout/Container.js
import React from "react";
import { ScrollView, View, StyleSheet, useWindowDimensions } from "react-native";
import { SPACING, COLORS } from "../../lib/theme";

/**
 * Container Component
 * -------------------
 * Primary page container that handles:
 * - Background color for the entire page
 * - Vertical scrolling when content overflows
 * - Horizontal centering of content
 * - Width limiting via maxWidth prop
 * 
 * @param {ReactNode} children - Content to be displayed inside the container
 * @param {number} maxWidth - Maximum width in pixels for the content (default: 1280px)
 * 
 * USAGE EXAMPLE:
 * <Container maxWidth={1024}>
 *   <Text>Your page content here</Text>
 * </Container>
 * 
 * CUSTOMIZATION:
 * - To change background color: modify COLORS.bg in lib/theme.js
 * - To change padding: modify SPACING.xl in lib/theme.js or update styles.cc
 */
export default function Container({ children, maxWidth = 1280 }) {
  return (
    <ScrollView 
      style={styles.root}           // Sets background color and flex:1 to fill screen
      contentContainerStyle={styles.cc}  // Adds padding around entire page content
    >
      <View style={[styles.clamp, { maxWidth }]}>{children}</View>
    </ScrollView>
  );
}

/**
 * GrowGrid Component
 * -----------------
 * Creates a responsive grid that automatically adjusts columns based on available width.
 * Features:
 * - Auto-wrapping items
 * - Consistent gutters between items
 * - Responsive column count based on container width
 * - Equal width columns in each row
 * 
 * @param {ReactNode} children - Grid items to be displayed
 * @param {number} minItemWidth - Minimum width for each item (default: 320px)
 * @param {number} gutter - Space between grid items (default: SPACING.md from theme)
 * @param {number} maxWidth - Maximum total width of grid (default: 1280px)
 * 
 * HOW IT WORKS:
 * 1. Calculates available width considering page padding
 * 2. Determines how many columns can fit based on minItemWidth
 * 3. Sets each item's width as a percentage (100% / columnCount)
 * 4. Uses negative margin technique for consistent gutters
 * 
 * USAGE EXAMPLE:
 * <GrowGrid minItemWidth={400} gutter={16}>
 *   <Card>Item 1</Card>
 *   <Card>Item 2</Card>
 * </GrowGrid>
 * 
 * CUSTOMIZATION:
 * - For larger items: increase minItemWidth
 * - For more spacing: increase gutter
 * - For different layouts at different breakpoints: use multiple GrowGrid components 
 *   with conditional rendering based on screen width
 */
export function GrowGrid({ children, minItemWidth = 320, gutter = SPACING.md, maxWidth = 1280 }) {
  // Get current window dimensions (responsive to window resizing)
  const { width } = useWindowDimensions();
  
  // Calculate content width accounting for page padding and maxWidth limit
  // SPACING.xl * 2 represents left and right page padding
  const contentWidth = Math.max(0, Math.min(width - SPACING.xl * 2, maxWidth));
  
  // Calculate how many columns will fit
  // We add gutter to minItemWidth because each item's true minimum width includes half a gutter on each side
  const cols = Math.max(1, Math.floor((contentWidth + gutter) / (minItemWidth + gutter)));
  
  // Calculate each item's width as percentage (ensures equal column widths)
  const basisPct = 100 / cols;

  return (
    <View style={{ 
      flexDirection: "row",   // Items flow horizontally
      flexWrap: "wrap",       // Wrap to next line when needed
      margin: -gutter / 2     // Negative margin offsets padding of child items for edge alignment
    }}>
      {React.Children.map(children, (child, i) => (
        <View key={i} style={{ 
          width: `${basisPct}%`,  // Set width based on column count
          padding: gutter / 2      // Half gutter on all sides creates full gutter between items
        }}>
          <View style={{ flex: 1 }}>{child}</View>
        </View>
      ))}
    </View>
  );
}

/**
 * Component Styles
 * ---------------
 * root: Styles for the main ScrollView
 * cc: ContentContainerStyle for the ScrollView padding
 * clamp: Width control and centering for the inner container
 * 
 * MODIFICATIONS:
 * - To change page background: update backgroundColor in root
 * - To change page padding: update padding in cc
 * - To adjust content alignment: modify alignSelf in clamp
 */
const styles = StyleSheet.create({
  root: { 
    flex: 1,                    // Fill available screen space
    backgroundColor: COLORS.bg  // Page background color from theme
  },
  cc: { 
    padding: SPACING.xl         // Padding around entire page content
  },
  clamp: { 
    width: "100%",              // Use full available width
    alignSelf: "center"         // Center the container horizontally
  }
});
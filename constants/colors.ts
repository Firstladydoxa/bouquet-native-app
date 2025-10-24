// Define the theme interface for better type safety
export interface ThemeColors {
  primary: string;
  primaryLight?: string;
  secondary?: string;
  secondaryLight?: string;
  tertiary?: string;
  tertiaryLight?: string;
  background: string;
  text: string;
  textLight: string;
  border: string;
  white: string;
  card: string;
  shadow: string;
  success?: string;
  warning?: string;
  error?: string;
  info?: string;
}

// ===========================================
// COMPLEMENTARY COLOR SCHEMES
// Uses colors opposite each other on the color wheel
// ===========================================

// Complementary Teal-Coral Theme
const mintTheme: ThemeColors = {
  primary: "#00897B",      // Teal
  primaryLight: "#4DB6AC",  // Light Teal
  secondary: "#FF5252",    // Coral-Red (complementary)
  secondaryLight: "#FF8A80", // Light Coral
  tertiary: "#004D40",     // Dark Teal
  tertiaryLight: "#00897B", // Light Dark Teal
  background: "#E0F2F1",
  text: "#004D40",
  border: "#B2DFDB",
  white: "#FFFFFF",
  textLight: "#4DB6AC",
  card: "#FFFFFF",
  shadow: "#000000",
  success: "#00C853",
  warning: "#FFB300",
  error: "#D32F2F",
  info: "#00ACC1",
};

// ===========================================
// SPLIT-COMPLEMENTARY COLOR SCHEMES
// Uses a base color and the two colors adjacent to its complement
// ===========================================

// Split-Complementary Purple Theme
const midnightTheme: ThemeColors = {
  primary: "#5E35B1",      // Deep Purple (base)
  primaryLight: "#9575CD",  // Light Purple
  secondary: "#43A047",    // Green (split-complement 1)
  secondaryLight: "#66BB6A", // Light Green
  tertiary: "#FDD835",     // Yellow (split-complement 2)
  tertiaryLight: "#FFEB3B", // Light Yellow
  background: "#EDE7F6",
  text: "#311B92",
  border: "#D1C4E9",
  white: "#FFFFFF",
  textLight: "#9575CD",
  card: "#FFFFFF",
  shadow: "#000000",
  success: "#66BB6A",
  warning: "#FFEB3B",
  error: "#E53935",
  info: "#7E57C2",
};

// Split-Complementary Orange Theme
const sunsetVibeTheme: ThemeColors = {
  primary: "#FF6B35",      // Orange (base)
  primaryLight: "#FF8A65",  // Light Orange
  secondary: "#004E89",    // Blue (split-complement 1)
  secondaryLight: "#0288D1", // Light Blue
  tertiary: "#00A896",     // Teal (split-complement 2)
  tertiaryLight: "#26C6DA", // Light Teal
  background: "#FFF8F3",
  text: "#2C1810",
  border: "#FFD5CC",
  white: "#FFFFFF",
  textLight: "#FF8A65",
  card: "#FFFFFF",
  shadow: "#000000",
  success: "#00C853",
  warning: "#FFC107",
  error: "#D32F2F",
  info: "#0288D1",
};

// ===========================================
// TRIADIC COLOR SCHEMES
// Uses three colors equally spaced on the color wheel
// ===========================================

// Triadic Red-Yellow-Blue Theme
const roseGoldTheme: ThemeColors = {
  primary: "#C2185B",      // Pink-Red
  primaryLight: "#F06292",  // Light Pink
  secondary: "#FBC02D",    // Yellow (120° away)
  secondaryLight: "#FDD835", // Light Yellow
  tertiary: "#1976D2",     // Blue (240° away)
  tertiaryLight: "#42A5F5", // Light Blue
  background: "#FCE4EC",
  text: "#880E4F",
  border: "#F8BBD0",
  white: "#FFFFFF",
  textLight: "#F06292",
  card: "#FFFFFF",
  shadow: "#000000",
  success: "#66BB6A",
  warning: "#FDD835",
  error: "#D32F2F",
  info: "#42A5F5",
};

// Triadic Green-Orange-Purple Theme
const tropicalTheme: ThemeColors = {
  primary: "#00BFA5",      // Turquoise
  primaryLight: "#4DD0E1",  // Light Turquoise
  secondary: "#FF6E40",    // Deep Orange (120° away)
  secondaryLight: "#FF8A65", // Light Orange
  tertiary: "#7C4DFF",     // Deep Purple (240° away)
  tertiaryLight: "#9575CD", // Light Purple
  background: "#E0F7FA",
  text: "#004D40",
  border: "#B2EBF2",
  white: "#FFFFFF",
  textLight: "#4DD0E1",
  card: "#FFFFFF",
  shadow: "#000000",
  success: "#00E676",
  warning: "#FFAB00",
  error: "#FF3D00",
  info: "#00B8D4",
};

// Triadic Blue-Pink-Yellow Theme
const vibrantTheme: ThemeColors = {
  primary: "#2962FF",      // Bright Blue
  primaryLight: "#2979FF",  // Light Blue
  secondary: "#FF1744",    // Pink-Red (120° away)
  secondaryLight: "#FF4081", // Light Pink
  tertiary: "#FFEA00",     // Yellow (240° away)
  tertiaryLight: "#FFC400", // Light Yellow
  background: "#F5F5F5",
  text: "#212121",
  border: "#E0E0E0",
  white: "#FFFFFF",
  textLight: "#757575",
  card: "#FFFFFF",
  shadow: "#000000",
  success: "#00E676",
  warning: "#FFC400",
  error: "#FF3D00",
  info: "#2979FF",
};

// ===========================================
// TETRADIC (DOUBLE COMPLEMENTARY) COLOR SCHEMES
// Uses two pairs of complementary colors
// ===========================================

// Tetradic Gold-Navy-Purple-Green Theme
const goldNavyTheme: ThemeColors = {
  primary: "#1A237E",      // Navy Blue
  primaryLight: "#3949AB",  // Light Navy Blue
  secondary: "goldenrod",   // Goldenrod
  secondaryLight: "#F4D03F", // Light Goldenrod
  tertiary: "#7B1FA2",     // Purple
  tertiaryLight: "#AB47BC", // Light Purple
  background: "#FFFFFF",    // White background
  text: "#1A1A1A",
  textLight: "#666666",     // Adjusted for better visibility on white
  border: "#E0E0E0",        // Adjusted for white background
  white: "#FFFFFF",
  card: "#F5F5F5",          // Light gray for cards on white
  shadow: "#000000",
  success: "#388E3C",       // Green
  warning: "#F57C00",
  error: "#C62828",
  info: "#303F9F",
};

// Tetradic Ruby-Emerald-Sapphire-Amber Theme
const jewelTheme: ThemeColors = {
  primary: "#D32F2F",      // Ruby Red
  primaryLight: "#EF5350",  // Light Ruby
  secondary: "#388E3C",    // Emerald Green (complementary)
  secondaryLight: "#66BB6A", // Light Emerald
  tertiary: "#1976D2",     // Sapphire Blue (second pair)
  tertiaryLight: "#42A5F5", // Light Sapphire
  background: "#FAFAFA",
  text: "#212121",
  border: "#E0E0E0",
  white: "#FFFFFF",
  textLight: "#757575",
  card: "#FFFFFF",
  shadow: "#000000",
  success: "#4CAF50",
  warning: "#FFA000",      // Amber (complementary to blue)
  error: "#D32F2F",
  info: "#1976D2",
};

// ===========================================
// GRADIENT COLOR SCHEMES
// Beautiful gradient combinations for modern UI
// ===========================================

// Sunset Gradient Theme
const sunsetGradientTheme: ThemeColors = {
  primary: "#FF6B6B",      // Coral Red
  primaryLight: "#FF9F80",  // Light Coral
  secondary: "#FFD93D",    // Golden Yellow
  secondaryLight: "#FFE082", // Light Golden
  tertiary: "#FF8C42",     // Orange middle
  tertiaryLight: "#FFAB40", // Light Orange
  background: "#FFF9F5",
  text: "#2C1810",
  border: "#FFE5D9",
  white: "#FFFFFF",
  textLight: "#FF9F80",
  card: "#FFFFFF",
  shadow: "#000000",
  success: "#6BCF7F",
  warning: "#FFB74D",
  error: "#E53935",
  info: "#FF8A65",
};

// Ocean Gradient Theme
const oceanGradientTheme: ThemeColors = {
  primary: "#667EEA",      // Soft Purple
  primaryLight: "#A8B3E8",  // Light Purple
  secondary: "#764BA2",    // Deep Purple
  secondaryLight: "#9C27B0", // Light Deep Purple
  tertiary: "#4A5FBE",     // Blue Purple
  tertiaryLight: "#7986CB", // Light Blue Purple
  background: "#F0F4FF",
  text: "#1A1A2E",
  border: "#D6E0FF",
  white: "#FFFFFF",
  textLight: "#A8B3E8",
  card: "#FFFFFF",
  shadow: "#000000",
  success: "#66BB6A",
  warning: "#FFB74D",
  error: "#EF5350",
  info: "#7986CB",
};

// Aurora Gradient Theme
const auroraTheme: ThemeColors = {
  primary: "#11998E",      // Teal
  primaryLight: "#5DD9B8",  // Light Teal
  secondary: "#38EF7D",    // Bright Green
  secondaryLight: "#00E676", // Light Green
  tertiary: "#25CFA1",     // Turquoise middle
  tertiaryLight: "#26C6DA", // Light Turquoise
  background: "#E8FFF8",
  text: "#0D3B3C",
  border: "#B8F3E6",
  white: "#FFFFFF",
  textLight: "#5DD9B8",
  card: "#FFFFFF",
  shadow: "#000000",
  success: "#00E676",
  warning: "#FFAB40",
  error: "#FF5252",
  info: "#26C6DA",
};

// Berry Gradient Theme
const berryTheme: ThemeColors = {
  primary: "#EC008C",      // Magenta
  primaryLight: "#FF8FB3",  // Light Magenta
  secondary: "#FC6767",    // Coral
  secondaryLight: "#FF8A80", // Light Coral
  tertiary: "#F43A7E",     // Pink middle
  tertiaryLight: "#FF4081", // Light Pink
  background: "#FFF0F7",
  text: "#4A0E2E",
  border: "#FFD6EA",
  white: "#FFFFFF",
  textLight: "#FF8FB3",
  card: "#FFFFFF",
  shadow: "#000000",
  success: "#66BB6A",
  warning: "#FFB74D",
  error: "#E91E63",
  info: "#FF4081",
};

// Cosmic Gradient Theme
const cosmicTheme: ThemeColors = {
  primary: "#4E54C8",      // Deep Blue
  primaryLight: "#9FA3E8",  // Light Purple
  secondary: "#8F94FB",    // Light Purple
  secondaryLight: "#B39DDB", // Lighter Purple
  tertiary: "#6B72D8",     // Medium Purple
  tertiaryLight: "#9FA3E8", // Light Medium Purple
  background: "#F5F6FF",
  text: "#1A1B3D",
  border: "#D9DCFF",
  white: "#FFFFFF",
  textLight: "#9FA3E8",
  card: "#FFFFFF",
  shadow: "#000000",
  success: "#7E57C2",
  warning: "#FFB74D",
  error: "#EF5350",
  info: "#5C6BC0",
};

// Peach Gradient Theme
const peachTheme: ThemeColors = {
  primary: "#FFEAA7",      // Peach Yellow
  primaryLight: "#FFF4D6",  // Light Peach
  secondary: "#FDCB6E",    // Orange Peach
  secondaryLight: "#FFE082", // Light Orange Peach
  tertiary: "#FFE08A",     // Light Peach
  tertiaryLight: "#FFF59D", // Lighter Peach
  background: "#FFFDF7",
  text: "#5D4E37",
  border: "#FFF4D6",
  white: "#FFFFFF",
  textLight: "#E8CA7D",
  card: "#FFFFFF",
  shadow: "#000000",
  success: "#A8E6CF",
  warning: "#FFB74D",
  error: "#FF6B6B",
  info: "#FBC02D",
};

// Complementary Purple-Yellow Theme
const purpleComplementaryTheme: ThemeColors = {
  primary: "#7B1FA2",      // Purple
  primaryLight: "#BA68C8",  // Light Purple
  secondary: "#FDD835",    // Yellow (complementary)
  secondaryLight: "#FFEB3B", // Light Yellow
  tertiary: "#6A1B9A",     // Dark Purple
  tertiaryLight: "#AB47BC", // Light Dark Purple
  background: "#F3E5F5",
  text: "#4A148C",
  border: "#E1BEE7",
  white: "#FFFFFF",
  textLight: "#BA68C8",
  card: "#FFFFFF",
  shadow: "#000000",
  success: "#66BB6A",
  warning: "#FFB300",
  error: "#E53935",
  info: "#9C27B0",
};

// Split-Complementary Burgundy Theme
const burgundySplitTheme: ThemeColors = {
  primary: "#8B1538",      // Burgundy (base)
  primaryLight: "#C2185B",  // Light Burgundy
  secondary: "#7CB342",    // Yellow-Green (split-complement 1)
  secondaryLight: "#9CCC65", // Light Yellow-Green
  tertiary: "#1E88E5",     // Blue (split-complement 2)
  tertiaryLight: "#42A5F5", // Light Blue
  background: "#FCE4EC",
  text: "#4A0E1E",
  border: "#F8BBD0",
  white: "#FFFFFF",
  textLight: "#C2185B",
  card: "#FFFFFF",
  shadow: "#000000",
  success: "#66BB6A",
  warning: "#FFB300",
  error: "#D32F2F",
  info: "#42A5F5",
};

// Tetradic Indigo Theme
const indigoTetradicTheme: ThemeColors = {
  primary: "#3F51B5",      // Indigo
  primaryLight: "#7986CB",  // Light Indigo
  secondary: "#FF5722",    // Deep Orange (complementary)
  secondaryLight: "#FF8A65", // Light Orange
  tertiary: "#4CAF50",     // Green (second pair)
  tertiaryLight: "#81C784", // Light Green
  background: "#E8EAF6",
  text: "#1A237E",
  border: "#C5CAE9",
  white: "#FFFFFF",
  textLight: "#7986CB",
  card: "#FFFFFF",
  shadow: "#000000",
  success: "#66BB6A",
  warning: "#FFA726",      // Orange (complementary to green)
  error: "#EF5350",
  info: "#5C6BC0",
};

// Triadic Black Theme
const blackTriadicTheme: ThemeColors = {
  primary: "#212121",      // Black
  primaryLight: "#757575",  // Light Gray
  secondary: "#E91E63",    // Pink (120° away)
  secondaryLight: "#F48FB1", // Light Pink
  tertiary: "#00BCD4",     // Cyan (240° away)
  tertiaryLight: "#4DD0E1", // Light Cyan
  background: "#FAFAFA",
  text: "#212121",
  border: "#E0E0E0",
  white: "#FFFFFF",
  textLight: "#757575",
  card: "#FFFFFF",
  shadow: "#000000",
  success: "#66BB6A",
  warning: "#FFA726",
  error: "#EF5350",
  info: "#26C6DA",
};

// Complementary Coffee Theme
const coffeeComplementaryTheme: ThemeColors = {
  primary: "#6F4E37",      // Coffee Brown
  primaryLight: "#A1887F",  // Light Brown
  secondary: "#4A90E2",    // Sky Blue (complementary)
  secondaryLight: "#64B5F6", // Light Sky Blue
  tertiary: "#3E2723",     // Dark Brown
  tertiaryLight: "#8D6E63", // Light Dark Brown
  background: "#FFF8F0",
  text: "#3E2723",
  border: "#D7CCC8",
  white: "#FFFFFF",
  textLight: "#A1887F",
  card: "#FFFFFF",
  shadow: "#000000",
  success: "#66BB6A",
  warning: "#FFB300",
  error: "#E53935",
  info: "#42A5F5",
};

// Tetradic Forest Theme
const forestTetradicTheme: ThemeColors = {
  primary: "#2E7D32",      // Forest Green
  primaryLight: "#81C784",  // Light Green
  secondary: "#D32F2F",    // Red (complementary)
  secondaryLight: "#EF5350", // Light Red
  tertiary: "#1976D2",     // Blue (second pair)
  tertiaryLight: "#42A5F5", // Light Blue
  background: "#E8F5E9",
  text: "#1B5E20",
  border: "#C8E6C9",
  white: "#FFFFFF",
  textLight: "#81C784",
  card: "#FFFFFF",
  shadow: "#000000",
  success: "#4CAF50",
  warning: "#FFA726",      // Orange (complementary to blue)
  error: "#EF5350",
  info: "#42A5F5",
};

// Split-Complementary Ocean Theme
const oceanSplitTheme: ThemeColors = {
  primary: "#0277BD",      // Ocean Blue (base)
  primaryLight: "#4FC3F7",  // Light Blue
  secondary: "#FF6F00",    // Orange (split-complement 1)
  secondaryLight: "#FFB74D", // Light Orange
  tertiary: "#D32F2F",     // Red (split-complement 2)
  tertiaryLight: "#EF5350", // Light Red
  background: "#E1F5FE",
  text: "#01579B",
  border: "#B3E5FC",
  white: "#FFFFFF",
  textLight: "#4FC3F7",
  card: "#FFFFFF",
  shadow: "#000000",
  success: "#66BB6A",
  warning: "#FFB300",
  error: "#EF5350",
  info: "#0288D1",
};

// Triadic Sunset Theme
const sunsetTriadicTheme: ThemeColors = {
  primary: "#FF6B35",      // Sunset Orange
  primaryLight: "#FF8A65",  // Light Orange
  secondary: "#6A4C93",    // Purple (120° away)
  secondaryLight: "#9575CD", // Light Purple
  tertiary: "#1B9AAA",     // Teal (240° away)
  tertiaryLight: "#4DD0E1", // Light Teal
  background: "#FFF5F0",
  text: "#2C1810",
  border: "#FFD5CC",
  white: "#FFFFFF",
  textLight: "#FF8A65",
  card: "#FFFFFF",
  shadow: "#000000",
  success: "#66BB6A",
  warning: "#FFC107",
  error: "#EF5350",
  info: "#26C6DA",
};

export const THEMES: Record<string, ThemeColors> = {
  mint: mintTheme,
  midnight: midnightTheme,
  sunsetVibe: sunsetVibeTheme,
  roseGold: roseGoldTheme,
  tropical: tropicalTheme,
  vibrant: vibrantTheme,
  goldNavy: goldNavyTheme,
  jewel: jewelTheme,
  sunsetGradient: sunsetGradientTheme,
  oceanGradient: oceanGradientTheme,
  aurora: auroraTheme,
  berry: berryTheme,
  cosmic: cosmicTheme,
  peach: peachTheme,
  purpleComplementary: purpleComplementaryTheme,
  burgundySplit: burgundySplitTheme,
  indigoTetradic: indigoTetradicTheme,
  blackTriadic: blackTriadicTheme,
  coffeeComplementary: coffeeComplementaryTheme,
  forestTetradic: forestTetradicTheme,
  oceanSplit: oceanSplitTheme,
  sunsetTriadic: sunsetTriadicTheme,
};

// 👇 This is now deprecated - use ThemeProvider instead
export const COLORS = THEMES.mint;

// 👇 This is now deprecated - use ThemeProvider instead  
export const RHAPSODYLANGUAGES_THEME = THEMES.goldNavy;

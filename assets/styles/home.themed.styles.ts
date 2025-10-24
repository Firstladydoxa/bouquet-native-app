import { ThemeColors } from "@/constants/colors";
import { Dimensions, StyleSheet } from "react-native";

const { width } = Dimensions.get("window");
const cardWidth = (width - 48) / 2;

// Function to create themed styles
export const createHomeStyles = (colors: ThemeColors) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    paddingBottom: 32,
  },
  heroSection: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  heroImage: {
    width: "100%",
    height: 200,
    borderRadius: 16,
    backgroundColor: colors.border,
  },
  welcomeSection: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
    flexDirection: "row" as const,
    alignItems: "center" as const,
    justifyContent: "space-between" as const,
  },
  welcomeText: {
    fontSize: 32,
    fontWeight: "800" as const,
    color: colors.text,
    letterSpacing: -0.5,
  },
  featuredSection: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  featuredCard: {
    borderRadius: 24,
    overflow: "hidden" as const,
    backgroundColor: colors.card,
    shadowColor: colors.shadow,
    shadowOffset: {
      width: 0,
      height: 12,
    },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 12,
  },
  featuredImageContainer: {
    height: 240,
    backgroundColor: colors.primary,
    position: "relative" as const,
  },
  featuredImage: {
    width: "100%",
    height: "100%",
  },
  featuredOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.3)",
    justifyContent: "space-between" as const,
    padding: 20,
  },
  featuredBadge: {
    backgroundColor: colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    alignSelf: "flex-start" as const,
  },
  featuredBadgeText: {
    color: colors.white,
    fontSize: 12,
    fontWeight: "600" as const,
  },
  featuredContent: {
    justifyContent: "flex-end" as const,
  },
  featuredTitle: {
    fontSize: 24,
    fontWeight: "800" as const,
    color: colors.white,
    marginBottom: 12,
    textShadowColor: "rgba(0,0,0,0.3)",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  featuredMeta: {
    flexDirection: "row" as const,
    gap: 16,
  },
  metaItem: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 4,
  },
  metaText: {
    fontSize: 14,
    color: colors.white,
    fontWeight: "600" as const,
  },
  recipesSection: {
    paddingHorizontal: 16,
    marginTop: 8,
  },
  sectionHeader: {
    marginBottom: 26,
  },
  sectionTitle: {
    fontSize: 20,
    fontFamily: "BerkshireSwash_400Regular",
    color: colors.primary,
    letterSpacing: -0.5,
    textAlign: "center" as const,
  },
  recipesGrid: {
    gap: 16,
  },
  row: {
    justifyContent: "space-between" as const,
    gap: 16,
  },
  emptyState: {
    alignItems: "center" as const,
    paddingVertical: 64,
    paddingHorizontal: 32,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "700" as const,
    color: colors.text,
    marginTop: 16,
    marginBottom: 8,
  },
  emptyDescription: {
    fontSize: 14,
    color: colors.textLight,
    textAlign: "center" as const,
  },
  categoryFilterContainer: {
    marginVertical: 16,
  },
  categoryFilterScrollContent: {
    paddingHorizontal: 16,
    gap: 12,
  },
  categoryButton: {
    flexDirection: "column" as const,
    alignItems: "center" as const,
    justifyContent: "center" as const,
    backgroundColor: colors.card,
    paddingVertical: 8,
    paddingHorizontal: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
    width: 90,
    height: 90,
    shadowColor: colors.shadow,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  selectedCategory: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
    shadowOpacity: 0.15,
    elevation: 4,
  },
  categoryImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginBottom: 4,
    backgroundColor: colors.border,
  },
  selectedCategoryImage: {
    borderWidth: 2,
    borderColor: colors.white,
  },
  categoryText: {
    fontSize: 11,
    fontWeight: "600" as const,
    color: colors.text,
    textAlign: "center" as const,
    lineHeight: 13,
    maxWidth: 74,
  },
  categoryAlphabetLetter: {
    fontSize: 28,
    fontFamily: 'BerkshireSwash_400Regular',
    color: colors.secondary,
    textAlign: "center" as const,
  },
  selectedCategoryText: {
    color: colors.white,
  },

  selectedCategoryAlphabetLetter: {
    color: colors.white,
  },
});

// Function to create themed recipe card styles
export const createRecipeCardStyles = (colors: ThemeColors) => StyleSheet.create({
  container: {
    width: cardWidth,
    backgroundColor: colors.card,
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: colors.shadow,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    overflow: "hidden" as const,
  },
  imageContainer: {
    position: "relative" as const,
    height: 140,
  },
  image: {
    width: "100%",
    height: "100%",
    backgroundColor: colors.border,
  },
  content: {
    padding: 12,
  },
  title: {
    fontSize: 15,
    fontWeight: "700" as const,
    color: colors.text,
    marginBottom: 4,
    lineHeight: 20,
  },
  description: {
    fontSize: 12,
    color: colors.textLight,
    marginBottom: 8,
    lineHeight: 16,
  },
  footer: {
    flexDirection: "row" as const,
    justifyContent: "space-between" as const,
    alignItems: "center" as const,
  },
  timeContainer: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
  },
  timeText: {
    fontSize: 11,
    color: colors.textLight,
    marginLeft: 4,
    fontWeight: "500" as const,
  },
  servingsContainer: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
  },
  servingsText: {
    fontSize: 11,
    color: colors.textLight,
    marginLeft: 4,
    fontWeight: "500" as const,
  },
});
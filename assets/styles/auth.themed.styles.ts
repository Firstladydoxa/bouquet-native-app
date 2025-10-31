import { Dimensions, StyleSheet } from "react-native";
import { ThemeColors } from "../../constants/colors";

const { height } = Dimensions.get("window");

// Function to create themed auth styles
export const createAuthStyles = (colors: ThemeColors) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 40,
  },
  backButton: {
    position: "absolute" as const,
    top: 10,
    left: 10,
    zIndex: 10,
    padding: 8,
    borderRadius: 8,
  },
  imageContainer: {
    height: height * 0.3,
    marginBottom: 30,
    justifyContent: "center" as const,
    alignItems: "center" as const,
  },
  image: {
    width: 320,
    height: 320,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold" as const,
    color: colors.primary,
    textAlign: "center" as const,
    marginBottom: 40,
  },
  subtitle: {
    fontSize: 16,
    color: colors.textLight,
    textAlign: "center" as const,
    marginBottom: 30,
  },
  formContainer: {
    flex: 1,
  },
  inputContainer: {
    marginBottom: 20,
    position: "relative" as const,
  },
  textInput: {
    fontSize: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: 12,
    backgroundColor: colors.card,
    color: colors.text,
  },
  textInputFocused: {
    borderColor: colors.primary,
    shadowColor: colors.primary,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  eyeIcon: {
    position: "absolute" as const,
    right: 16,
    top: 17,
  },
  eyeButton: {
    position: "absolute" as const,
    right: 16,
    top: 17,
  },
  button: {
    backgroundColor: colors.primary,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center" as const,
    marginTop: 10,
    shadowColor: colors.shadow,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
  },
  authButton: {
    backgroundColor: colors.secondary,
    paddingVertical: 16,
    borderRadius: 20,
    alignItems: "center" as const,
    marginTop: 10,
    shadowColor: colors.shadow,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  buttonText: {
    color: colors.white,
    fontSize: 18,
    fontWeight: "600" as const,
  },
  buttonDisabled: {
    backgroundColor: colors.textLight,
    shadowOpacity: 0,
    elevation: 0,
  },
  dividerContainer: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    marginVertical: 30,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: colors.border,
  },
  dividerText: {
    fontSize: 14,
    color: colors.textLight,
    marginHorizontal: 16,
    fontWeight: "500" as const,
  },
  linkContainer: {
    alignItems: "center" as const,
    marginTop: 20,
  },
  linkText: {
    fontSize: 16,
    color: colors.textLight,
  },
  link: {
    color: colors.primary,
    fontWeight: "600" as const,
  },
  errorText: {
    color: colors.error || "#FF6B6B",
    fontSize: 14,
    marginTop: 8,
    textAlign: "center" as const,
  },
});
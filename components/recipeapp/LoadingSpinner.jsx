import { useThemeColors } from "@/hooks/use-themed-styles";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";

export default function LoadingSpinner({ message = "Loading...", size = "large" }) {
  const colors = useThemeColors();

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      padding: 32,
      backgroundColor: colors.background,
    },
    content: {
      alignItems: "center",
      gap: 16,
    },
    message: {
      fontSize: 16,
      color: colors.textLight,
      textAlign: "center",
      fontWeight: "500",
    },
  });

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <ActivityIndicator size={size} color={colors.primary} />
        <Text style={styles.message}>{message}</Text>
      </View>
    </View>
  );
}
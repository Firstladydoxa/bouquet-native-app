import { StyleSheet } from 'react-native';

// Create themed styles function
export const createCommonStyles = (colors: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.white,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: colors.textLight,
  },
  rhapsLangSectionTitle: {
    fontSize: 25,
    textAlign: 'center',
    fontFamily: 'BerkshireSwash_400Regular',
    color: colors.secondary,
    marginBottom: 25,
  },  
});

// Backward compatibility - this will be deprecated
export const commonStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666666',
  },
  rhapsLangSectionTitle: {
    fontSize: 25,
    textAlign: 'center',
    fontFamily: 'BerkshireSwash_400Regular',
    color: '#333333', // fallback color
    marginBottom: 12,
  },  
});

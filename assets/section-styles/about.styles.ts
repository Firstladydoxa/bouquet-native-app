import { StyleSheet } from 'react-native';

// Create themed styles function
export const createAboutStyles = (colors: any) => StyleSheet.create({
  sectionContainer: {
    paddingHorizontal: 20,
    paddingVertical: 24,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.primary,
    marginBottom: 16,
  },
  paragraphText: {
    fontSize: 16,
    lineHeight: 24,
    color: colors.text,
    marginBottom: 12,
  },
  readMoreButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  readMoreText: {
    fontSize: 16,
    color: colors.primary,
    marginRight: 4,
  },
});

// Backward compatibility - this will be deprecated
export const aboutStyles = StyleSheet.create({
  sectionContainer: {
    paddingHorizontal: 20,
    paddingVertical: 24,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1C1C1E',
    marginBottom: 16,
  },
  paragraphText: {
    fontSize: 16,
    lineHeight: 24,
    color: '#3C3C43',
    marginBottom: 12,
  },
  readMoreButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  readMoreText: {
    fontSize: 16,
    color: '#007AFF',
    marginRight: 4,
  },
});

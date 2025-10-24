# Dynamic Theming System Implementation Guide

This guide explains how to implement a flexible theming system that allows users to switch between different color themes without breaking the design.

## 🎨 Overview

The theming system consists of:
- **Theme Context**: Manages current theme state and persistence
- **Theme Colors**: Predefined color palettes for different themes
- **Themed Styles**: Dynamic style creation based on current theme
- **Theme Selector**: UI component for users to switch themes
- **Theme Hooks**: Easy access to theme colors and styled components

## 📁 File Structure

```
contexts/
  ├── ThemeContext.tsx         # Main theme provider and context
constants/
  ├── colors.ts               # Theme definitions with type safety
hooks/
  ├── use-themed-styles.ts    # Hooks for using themes in components
assets/styles/
  ├── home.themed.styles.ts   # Example of themed style sheets
components/
  ├── ui/
  │   └── ThemeSelector.tsx   # Theme selection component
  └── layout/
      └── AppWithThemeProvider.tsx # App wrapper with theme provider
```

## 🚀 Implementation Steps

### 1. Set Up Theme Provider

First, wrap your app with the ThemeProvider in your main layout file:

```tsx
// app/_layout.tsx or your main layout file
import { ThemeProvider } from '@/contexts/ThemeContext';

export default function RootLayout() {
  return (
    <ThemeProvider>
      {/* Your existing app structure */}
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        {/* ... other screens */}
      </Stack>
    </ThemeProvider>
  );
}
```

### 2. Convert Static Styles to Themed Styles

**Before (Static):**
```tsx
import { COLORS } from "@/constants/colors";

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.background, // Static color
    flex: 1,
  },
  text: {
    color: COLORS.text, // Static color
  },
});
```

**After (Themed):**
```tsx
import { useThemedStyles, useThemeColors } from "@/hooks/use-themed-styles";
import { ThemeColors } from "@/constants/colors";

// Create a function that returns styles based on theme colors
const createStyles = (colors: ThemeColors) => StyleSheet.create({
  container: {
    backgroundColor: colors.background, // Dynamic color
    flex: 1,
  },
  text: {
    color: colors.text, // Dynamic color
  },
});

// In your component:
const MyComponent = () => {
  const styles = useThemedStyles(createStyles);
  const colors = useThemeColors();
  
  // Your component code...
};
```

### 3. Use Theme Colors Directly

For simple color usage without creating full stylesheets:

```tsx
import { useThemeColors } from "@/hooks/use-themed-styles";

const MyComponent = () => {
  const colors = useThemeColors();
  
  return (
    <View>
      <Ionicons 
        name="heart" 
        color={colors.primary} // Use theme color directly
        size={24} 
      />
      <RefreshControl
        tintColor={colors.primary} // Theme-aware refresh control
        refreshing={refreshing}
        onRefresh={onRefresh}
      />
    </View>
  );
};
```

### 4. Add Theme Selector to Your App

Include the ThemeSelector component in settings or preferences:

```tsx
import { ThemeSelector } from '@/components/ui/ThemeSelector';

const SettingsScreen = () => {
  return (
    <ScrollView>
      {/* Other settings */}
      <ThemeSelector 
        onThemeSelect={(theme) => {
          console.log(`Theme changed to: ${theme}`);
        }}
      />
    </ScrollView>
  );
};
```

## 🎯 Migration Strategy

### Step-by-Step Migration

1. **Install Dependencies**
   ```bash
   npx expo install @react-native-async-storage/async-storage
   ```

2. **Add Theme Provider**
   - Wrap your app with `<ThemeProvider>`
   - Test that the context is working

3. **Convert One Screen at a Time**
   - Start with a simple screen
   - Replace static `COLORS` imports with themed hooks
   - Test thoroughly before moving to next screen

4. **Update Shared Components**
   - Convert reusable components to use themes
   - Ensure backward compatibility during transition

### Example Migration

**Original Component:**
```tsx
import { COLORS } from "@/constants/colors";

const MyScreen = () => {
  return (
    <View style={{ backgroundColor: COLORS.background }}>
      <Text style={{ color: COLORS.text }}>Hello World</Text>
    </View>
  );
};
```

**Migrated Component:**
```tsx
import { useThemeColors } from "@/hooks/use-themed-styles";

const MyScreen = () => {
  const colors = useThemeColors();
  
  return (
    <View style={{ backgroundColor: colors.background }}>
      <Text style={{ color: colors.text }}>Hello World</Text>
    </View>
  );
};
```

## 🔧 Available Themes

The system comes with 9 predefined themes:
- **Coffee**: Warm brown tones
- **Forest**: Nature-inspired greens
- **Purple**: Rich purple palette
- **Ocean**: Cool blue tones
- **Sunset**: Warm orange/red palette
- **Mint**: Fresh green-blue colors
- **Midnight**: Dark sophisticated tones
- **Rose Gold**: Elegant pink-gold colors
- **Gold Navy**: Professional gold and navy

## 🎨 Adding New Themes

To add a new theme:

1. **Define the theme colors:**
```tsx
// In constants/colors.ts
const myCustomTheme: ThemeColors = {
  primary: "#YOUR_PRIMARY_COLOR",
  background: "#YOUR_BACKGROUND_COLOR",
  text: "#YOUR_TEXT_COLOR",
  textLight: "#YOUR_LIGHT_TEXT_COLOR",
  border: "#YOUR_BORDER_COLOR",
  white: "#FFFFFF",
  card: "#YOUR_CARD_COLOR",
  shadow: "#000000",
};
```

2. **Add to themes object:**
```tsx
export const THEMES: Record<string, ThemeColors> = {
  // ... existing themes
  myCustom: myCustomTheme,
};
```

## 🔒 Type Safety

The system includes full TypeScript support:
- `ThemeColors` interface ensures all required colors are defined
- `ThemeName` type provides autocomplete for theme names
- Theme hooks are fully typed for better developer experience

## 💾 Persistence

Themes are automatically saved to device storage using AsyncStorage:
- User's theme choice persists between app sessions
- Themes load automatically on app startup
- Graceful fallback to default theme if saved theme is unavailable

## 🧪 Testing

Test your theming implementation:

1. **Switch between all available themes**
2. **Restart the app to ensure persistence works**
3. **Test on both light and dark system themes**
4. **Verify all UI elements respect theme colors**
5. **Check accessibility with different color combinations**

## 📱 Best Practices

1. **Consistent Color Usage**: Always use theme colors instead of hardcoded values
2. **Meaningful Color Names**: Use semantic color names (primary, background) rather than specific colors
3. **Accessibility**: Ensure sufficient contrast ratios in all themes
4. **Performance**: Use `useMemo` in style creation functions for complex styles
5. **Gradual Migration**: Convert components incrementally to avoid breaking changes

## 🐛 Troubleshooting

**Theme not changing?**
- Ensure your component is wrapped in `<ThemeProvider>`
- Check that you're using themed hooks instead of static imports

**Styles not updating?**
- Verify that your style creation function is properly memoized
- Ensure you're using the `useThemedStyles` hook correctly

**TypeScript errors?**
- Make sure all theme objects implement the `ThemeColors` interface
- Check that theme names are properly typed as `ThemeName`

## 🎉 Benefits

✅ **User Choice**: Users can personalize their experience
✅ **Maintainable**: Centralized color management
✅ **Scalable**: Easy to add new themes
✅ **Type Safe**: Full TypeScript support
✅ **Persistent**: User preferences are saved
✅ **Performance**: Efficient re-rendering with React context
✅ **Flexible**: Works with any component structure
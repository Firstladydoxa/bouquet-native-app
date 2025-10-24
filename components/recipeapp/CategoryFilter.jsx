import { createHomeStyles } from "@/assets/styles/home.themed.styles";
import { useThemedStyles } from "@/hooks/use-themed-styles";
import { Image } from "expo-image";
import { useEffect, useRef, useState } from "react";
import { Animated, ScrollView, Text, TouchableOpacity, View } from "react-native";

export default function CategoryFilter({ categories, selectedCategory, onSelectCategory }) {
  const homeStyles = useThemedStyles(createHomeStyles);
  const scrollViewRef = useRef(null);
  const [isUserInteracting, setIsUserInteracting] = useState(false);
  const scrollAnimationRef = useRef(null);
  
  // Auto-scroll animation using ScrollView's scrollTo method
  useEffect(() => {
    if (!isUserInteracting && scrollViewRef.current) {
      let scrollPosition = 0;
      let direction = 1; // 1 for forward, -1 for backward
      const scrollSpeed = 3; // pixels per interval
      const edgePadding = 50;
      
      const animateScroll = () => {
        if (scrollViewRef.current && !isUserInteracting) {
          // Update scroll position
          scrollPosition += scrollSpeed * direction;
          
          // Estimate max scroll (approximate)
          const estimatedMaxScroll = categories.length * 100; // Rough estimate
          
          // Reverse direction at edges
          if (scrollPosition >= estimatedMaxScroll - edgePadding) {
            direction = -1;
          } else if (scrollPosition <= 0) {
            direction = 1;
            scrollPosition = 0;
          }
          
          scrollViewRef.current.scrollTo({ 
            x: Math.max(0, scrollPosition), 
            animated: true 
          });
        }
      };
      
      // Start animation after initial delay
      const startTimeout = setTimeout(() => {
        if (!isUserInteracting) {
          scrollAnimationRef.current = setInterval(animateScroll, 50);
        }
      }, 1500);
      
      return () => {
        clearTimeout(startTimeout);
        if (scrollAnimationRef.current) {
          clearInterval(scrollAnimationRef.current);
        }
      };
    }
  }, [isUserInteracting, categories.length]);
  
  const handleScrollBegin = () => {
    setIsUserInteracting(true);
    if (scrollAnimationRef.current) {
      clearInterval(scrollAnimationRef.current);
    }
  };
  
  const handleSelectCategory = (label) => {
    setIsUserInteracting(true);
    if (scrollAnimationRef.current) {
      clearInterval(scrollAnimationRef.current);
    }
    onSelectCategory(label);
  };
  
  return (
    <View style={homeStyles.categoryFilterContainer}>
      <ScrollView
        ref={scrollViewRef}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={homeStyles.categoryFilterScrollContent}
        onScrollBeginDrag={handleScrollBegin}
        onTouchStart={handleScrollBegin}
      >
        {categories.map((category) => {
          const isSelected = selectedCategory === category.label;
          return (
            <CategoryCard
              key={category.id}
              category={category}
              isSelected={isSelected}
              onPress={handleSelectCategory}
              homeStyles={homeStyles}
            />
          );
        })}
      </ScrollView>
    </View>
  );
}

// Separate component for animated elevation effect
function CategoryCard({ category, isSelected, onPress, homeStyles }) {
  // Separate animated values for transform and shadow
  const scaleAnim = useRef(new Animated.Value(isSelected ? 1.05 : 1)).current;
  const shadowOpacityAnim = useRef(new Animated.Value(isSelected ? 0.15 : 0.05)).current;
  
  useEffect(() => {
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: isSelected ? 1.05 : 1,
        friction: 5,
        tension: 40,
        useNativeDriver: true,
      }),
      Animated.timing(shadowOpacityAnim, {
        toValue: isSelected ? 0.15 : 0.05,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();
  }, [isSelected]);
  
  return (
    <Animated.View
      style={{
        transform: [{ scale: scaleAnim }],
        width: 90,  // Fixed width
        height: 90, // Fixed height
      }}
    >
      <TouchableOpacity
        style={[
          homeStyles.categoryButton, 
          isSelected && homeStyles.selectedCategory,
          { width: 90, height: 90 } // Enforce fixed dimensions
        ]}
        onPress={() => onPress(category.label)}
        activeOpacity={0.7}
      >
        {category.flag_link ? (
          <>
            <View style={{
              width: 56,
              height: 56,
              borderRadius: 28,
              overflow: 'hidden',
              marginBottom: 4,
              backgroundColor: 'transparent',
            }}>
              <Image
                source={{ uri: category.flag_link }}
                style={{
                  width: '100%',
                  height: '100%',
                }}
                contentFit="cover"
                transition={300}
              />
            </View>
            <Text
              style={[homeStyles.categoryText, isSelected && homeStyles.selectedCategoryText]}
              numberOfLines={2}
              ellipsizeMode="tail"
            >
              {category.label}
            </Text>
          </>
        ) : (
          <Text
            style={[homeStyles.categoryAlphabetLetter, isSelected && homeStyles.selectedCategoryAlphabetLetter]}
            numberOfLines={1}
          >
            {category.label}
          </Text>
        )}
      </TouchableOpacity>
    </Animated.View>
  );
}

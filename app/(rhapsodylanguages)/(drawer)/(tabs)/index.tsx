import DailyRhapsodyCard from '@/components/home/DailyRhapsodyCard';
import PromotionalBanner from '@/components/home/PromotionalBanner';
import { SubscriptionStats } from '@/components/subscriptions/SubscriptionStats';
import CustomLoader from '@/components/ui/CustomLoader';
import { useThemeColors } from '@/hooks/use-themed-styles';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
  Alert,
  Animated,
  Dimensions,
  Linking,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { aboutStyles } from '../../../../assets/section-styles/about.styles';
import { carouselStyles } from '../../../../assets/section-styles/carousel.styles';
import { createCommonStyles } from '../../../../assets/section-styles/common.styles';
import { createUpcomingProgramStyles } from '../../../../assets/section-styles/upcoming-program.styles';
import { workforceStyles } from '../../../../assets/section-styles/workforce.styles';
import { RhapsodyLanguagesAPI } from '../../../../services/rhapsodylanguagesApi';

const { width: screenWidth } = Dimensions.get('window');

interface DynamicText {
  id: string;
  title: string;
}

interface UpcomingProgram {
  title: string;
  banner_src: string;
  link: string;
}

interface WorkforceCategory {
  id: number;
  categCardsImg: string;
  categCardsUrl: string;
}

export default function HomeScreen() {

  const colors = useThemeColors();
  const commonStyles = createCommonStyles(colors);
  const upcomingProgramStyles = createUpcomingProgramStyles(colors);
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [dynamicText, setDynamicText] = useState<DynamicText[]>([]);
  const [upcomingProgram, setUpcomingProgram] = useState<UpcomingProgram | null>(null);
  const [workforceCategories, setWorkforceCategories] = useState<WorkforceCategory[]>([]);
  const [showFullText, setShowFullText] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const scrollViewRef = useRef<ScrollView>(null);

  // Flip card animation states
  const [freeLanguagesFlipped, setFreeLanguagesFlipped] = useState(false);
  const [subscriptionLanguagesFlipped, setSubscriptionLanguagesFlipped] = useState(false);
  const freeLanguagesAnim = useRef(new Animated.Value(0)).current;
  const subscriptionLanguagesAnim = useRef(new Animated.Value(0)).current;

  const carouselImages = [
    'https://mediathek.tniglobal.org/images/rhapsody-intro-1.jpg',
    'https://mediathek.tniglobal.org/images/Rhapsody_Daily_Slides.jpg',
    'https://mediathek.tniglobal.org/images/Rhapsody_Languages_Catalogue.jpg',
  ];


  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % carouselImages.length);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (scrollViewRef.current) {
      scrollViewRef.current.scrollTo({
        x: currentSlide * screenWidth,
        animated: true,
      });
    }
  }, [currentSlide]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [dynamicTextResponse, upcomingProgramResponse, workforceCategoriesResponse] =
        await Promise.all([
          RhapsodyLanguagesAPI.fetchDynamicText(),
          RhapsodyLanguagesAPI.fetchUpcomingProgram(),
          RhapsodyLanguagesAPI.fetchWorkforceCategories(),
        ]);

      if (dynamicTextResponse) {
        setDynamicText(dynamicTextResponse);
      }
      if (upcomingProgramResponse) {
        setUpcomingProgram(upcomingProgramResponse);
      }
      if (workforceCategoriesResponse) {
        setWorkforceCategories(workforceCategoriesResponse);
      }
    } catch (error) {
      console.error('Error loading data:', error);
      Alert.alert('Error', 'Failed to load data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleReadMore = () => {
    setShowFullText(!showFullText);
  };

  const handleUpcomingProgramPress = async () => {
    if (upcomingProgram?.link) {
      try {
        await Linking.openURL('https://tniglobal.org/healingstreams');
      } catch (error) {
        Alert.alert('Error', 'Failed to open link');
      }
    }
  };

  // Flip card animation functions
  const flipFreeLanguagesCard = () => {
    console.log('Flipping free languages card, current state:', freeLanguagesFlipped);
    const toValue = freeLanguagesFlipped ? 0 : 1;
    Animated.timing(freeLanguagesAnim, {
      toValue,
      duration: 600,
      useNativeDriver: true,
    }).start(() => {
      console.log('Free languages card flip completed, new state:', !freeLanguagesFlipped);
    });
    setFreeLanguagesFlipped(!freeLanguagesFlipped);
  };

  const flipSubscriptionLanguagesCard = () => {
    console.log('Flipping subscription languages card, current state:', subscriptionLanguagesFlipped);
    const toValue = subscriptionLanguagesFlipped ? 0 : 1;
    Animated.timing(subscriptionLanguagesAnim, {
      toValue,
      duration: 600,
      useNativeDriver: true,
    }).start(() => {
      console.log('Subscription languages card flip completed, new state:', !subscriptionLanguagesFlipped);
    });
    setSubscriptionLanguagesFlipped(!subscriptionLanguagesFlipped);
  };

  const handleRegionsNavigation = () => {
    router.push('/(rhapsodylanguages)/(drawer)/regions/list');
  };

  const handleAlphabetNavigation = () => {
    router.push('/(rhapsodylanguages)/(drawer)/alphabet');
  };

  const handleSubscriptionNavigation = () => {
    router.push('/(rhapsodylanguages)/(drawer)/(tabs)/subscriptions');
  };

  // Language Categories Styles
  const languageCategoriesStyles = StyleSheet.create({
    sectionContainer: {
      paddingHorizontal: 20,
      paddingVertical: 24,
    },
    cardsContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      gap: 16,
    },
    cardContainer: {
      flex: 1,
      height: 180,
    },
    card: {
      width: '100%',
      height: '100%',
      position: 'relative',
    },
    cardSide: {
      position: 'absolute',
      width: '100%',
      height: '100%',
      backfaceVisibility: 'hidden',
      borderRadius: 16,
      overflow: 'hidden',
      backgroundColor: colors.card,
      shadowColor: colors.shadow,
      shadowOffset: {
        width: 0,
        height: 8,
      },
      shadowOpacity: 0.15,
      shadowRadius: 16,
      elevation: 8,
    },
    cardFront: {
      // No initial transform needed - handled by interpolation
    },
    cardBack: {
      transform: [{ rotateY: '180deg' }],
    },
    imageContainer: {
      flex: 1,
      overflow: 'hidden',
    },
    cardImage: {
      width: '100%',
      height: '100%',
    },
    titleContainer: {
      padding: 16,
      backgroundColor: colors.card,
      alignItems: 'center',
    },
    cardTitle: {
      fontSize: 18,
      fontFamily: 'BerkshireSwash_400Regular',
      fontWeight: 'bold',
      textAlign: 'center',
    },
    backContent: {
      flex: 1,
      flexDirection: 'column',
      padding: 16,
      gap: 12,
      alignItems: 'center',
      justifyContent: 'center',
    },
    backContentCenter: {
      flex: 1,
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      padding: 24,
    },
    miniCard: {
      width: '80%',
      height: 75,
      borderRadius: 12,
      overflow: 'hidden',
      marginBottom: 12,
    },
    miniCardGradient: {
      flex: 1,
      padding: 12,
      alignItems: 'center',
      justifyContent: 'center',
    },
    miniCardIcon: {
      marginBottom: 4,
    },
    miniCardText: {
      fontSize: 13,
      fontWeight: '600',
      textAlign: 'center',
      lineHeight: 16,
    },
    subscribeButton: {
      borderRadius: 16,
      overflow: 'hidden',
      width: '100%',
    },
    subscribeGradient: {
      paddingVertical: 10,
      paddingHorizontal: 22,
      alignItems: 'center',
      justifyContent: 'center',
    },
    subscribeButtonText: {
      color: '#FFFFFF',
      fontSize: 18,
      fontWeight: 'bold',
      textAlign: 'center',
    },
  });

  const renderCarousel = () => (
    <View style={carouselStyles.carouselContainer}>
      <ScrollView
        ref={scrollViewRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={(event) => {
          const slideIndex = Math.round(event.nativeEvent.contentOffset.x / screenWidth);
          setCurrentSlide(slideIndex);
        }}
      >
        {carouselImages.map((image, index) => (
          <Image
            key={index}
            source={{ uri: image }}
            style={carouselStyles.carouselImage}
            contentFit="fill"
          />
        ))}
      </ScrollView>
      <View style={carouselStyles.dotsContainer}>
        {carouselImages.map((_, index) => (
          <View
            key={index}
            style={[
              carouselStyles.dot,
              { backgroundColor: currentSlide === index ? '#007AFF' : '#C7C7CC' },
            ]}
          />
        ))}
      </View>
    </View>
  );

  const renderAboutSection = () => (
    <View style={aboutStyles.sectionContainer}>
      <Text style={commonStyles.rhapsLangSectionTitle}>Rhapsody Languages</Text>
      {dynamicText.length > 0 && (
        <View>
          <Text style={aboutStyles.paragraphText}>{dynamicText[0]?.title}</Text>
          {showFullText &&
            dynamicText.slice(1).map((item, index) => (
              <Text key={item.id || index} style={aboutStyles.paragraphText}>
                {item.title}
              </Text>
            ))}
          {dynamicText.length > 1 && (
            <TouchableOpacity style={aboutStyles.readMoreButton} onPress={handleReadMore}>
              <Text style={aboutStyles.readMoreText}>
                {showFullText ? 'Show less' : 'Read more'}
              </Text>
              <Ionicons
                name={showFullText ? 'chevron-up' : 'chevron-down'}
                size={16}
                color="#007AFF"
              />
            </TouchableOpacity>
          )}
        </View>
      )}
    </View>
  );

  const renderLanguageCategories = () => {
    const freeLanguagesFrontInterpolate = freeLanguagesAnim.interpolate({
      inputRange: [0, 1],
      outputRange: ['0deg', '180deg'],
    });
    
    const freeLanguagesBackInterpolate = freeLanguagesAnim.interpolate({
      inputRange: [0, 1],
      outputRange: ['180deg', '360deg'],
    });

    const subscriptionLanguagesFrontInterpolate = subscriptionLanguagesAnim.interpolate({
      inputRange: [0, 1],
      outputRange: ['0deg', '180deg'],
    });
    
    const subscriptionLanguagesBackInterpolate = subscriptionLanguagesAnim.interpolate({
      inputRange: [0, 1],
      outputRange: ['180deg', '360deg'],
    });

    return (
      <View style={languageCategoriesStyles.sectionContainer}>
        <Text style={[commonStyles.rhapsLangSectionTitle, { color: colors.tertiary }]}>
          Languages Categories
        </Text>
        
        <View style={languageCategoriesStyles.cardsContainer}>
          {/* Free Languages Card */}
          <View style={languageCategoriesStyles.cardContainer}>
            <TouchableOpacity
              style={languageCategoriesStyles.card}
              onPress={() => {
                console.log('Free languages card pressed!');
                flipFreeLanguagesCard();
              }}
              activeOpacity={1}
              delayPressIn={0}
            >
              {/* Front Side */}
              <Animated.View
                style={[
                  languageCategoriesStyles.cardSide,
                  languageCategoriesStyles.cardFront,
                  {
                    transform: [{ rotateY: freeLanguagesFrontInterpolate }],
                  },
                ]}
              >
                <View style={languageCategoriesStyles.imageContainer}>
                  <Image
                    source={{
                      uri: 'https://tniglobal.org/img/hub8.png',
                    }}
                    style={languageCategoriesStyles.cardImage}
                    contentFit="cover"
                  />
                </View>
                <View style={languageCategoriesStyles.titleContainer}>
                  <Text style={[
                    languageCategoriesStyles.cardTitle,
                    { color: colors.primary }
                  ]}>
                    Free Languages
                  </Text>
                </View>
              </Animated.View>

              {/* Back Side */}
              <Animated.View
                style={[
                  languageCategoriesStyles.cardSide,
                  languageCategoriesStyles.cardBack,
                  {
                    transform: [{ rotateY: freeLanguagesBackInterpolate }],
                  },
                ]}
                pointerEvents={freeLanguagesFlipped ? 'auto' : 'none'}
              >
                <View style={languageCategoriesStyles.backContent}>
                  <TouchableOpacity
                    style={languageCategoriesStyles.miniCard}
                    onPress={handleRegionsNavigation}
                    activeOpacity={0.7}
                  >
                    <LinearGradient
                      colors={[colors.primary || '#3B82F6', colors.secondary || '#10B981']}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      style={languageCategoriesStyles.miniCardGradient}
                    >
                      <Ionicons
                        name="globe-outline"
                        size={32}
                        color="#FFFFFF"
                        style={languageCategoriesStyles.miniCardIcon}
                      />
                      <Text style={[
                        languageCategoriesStyles.miniCardText,
                        { color: '#FFFFFF' }
                      ]}>
                        Languages by Regions
                      </Text>
                    </LinearGradient>
                  </TouchableOpacity>
                  
                  <TouchableOpacity
                    style={languageCategoriesStyles.miniCard}
                    onPress={handleAlphabetNavigation}
                    activeOpacity={0.7}
                  >
                    <LinearGradient
                      colors={[colors.secondary || '#10B981', colors.tertiary || colors.primary]}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      style={languageCategoriesStyles.miniCardGradient}
                    >
                      <Ionicons
                        name="library-outline"
                        size={32}
                        color="#FFFFFF"
                        style={languageCategoriesStyles.miniCardIcon}
                      />
                      <Text style={[
                        languageCategoriesStyles.miniCardText,
                        { color: '#FFFFFF' }
                      ]}>
                        Languages by Alphabet
                      </Text>
                    </LinearGradient>
                  </TouchableOpacity>
                </View>
              </Animated.View>
            </TouchableOpacity>
          </View>

          {/* Subscription Languages Card */}
          <View style={languageCategoriesStyles.cardContainer}>
            <TouchableOpacity
              style={languageCategoriesStyles.card}
              onPress={() => {
                console.log('Subscription languages card pressed!');
                flipSubscriptionLanguagesCard();
              }}
              activeOpacity={1}
              delayPressIn={0}
            >
              {/* Front Side */}
              <Animated.View
                style={[
                  languageCategoriesStyles.cardSide,
                  languageCategoriesStyles.cardFront,
                  {
                    transform: [{ rotateY: subscriptionLanguagesFrontInterpolate }],
                  },
                ]}
              >
                <View style={languageCategoriesStyles.imageContainer}>
                  <Image
                    source={{
                      uri: 'https://tniglobal.org/img/hub1.jpg',
                    }}
                    style={languageCategoriesStyles.cardImage}
                    contentFit="fill"
                  />
                </View>
                <View style={languageCategoriesStyles.titleContainer}>
                  <Text style={[
                    languageCategoriesStyles.cardTitle,
                    { color: colors.primary }
                  ]}>
                    Subscriptions
                  </Text>
                </View>
              </Animated.View>

              {/* Back Side */}
              <Animated.View
                style={[
                  languageCategoriesStyles.cardSide,
                  languageCategoriesStyles.cardBack,
                  {
                    transform: [{ rotateY: subscriptionLanguagesBackInterpolate }],
                  },
                ]}
                pointerEvents={subscriptionLanguagesFlipped ? 'auto' : 'none'}
              >
                <View style={languageCategoriesStyles.backContentCenter}>
                  <TouchableOpacity
                    style={languageCategoriesStyles.subscribeButton}
                    onPress={handleSubscriptionNavigation}
                    activeOpacity={0.8}
                  >
                    <LinearGradient
                      colors={[colors.primary || '#3B82F6', colors.secondary || '#10B981']}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                      style={languageCategoriesStyles.subscribeGradient}
                    >
                      <Text style={languageCategoriesStyles.subscribeButtonText}>
                        Subscribe Now
                      </Text>
                    </LinearGradient>
                  </TouchableOpacity>
                </View>
              </Animated.View>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };

  const renderUpcomingPrograms = () => {

    if (!upcomingProgram) return null;

    return (
      <View style={upcomingProgramStyles.sectionContainer}>
        <Text style={commonStyles.rhapsLangSectionTitle}>Upcoming Programs</Text>
        <View style={upcomingProgramStyles.programCard}>
          <Image
            source={{ uri: upcomingProgram.banner_src }}
            style={upcomingProgramStyles.programImage}
            contentFit="fill"
          />
          <View style={upcomingProgramStyles.programContent}>
            <Text style={upcomingProgramStyles.programTitle}>{upcomingProgram.title}</Text>
            <TouchableOpacity
              style={upcomingProgramStyles.ctaButton}
              onPress={handleUpcomingProgramPress}
              activeOpacity={0.8}
            >
              <Ionicons name="calendar" size={20} color={colors.background} style={{ marginRight: 8 }} />
              <Text style={upcomingProgramStyles.ctaButtonText}>Register now</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };  

    
  const renderWorkforceSection = () => (
    <View style={workforceStyles.sectionContainer}>
      <Text style={commonStyles.rhapsLangSectionTitle}>TNI Workforce Categories</Text>
      <View style={workforceStyles.workforceGrid}>
        {workforceCategories.slice(0, 6).map((category, index) => (
          <View key={index} style={workforceStyles.workforceCard}>
            <Image
              source={{ uri: category.categCardsImg }}
              style={workforceStyles.workforceImage}
              contentFit="fill"
            />
          </View>
        ))}
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={commonStyles.loadingContainer}>
        <CustomLoader size="large" message="Loading..." />
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      <ScrollView style={commonStyles.container} showsVerticalScrollIndicator={false}>
        {renderCarousel()}
        <PromotionalBanner />
        <DailyRhapsodyCard />
        <SubscriptionStats />
        {renderAboutSection()}
        {renderLanguageCategories()}
        {renderUpcomingPrograms()}
        {renderWorkforceSection()}
      </ScrollView>
    </View>
  );
}

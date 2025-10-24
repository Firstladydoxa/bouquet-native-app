import { createHomeStyles } from "@/assets/styles/home.themed.styles";
import CategoryFilter from "@/components/recipeapp/CategoryFilter";
import CustomLoader from "@/components/ui/CustomLoader";
import { useAuth, useSubscription } from "@/contexts";
import { useThemeColors, useThemedStyles } from "@/hooks/use-themed-styles";
import { RhapsodyLanguagesAPI } from "@/services/rhapsodylanguagesApi";
import { RhapsodyLanguage } from "@/types";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { LinearGradient } from 'expo-linear-gradient';
import * as Linking from 'expo-linking';
import { useRouter } from "expo-router";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { FlatList, RefreshControl, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";


const rhapsodyByRegionCardImage = 'https://mediathek.tniglobal.org/images/rhapsody-by-country.jpg';
const rhapsodyByAlphabetCardImage = 'https://mediathek.tniglobal.org/images/rhapsody-by-name.jpg';

const alphabet = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'];

// Convert alphabet array to objects that CategoryFilter expects
const alphabetCategories = alphabet.map(letter => ({
  id: letter,
  label: letter,
  flag_link: '', // No flag for letters
}));

const LanguagesByAlphabetScreen = () => {
    
    const router = useRouter();
    const { user } = useAuth();
    const { hasSubscription, subscriptionDetails } = useSubscription();

    const [letters, setLetters] = useState<string[]>(alphabet);
    const [selectedLetter, setSelectedLetter] = useState('');
    const [languagesData, setLanguagesData] = useState<RhapsodyLanguage[]>([]);
    const [languages, setLanguages] = useState<RhapsodyLanguage[]>([]);
    const [expandedLanguage, setExpandedLanguage] = useState<string | null>(null);

    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [filteringLanguages, setFilteringLanguages] = useState(false);

    // Use themed styles and colors
    const homeStyles = useThemedStyles(createHomeStyles);
    const colors = useThemeColors();
    const accordionStyles = createAccordionStyles(colors);

    // Create an indexed map for faster lookups
    const languagesMap = useMemo(() => {
        const map = new Map<string, RhapsodyLanguage[]>();
        languagesData.forEach((lang) => {
            const firstLetter = lang.label.charAt(0).toUpperCase();
            if (!map.has(firstLetter)) {
                map.set(firstLetter, []);
            }
            map.get(firstLetter)!.push(lang);
        });
        return map;
    }, [languagesData]);

    const loadData = async () => {
        try {
            setLoading(true);
            
            const [languagesList] = await Promise.all([
                RhapsodyLanguagesAPI.fetchRorlanguagesByName(),
            ]);

            if (languagesList) {
                setLanguagesData(languagesList);
                handleLetterSelect(alphabet[0]); // Default to first letter
            }

        } catch (error) {
            console.log("Error loading the data", error);
        } finally {
            setLoading(false);
        }
    };

    // Load data when region parameter changes
    useEffect(() => {
        loadData();
    }, []);
            
   

    const handleLetterSelect = useCallback((letter: string) => {
        setFilteringLanguages(true);
        setSelectedLetter(letter);
        
        // Use requestAnimationFrame for smooth UI updates
        requestAnimationFrame(() => {
            // Use the indexed map for O(1) lookup instead of O(n) filter
            const filteredLanguages = languagesMap.get(letter) || [];
            setLanguages(filteredLanguages);
            setFilteringLanguages(false);
        });
    }, [languagesMap]);

    const onRefresh = async () => {
        setRefreshing(true);
        await loadData();
        setRefreshing(false);
    };

    const toggleAccordion = useCallback((languageLabel: string) => {
        setExpandedLanguage(prev => prev === languageLabel ? null : languageLabel);
    }, []);

    const handleJoinNetwork = useCallback(async () => {
        try {
            await Linking.openURL('https://tniglobal.org/join-the-network.php');
        } catch (error) {
            console.error('Error opening URL:', error);
        }
    }, []);

    const renderLanguageAccordion = useCallback(({ item }: { item: RhapsodyLanguage }) => {
        const isExpanded = expandedLanguage === item.label;
        const isOpen = item.type === 'open';
        const isSubscription = item.type === 'subscription';
        const hasMatchingSubscription = hasSubscription && subscriptionDetails?.language?.includes(item.label);
        
        return (
            <View style={accordionStyles.accordionContainer}>
                <TouchableOpacity
                    style={accordionStyles.accordionHeader}
                    onPress={() => toggleAccordion(item.label)}
                    activeOpacity={0.7}
                >
                    <Text style={accordionStyles.accordionTitle}>{item.label}</Text>
                    <Ionicons
                        name={isExpanded ? "chevron-up" : "chevron-down"}
                        size={24}
                        color={colors.primary}
                    />
                </TouchableOpacity>

                {isExpanded && (
                    <View style={accordionStyles.accordionContent}>
                        {/* Join Network Button - Always visible */}
                        <TouchableOpacity
                            style={[accordionStyles.actionButton, { backgroundColor: colors.secondary }]}
                            onPress={handleJoinNetwork}
                            activeOpacity={0.8}
                        >
                            <Ionicons name="people-outline" size={20} color="#FFFFFF" />
                            <Text style={accordionStyles.buttonText}>Join the Network</Text>
                        </TouchableOpacity>

                        {/* For Open Languages - Show all buttons */}
                        {isOpen && (
                            <>
                                <TouchableOpacity
                                    style={[accordionStyles.actionButton, { backgroundColor: colors.primary }]}
                                    onPress={() => router.push(`/read/${encodeURIComponent(item.label)}` as any)}
                                    activeOpacity={0.8}
                                >
                                    <Ionicons name="book-outline" size={20} color="#FFFFFF" />
                                    <Text style={accordionStyles.buttonText}>Read</Text>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    style={[accordionStyles.actionButton, { backgroundColor: colors.tertiary || '#FF6F00' }]}
                                    onPress={() => router.push(`/listen/${encodeURIComponent(item.label)}` as any)}
                                    activeOpacity={0.8}
                                >
                                    <Ionicons name="headset-outline" size={20} color="#FFFFFF" />
                                    <Text style={accordionStyles.buttonText}>Listen</Text>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    style={[accordionStyles.actionButton, { backgroundColor: colors.success || '#4CAF50' }]}
                                    onPress={() => router.push(`/download/${encodeURIComponent(item.label)}` as any)}
                                    activeOpacity={0.8}
                                >
                                    <Ionicons name="download-outline" size={20} color="#FFFFFF" />
                                    <Text style={accordionStyles.buttonText}>Download</Text>
                                </TouchableOpacity>
                            </>
                        )}

                        {/* For Subscription Languages */}
                        {isSubscription && (
                            <>
                                {!hasSubscription ? (
                                    // User has no subscription
                                    <View style={accordionStyles.alertCard}>
                                        <View style={accordionStyles.alertHeader}>
                                            <Ionicons name="information-circle" size={24} color={colors.warning || '#FF9800'} />
                                            <Text style={accordionStyles.alertTitle}>Subscription Required</Text>
                                        </View>
                                        <Text style={accordionStyles.alertText}>
                                            This language is a subscription language. Subscribe to get access to Rhapsody in this language.
                                        </Text>
                                        <TouchableOpacity
                                            style={accordionStyles.alertButton}
                                            onPress={() => router.push('/(rhapsodylanguages)/(drawer)/(tabs)/subscriptions')}
                                            activeOpacity={0.8}
                                        >
                                            <LinearGradient
                                                colors={[colors.primary || '#3B82F6', colors.secondary || '#10B981']}
                                                start={{ x: 0, y: 0 }}
                                                end={{ x: 1, y: 0 }}
                                                style={accordionStyles.gradientButton}
                                            >
                                                <Ionicons name="card-outline" size={20} color="#FFFFFF" />
                                                <Text style={accordionStyles.alertButtonText}>Go to Subscription Page</Text>
                                            </LinearGradient>
                                        </TouchableOpacity>
                                    </View>
                                ) : hasMatchingSubscription ? (
                                    // User has matching subscription
                                    <>
                                        <TouchableOpacity
                                            style={[accordionStyles.actionButton, { backgroundColor: colors.primary}]}
                                            onPress={() => router.push(`/read/${encodeURIComponent(item.label)}` as any)}
                                            activeOpacity={0.8}
                                        >
                                            <Ionicons name="book-outline" size={20} color="#FFFFFF" />
                                            <Text style={accordionStyles.buttonText}>Read</Text>
                                        </TouchableOpacity>

                                        <TouchableOpacity
                                            style={[accordionStyles.actionButton, { backgroundColor: colors.tertiary || '#FF6F00' }]}
                                            onPress={() => router.push(`/listen/${encodeURIComponent(item.label)}` as any)}
                                            activeOpacity={0.8}
                                        >
                                            <Ionicons name="headset-outline" size={20} color="#FFFFFF" />
                                            <Text style={accordionStyles.buttonText}>Listen</Text>
                                        </TouchableOpacity>

                                        <TouchableOpacity
                                            style={[accordionStyles.actionButton, { backgroundColor: colors.success || '#4CAF50' }]}
                                            onPress={() => router.push(`/download/${encodeURIComponent(item.label)}` as any)}
                                            activeOpacity={0.8}
                                        >
                                            <Ionicons name="download-outline" size={20} color="#FFFFFF" />
                                            <Text style={accordionStyles.buttonText}>Download</Text>
                                        </TouchableOpacity>
                                    </>
                                ) : (
                                    // User has subscription but not for this language
                                    <View style={accordionStyles.alertCard}>
                                        <View style={accordionStyles.alertHeader}>
                                            <Ionicons name="add-circle" size={24} color={colors.info || '#2196F3'} />
                                            <Text style={accordionStyles.alertTitle}>Additional Language</Text>
                                        </View>
                                        <Text style={accordionStyles.alertText}>
                                            Add this language to your subscription to access Rhapsody in {item.label}.
                                        </Text>
                                        <TouchableOpacity
                                            style={accordionStyles.alertButton}
                                            onPress={() => router.push(`/(rhapsodylanguages)/(drawer)/(tabs)/subscriptions/buy?language=${encodeURIComponent(item.label)}` as any)}
                                            activeOpacity={0.8}
                                        >
                                            <LinearGradient
                                                colors={[colors.info || '#2196F3', colors.primary || '#3B82F6']}
                                                start={{ x: 0, y: 0 }}
                                                end={{ x: 1, y: 0 }}
                                                style={accordionStyles.gradientButton}
                                            >
                                                <Ionicons name="cart-outline" size={20} color="#FFFFFF" />
                                                <Text style={accordionStyles.alertButtonText}>Buy Additional Language</Text>
                                            </LinearGradient>
                                        </TouchableOpacity>
                                    </View>
                                )}
                            </>
                        )}
                    </View>
                )}
            </View>
        );
    }, [expandedLanguage, hasSubscription, subscriptionDetails, toggleAccordion, handleJoinNetwork, router, colors, accordionStyles]);

    if (loading && !refreshing) return <CustomLoader message="Loading languages..." size="large" />;

    return (
        <View style={homeStyles.container}>
           
            <ScrollView
                showsVerticalScrollIndicator={false}
                refreshControl={
                <RefreshControl
                    refreshing={refreshing}
                    onRefresh={onRefresh}
                    tintColor={colors.primary}
                />
                }
                contentContainerStyle={homeStyles.scrollContent}
            >

                {/* HERO SECTION */}
                {rhapsodyByRegionCardImage && (
                    <View style={homeStyles.heroSection}>
                        <Image
                            source={{ uri: rhapsodyByAlphabetCardImage }}
                            style={homeStyles.heroImage}
                            contentFit="cover"
                            transition={1000}
                        />
                    </View>
                )}

                {/* CATEGORY FILTER SECTION */}
                {alphabetCategories.length > 0 && (
                    <>
                        <View style={homeStyles.sectionHeader}>
                            <Text style={homeStyles.sectionTitle}> Select letter to view the languages</Text>
                        </View>
                        
                        <CategoryFilter
                            categories={alphabetCategories}
                            selectedCategory={selectedLetter}
                            onSelectCategory={handleLetterSelect}
                        />
                    </>
                )}

                {/* LANGUAGES ACCORDION SECTION */}
                <View style={homeStyles.recipesSection}>
                    <View style={homeStyles.sectionHeader}>
                        <Text style={homeStyles.sectionTitle}>Languages starting with "{selectedLetter}"</Text>
                    </View>

                    {filteringLanguages ? (
                        <View style={{ paddingVertical: 40, alignItems: 'center' }}>
                            <CustomLoader message={`Loading ${selectedLetter} languages...`} size="medium" />
                        </View>
                    ) : languages.length > 0 ? (
                        <FlatList
                            data={languages}
                            renderItem={renderLanguageAccordion}
                            keyExtractor={(item, index) => item.label + index.toString()}
                            contentContainerStyle={homeStyles.recipesGrid}
                            scrollEnabled={false}
                            removeClippedSubviews={true}
                            maxToRenderPerBatch={10}
                            updateCellsBatchingPeriod={50}
                            initialNumToRender={10}
                            windowSize={5}
                        />
                    ) : (
                        <View style={homeStyles.emptyState}>
                            <Ionicons name="language-outline" size={64} color={colors.textLight} />
                            <Text style={homeStyles.emptyTitle}>No languages found</Text>
                            <Text style={homeStyles.emptyDescription}>Try a different alphabet letter</Text>
                        </View>
                    )}
                </View>
            </ScrollView>
        </View>
    );

};
export default LanguagesByAlphabetScreen;

const createAccordionStyles = (colors: any) => StyleSheet.create({
    headerContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: colors.card,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
    },
    backButton: {
        marginRight: 12,
        padding: 8,
        borderRadius: 20,
        backgroundColor: colors.primary + '15',
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: colors.secondary,
        flex: 1,
    },
    accordionContainer: {
        backgroundColor: colors.card,
        borderRadius: 12,
        marginBottom: 12,
        shadowColor: colors.shadow,
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
        overflow: 'hidden',
    },
    accordionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
    },
    accordionTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: colors.text,
        flex: 1,
    },
    accordionContent: {
        padding: 16,
        gap: 12,
    },
    actionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 14,
        borderRadius: 20,
        gap: 8,
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
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '600',
    },
    alertCard: {
        backgroundColor: colors.background,
        borderRadius: 16,
        padding: 16,
        borderWidth: 1,
        borderColor: colors.border,
        marginTop: 8,
    },
    alertHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 12,
    },
    alertTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: colors.text,
    },
    alertText: {
        fontSize: 14,
        color: colors.textLight,
        lineHeight: 20,
        marginBottom: 16,
    },
    alertButton: {
        borderRadius: 20,
        overflow: 'hidden',
        shadowColor: colors.shadow,
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 6,
    },
    gradientButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 14,
        gap: 8,
    },
    alertButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '600',
    },
});

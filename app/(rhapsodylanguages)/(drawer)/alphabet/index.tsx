import { createHomeStyles } from "@/assets/styles/home.themed.styles";
import CategoryFilter from "@/components/recipeapp/CategoryFilter";
import { LanguageActions } from "@/components/rhapsodylanguages/LanguageActions";
import CustomLoader from "@/components/ui/CustomLoader";
import { useAuth } from "@/contexts";
import { useThemeColors, useThemedStyles } from "@/hooks/use-themed-styles";
import { RhapsodyLanguagesAPI } from "@/services/rhapsodylanguagesApi";
import { useSubscriptionService } from "@/services/subscriptionService";
import { RhapsodyLanguage } from "@/types";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { FlatList, RefreshControl, ScrollView, Text, TextInput, TouchableOpacity, View } from "react-native";


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
    const subscriptionService = useSubscriptionService();

    const [letters, setLetters] = useState<string[]>(alphabet);
    const [selectedLetter, setSelectedLetter] = useState('');
    const [languagesData, setLanguagesData] = useState<RhapsodyLanguage[]>([]);
    const [languages, setLanguages] = useState<RhapsodyLanguage[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [expandedLanguage, setExpandedLanguage] = useState<string | null>(null);

    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [filteringLanguages, setFilteringLanguages] = useState(false);

    // Use themed styles and colors
    const homeStyles = useThemedStyles(createHomeStyles);
    const colors = useThemeColors();

    // Filter languages based on search query
    const filteredLanguages = useMemo(() => {
        if (!searchQuery.trim()) {
            return languages;
        }
        return languages.filter(lang => 
            lang.label.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [languages, searchQuery]);

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

            if (languagesList && languagesList.length > 0) {
                setLanguagesData(languagesList);
                
                // Auto-select first letter and set languages directly
                const firstLetter = alphabet[0];
                const firstLetterLanguages = languagesList.filter(
                    (lang: RhapsodyLanguage) => lang.label.charAt(0).toUpperCase() === firstLetter
                );
                
                setSelectedLetter(firstLetter);
                setLanguages(firstLetterLanguages);
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

    const renderLanguageAccordion = useCallback(({ item }: { item: RhapsodyLanguage }) => {
        const isExpanded = expandedLanguage === item.label;
        
        return (
            <LanguageActions
                language={item}
                isExpanded={isExpanded}
                onToggle={() => toggleAccordion(item.label)}
            />
        );
    }, [expandedLanguage, toggleAccordion]);
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

                    {/* Search Input */}
                    {languages.length > 0 && (
                        <View style={{
                            flexDirection: 'row',
                            alignItems: 'center',
                            backgroundColor: colors.card,
                            borderRadius: 12,
                            paddingHorizontal: 16,
                            paddingVertical: 12,
                            marginHorizontal: 16,
                            marginBottom: 16,
                            borderWidth: 1,
                            borderColor: colors.border,
                        }}>
                            <Ionicons 
                                name="search" 
                                size={20} 
                                color={colors.textLight} 
                                style={{ marginRight: 8 }} 
                            />
                            <TextInput
                                style={{ 
                                    color: colors.text,
                                    flex: 1,
                                    fontSize: 16,
                                }}
                                placeholder="Search languages..."
                                placeholderTextColor={colors.textLight}
                                value={searchQuery}
                                onChangeText={setSearchQuery}
                            />
                            {searchQuery.length > 0 && (
                                <TouchableOpacity onPress={() => setSearchQuery('')}>
                                    <Ionicons name="close-circle" size={20} color={colors.textLight} />
                                </TouchableOpacity>
                            )}
                        </View>
                    )}

                    {filteringLanguages ? (
                        <View style={{ paddingVertical: 40, alignItems: 'center' }}>
                            <CustomLoader message={`Loading ${selectedLetter} languages...`} size="medium" />
                        </View>
                    ) : filteredLanguages.length > 0 ? (
                        <FlatList
                            data={filteredLanguages}
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
                    ) : searchQuery.length > 0 ? (
                        <View style={homeStyles.emptyState}>
                            <Ionicons name="search-outline" size={64} color={colors.textLight} />
                            <Text style={homeStyles.emptyTitle}>No results found</Text>
                            <Text style={homeStyles.emptyDescription}>
                                No languages match "{searchQuery}"
                            </Text>
                        </View>
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

import { createHomeStyles } from "@/assets/styles/home.themed.styles";
import CategoryFilter from "@/components/recipeapp/CategoryFilter";
import { LanguageActions } from "@/components/rhapsodylanguages/LanguageActions";
import CustomLoader from "@/components/ui/CustomLoader";
import { useAuth } from "@/contexts";
import { useThemeColors, useThemedStyles } from "@/hooks/use-themed-styles";
import { RhapsodyLanguagesAPI } from "@/services/rhapsodylanguagesApi";
import { useSubscriptionService } from "@/services/subscriptionService";
import { CountryData, RhapsodyLanguage } from "@/types";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import { FlatList, RefreshControl, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";


const rhapsodyByRegionCardImage = 'https://mediathek.tniglobal.org/images/rhapsody-by-country.jpg';
const rhapsodyByAlphabetCardImage = 'https://mediathek.tniglobal.org/images/rhapsody-by-name.jpg';

const LanguagesByCountryScreen = () => {
    
    const router = useRouter();
    const { user } = useAuth();
    const subscriptionService = useSubscriptionService();
    const { region } = useLocalSearchParams<{ region: string }>();
    const [countries, setCountries] = useState<CountryData[]>([]);

    const [selectedCountry, setSelectedCountry] = useState('');
    const [languages, setLanguages] = useState<RhapsodyLanguage[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [expandedLanguage, setExpandedLanguage] = useState<string | null>(null);

    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    // Filter languages based on search query
    const filteredLanguages = useMemo(() => {
        if (!searchQuery.trim()) {
            return languages;
        }
        return languages.filter(lang => 
            lang.label.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [languages, searchQuery]);

    // Use themed styles and colors
    const homeStyles = useThemedStyles(createHomeStyles);
    const colors = useThemeColors();
    
    const styles = StyleSheet.create({
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
            fontSize: 20,
            fontWeight: '700',
            color: colors.text,
        },
    });

    const loadData = async () => {
        try {
            setLoading(true);

            const [countriesList] = await Promise.all([
                RhapsodyLanguagesAPI.fetchCountriesByRegion(region),
            ]);

            if (countriesList && countriesList.length > 0) {
                setCountries(countriesList);
                // Auto-select first country and set its languages
                setSelectedCountry(countriesList[0].label);
                setLanguages(countriesList[0].languages);
            }

        } catch (error) {
            console.log("Error loading the data", error);
        } finally {
            setLoading(false);
        }
    };

    // Load data when region parameter changes
    useEffect(() => {
        if (region) {
            loadData();
        }
    }, [region]);
    

    const handleCountrySelect = async (countryLabel: string) => {
        
        setSelectedCountry(countryLabel);
        const findCountry = countries.find((country) => country.label === countryLabel);
        if (findCountry) {
            setLanguages(findCountry.languages);
        }
    };

    const onRefresh = async () => {
        setRefreshing(true);
        await loadData();
        setRefreshing(false);
    };

    const toggleAccordion = (languageLabel: string) => {
        setExpandedLanguage(expandedLanguage === languageLabel ? null : languageLabel);
    };

    const renderLanguageAccordion = ({ item }: { item: RhapsodyLanguage }) => {
        const isExpanded = expandedLanguage === item.label;
        
        return (
            <LanguageActions
                language={item}
                isExpanded={isExpanded}
                onToggle={() => toggleAccordion(item.label)}
            />
        );
    };

    useEffect(() => {
        loadData();
    }, []);

    if (loading && !refreshing) return <CustomLoader message="Loading languages..." size="large" />;

    return (
        <View style={homeStyles.container}>
            {/* Back Button Header */}
            <View style={styles.headerContainer}>
                <TouchableOpacity 
                    onPress={() => router.push("/(rhapsodylanguages)/(drawer)/regions/list")}
                    style={styles.backButton}
                    activeOpacity={0.7}
                >
                    <Ionicons name="arrow-back" size={24} color={colors.primary} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Languages in {decodeURIComponent(region)}</Text>
            </View>

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
                            source={{ uri: rhapsodyByRegionCardImage }}
                            style={homeStyles.heroImage}
                            contentFit="cover"
                            transition={1000}
                        />
                    </View>
                )}

                {countries.length > 0 && (
                    <>
                        <View style={homeStyles.sectionHeader}>
                            <Text style={homeStyles.sectionTitle}> Select country to view the languages</Text>
                        </View>
                        
                        <CategoryFilter
                            categories={countries}
                            selectedCategory={selectedCountry}
                            onSelectCategory={handleCountrySelect}
                        />
                    </>
                )}

                <View style={homeStyles.recipesSection}>
                    <View style={homeStyles.sectionHeader}>
                        <Text style={homeStyles.sectionTitle}>{selectedCountry}</Text>
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

                    {countries.length > 0 ? (
                        filteredLanguages.length > 0 ? (
                            <FlatList
                                data={filteredLanguages}
                                renderItem={renderLanguageAccordion}
                                keyExtractor={(item) => item.label}
                                contentContainerStyle={homeStyles.recipesGrid}
                                scrollEnabled={false}
                            />
                        ) : (
                            <View style={homeStyles.emptyState}>
                                <Ionicons name="search-outline" size={64} color={colors.textLight} />
                                <Text style={homeStyles.emptyTitle}>No results found</Text>
                                <Text style={homeStyles.emptyDescription}>
                                    No languages match "{searchQuery}"
                                </Text>
                            </View>
                        )
                    ) : (
                        <View style={homeStyles.emptyState}>
                            <Ionicons name="language-outline" size={64} color={colors.textLight} />
                            <Text style={homeStyles.emptyTitle}>No languages found</Text>
                            <Text style={homeStyles.emptyDescription}>Try a different country</Text>
                        </View>
                    )}
                </View>
            </ScrollView>
        </View>
    );

};
export default LanguagesByCountryScreen;

// Example of how to refactor existing screens to use the new theming system
import { createHomeStyles } from "@/assets/styles/home.themed.styles";
import CategoryFilter from "@/components/recipeapp/CategoryFilter";
import LoadingSpinner from "@/components/recipeapp/LoadingSpinner";
import { useThemeColors, useThemedStyles } from "@/hooks/use-themed-styles";
import { RhapsodyLanguagesAPI } from "@/services/rhapsodylanguagesApi";
import { CountryData, RhapsodyLanguage } from "@/types";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { FlatList, RefreshControl, ScrollView, Text, View } from "react-native";

const rhapsodyByRegionCardImage = 'https://mediathek.tniglobal.org/images/rhapsody-by-country.jpg';

const LanguagesByCountryScreenThemed = () => {
    
    const router = useRouter();
    const { region } = useLocalSearchParams<{ region: string }>();
    const [countries, setCountries] = useState<CountryData[]>([]);

    const [selectedCountry, setSelectedCountry] = useState('');
    const [languages, setLanguages] = useState<RhapsodyLanguage[]>([]);

    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    // Use themed styles instead of static styles
    const colors = useThemeColors();
    const homeStyles = useThemedStyles(createHomeStyles);

    const loadData = async () => {
        try {
            setLoading(true);

            const [countriesList] = await Promise.all([
                RhapsodyLanguagesAPI.fetchCountriesByRegion(region),
            ]);

            if (countriesList) {
                setCountries(countriesList);
            }

        } catch (error) {
            console.log("Error loading the data", error);
        } finally {
            setLoading(false);
        }
    };
    

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

    useEffect(() => {
        loadData();
    }, []);

    if (loading && !refreshing) return <LoadingSpinner message="Loading delicious recipes..." />;

    return (
        <View style={homeStyles.container}>
            <ScrollView
                showsVerticalScrollIndicator={false}
                refreshControl={
                <RefreshControl
                    refreshing={refreshing}
                    onRefresh={onRefresh}
                    tintColor={colors.primary} // Use theme color instead of COLORS.primary
                />
                }
                contentContainerStyle={homeStyles.scrollContent}
            >

                {/* HERO SECTION with themed styles */}
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

                    {countries.length > 0 ? (
                        <FlatList
                            data={languages}
                            renderItem={({ item }) => <Text style={{ color: colors.text }}>{item.label}</Text>}
                            keyExtractor={(item) => item.label}
                            numColumns={2}
                            columnWrapperStyle={homeStyles.row}
                            contentContainerStyle={homeStyles.recipesGrid}
                            scrollEnabled={false}
                        />
                    ) : (
                        <View style={homeStyles.emptyState}>
                            <Ionicons name="restaurant-outline" size={64} color={colors.textLight} />
                            <Text style={homeStyles.emptyTitle}>No recipes found</Text>
                            <Text style={homeStyles.emptyDescription}>Try a different category</Text>
                        </View>
                    )}
                </View>
            </ScrollView>
        </View>
    );

};

export default LanguagesByCountryScreenThemed;